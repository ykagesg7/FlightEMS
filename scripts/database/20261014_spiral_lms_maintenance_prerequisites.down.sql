-- Rollback: 20261014_spiral_lms_maintenance_prerequisites.sql
-- Run before 20261013_spiral_lms_mini_quiz_version_pass.down.sql (see scripts/database/INDEX.md).
--
-- Clears MAINTENANCE rows first so post-down RPCs (MASTERED-only gates) do not strand nodes.

BEGIN;

UPDATE public.user_progress
SET
  status = 'MASTERED',
  maintenance_since = NULL,
  maintenance_cleared_at = NULL
WHERE status = 'MAINTENANCE';

DROP FUNCTION IF EXISTS private.spiral_lms_apply_maintenance_prerequisites(uuid, text);
DROP FUNCTION IF EXISTS private.spiral_lms_maintenance_recovery_met(uuid, text);
DROP FUNCTION IF EXISTS private.spiral_lms_two_consecutive_failed_attempts(uuid, text);

CREATE OR REPLACE FUNCTION private.spiral_lms_published_prerequisites_met(
  p_user_id uuid,
  p_node_id text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.node_prerequisites np
    INNER JOIN public.nodes prereq ON prereq.id = np.prerequisite_node_id
    WHERE np.node_id = p_node_id
      AND prereq.is_published = true
      AND NOT EXISTS (
        SELECT 1
        FROM public.user_progress up
        WHERE up.user_id = p_user_id
          AND up.node_id = np.prerequisite_node_id
          AND up.status = 'MASTERED'
      )
  );
$$;

CREATE OR REPLACE FUNCTION private.spiral_lms_z_level_gate_met(
  p_user_id uuid,
  p_z_level smallint
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN p_z_level <= 1 THEN true
    ELSE NOT EXISTS (
      SELECT 1
      FROM public.nodes n
      WHERE n.is_published = true
        AND n.z_level = p_z_level - 1
        AND coalesce(n.unlock_config->>'exclude_from_z_gate', '') <> 'true'
        AND NOT EXISTS (
          SELECT 1
          FROM public.user_progress up
          WHERE up.user_id = p_user_id
            AND up.node_id = n.id
            AND up.status = 'MASTERED'
        )
    )
  END;
$$;

CREATE OR REPLACE FUNCTION private.spiral_lms_recompute_node_progress(
  p_user_id uuid,
  p_node_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_node public.nodes%ROWTYPE;
  v_status text;
  v_mastered boolean;
  v_locked boolean;
  v_skip_z_gate boolean;
  v_prev_attempts integer;
  v_prev_status text;
BEGIN
  SELECT * INTO v_node
  FROM public.nodes
  WHERE id = p_node_id;

  IF NOT FOUND OR v_node.is_published IS NOT TRUE THEN
    RETURN;
  END IF;

  SELECT status, attempts
  INTO v_prev_status, v_prev_attempts
  FROM public.user_progress
  WHERE user_id = p_user_id
    AND node_id = p_node_id;

  IF v_prev_status = 'MAINTENANCE' THEN
    RETURN;
  END IF;

  v_skip_z_gate := coalesce(v_node.unlock_config->>'z_level_gate', '') = 'off';

  v_locked := (
    v_node.opens_at IS NOT NULL
    AND v_node.opens_at > now()
  )
  OR NOT private.spiral_lms_published_prerequisites_met(p_user_id, p_node_id)
  OR (
    NOT v_skip_z_gate
    AND NOT private.spiral_lms_z_level_gate_met(p_user_id, v_node.z_level)
  );

  v_mastered := (
    NOT v_locked
    AND private.spiral_lms_required_content_met(p_user_id, p_node_id)
    AND private.spiral_lms_mini_quiz_met(p_user_id, p_node_id)
  );

  IF v_locked THEN
    v_status := 'LOCKED';
  ELSIF v_mastered THEN
    v_status := 'MASTERED';
  ELSIF private.spiral_lms_node_has_progress(p_user_id, p_node_id) THEN
    v_status := 'IN_PROGRESS';
  ELSIF private.spiral_lms_published_prerequisites_met(p_user_id, p_node_id)
    AND (v_skip_z_gate OR private.spiral_lms_z_level_gate_met(p_user_id, v_node.z_level)) THEN
    v_status := 'AVAILABLE';
  ELSE
    v_status := 'LOCKED';
  END IF;

  INSERT INTO public.user_progress (
    user_id,
    node_id,
    status,
    attempts,
    last_attempt_at,
    mastered_at
  )
  VALUES (
    p_user_id,
    p_node_id,
    v_status,
    coalesce(v_prev_attempts, 0),
    NULL,
    CASE WHEN v_mastered THEN now() ELSE NULL END
  )
  ON CONFLICT (user_id, node_id) DO UPDATE SET
    status = CASE
      WHEN user_progress.status = 'MAINTENANCE' THEN user_progress.status
      ELSE EXCLUDED.status
    END,
    mastered_at = CASE
      WHEN user_progress.status = 'MAINTENANCE' THEN user_progress.mastered_at
      WHEN EXCLUDED.status = 'MASTERED' AND user_progress.mastered_at IS NULL THEN now()
      WHEN EXCLUDED.status = 'MASTERED' THEN user_progress.mastered_at
      ELSE NULL
    END,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION private.spiral_lms_record_attempt_core(
  p_user_id uuid,
  p_node_id text,
  p_attempt_kind text,
  p_client_attempt_id uuid,
  p_content_slug text,
  p_score numeric,
  p_passed boolean,
  p_mini_quiz_answers jsonb DEFAULT NULL,
  p_mini_quiz_results jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempt_id uuid;
  v_progress public.user_progress%ROWTYPE;
  v_existing public.user_attempts%ROWTYPE;
  v_normalized jsonb;
  v_mini_quiz_version text;
BEGIN
  v_normalized := CASE
    WHEN p_attempt_kind = 'mini_quiz' THEN p_mini_quiz_answers
    ELSE NULL
  END;

  v_mini_quiz_version := CASE
    WHEN p_attempt_kind = 'mini_quiz' THEN private.spiral_lms_node_mini_quiz_version(p_node_id)
    ELSE NULL
  END;

  SELECT * INTO v_existing
  FROM public.user_attempts ua
  WHERE ua.user_id = p_user_id
    AND ua.client_attempt_id = p_client_attempt_id;

  IF FOUND THEN
    IF NOT private.spiral_lms_attempt_payload_matches(
      v_existing,
      p_node_id,
      p_attempt_kind,
      p_content_slug,
      p_score,
      v_normalized
    ) THEN
      RAISE EXCEPTION 'idempotency_conflict'
        USING ERRCODE = '22023';
    END IF;

    RETURN private.spiral_lms_build_attempt_response(p_user_id, v_existing);
  END IF;

  BEGIN
    INSERT INTO public.user_attempts (
      user_id,
      node_id,
      content_slug,
      attempt_kind,
      client_attempt_id,
      score,
      passed,
      mini_quiz_answers,
      mini_quiz_version
    )
    VALUES (
      p_user_id,
      p_node_id,
      CASE WHEN p_attempt_kind = 'content_view' THEN p_content_slug ELSE NULL END,
      p_attempt_kind,
      p_client_attempt_id,
      p_score,
      p_passed,
      v_normalized,
      v_mini_quiz_version
    )
    RETURNING id INTO v_attempt_id;
  EXCEPTION
    WHEN unique_violation THEN
      SELECT * INTO v_existing
      FROM public.user_attempts ua
      WHERE ua.user_id = p_user_id
        AND ua.client_attempt_id = p_client_attempt_id;

      IF NOT FOUND THEN
        RAISE;
      END IF;

      IF NOT private.spiral_lms_attempt_payload_matches(
        v_existing,
        p_node_id,
        p_attempt_kind,
        p_content_slug,
        p_score,
        v_normalized
      ) THEN
        RAISE EXCEPTION 'idempotency_conflict'
          USING ERRCODE = '22023';
      END IF;

      RETURN private.spiral_lms_build_attempt_response(p_user_id, v_existing);
  END;

  INSERT INTO public.user_progress (user_id, node_id, status, attempts, last_attempt_at)
  VALUES (p_user_id, p_node_id, 'LOCKED', 1, now())
  ON CONFLICT (user_id, node_id) DO UPDATE SET
    attempts = user_progress.attempts + 1,
    last_attempt_at = now(),
    updated_at = now();

  PERFORM private.spiral_lms_recompute_all_published_nodes(p_user_id);

  SELECT * INTO v_progress
  FROM public.user_progress
  WHERE user_id = p_user_id
    AND node_id = p_node_id;

  RETURN jsonb_build_object(
    'success', true,
    'idempotent', false,
    'attempt_id', v_attempt_id,
    'passed', p_passed,
    'node_id', p_node_id,
    'node_status', v_progress.status,
    'content_slug', p_content_slug,
    'score', p_score,
    'results', NULL::jsonb
  );
END;
$$;

ALTER TABLE public.user_progress
  DROP COLUMN IF EXISTS maintenance_cleared_at;

ALTER TABLE public.user_progress
  DROP COLUMN IF EXISTS maintenance_since;

ALTER FUNCTION private.spiral_lms_published_prerequisites_met(uuid, text) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_z_level_gate_met(uuid, smallint) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_recompute_node_progress(uuid, text) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_record_attempt_core(uuid, text, text, uuid, text, numeric, boolean, jsonb, jsonb) OWNER TO postgres;

REVOKE ALL ON FUNCTION private.spiral_lms_published_prerequisites_met(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_z_level_gate_met(uuid, smallint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_recompute_node_progress(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_record_attempt_core(uuid, text, text, uuid, text, numeric, boolean, jsonb, jsonb) FROM PUBLIC, anon, authenticated;

COMMIT;
