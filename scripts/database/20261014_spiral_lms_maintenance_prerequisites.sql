-- Spiral LMS: automatic MAINTENANCE (整備点検) on two consecutive failures at a node.
-- Applies prerequisite MAINTENANCE at most one z_level below (published prereqs only).
-- Apply via Supabase migration pipeline only after 上様 approval (not in this PR deploy).

BEGIN;

-- ---------------------------------------------------------------------------
-- Detect two consecutive failed attempts on the same node (most recent first).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.spiral_lms_two_consecutive_failed_attempts(
  p_user_id uuid,
  p_node_id text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH last_two AS (
    SELECT ua.passed
    FROM public.user_attempts ua
    WHERE ua.user_id = p_user_id
      AND ua.node_id = p_node_id
    ORDER BY ua.created_at DESC, ua.id DESC
    LIMIT 2
  )
  SELECT
    count(*) = 2
    AND bool_and(NOT passed)
  FROM last_two;
$$;

-- ---------------------------------------------------------------------------
-- Set published prerequisites exactly one z_level below to MAINTENANCE.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.spiral_lms_apply_maintenance_prerequisites(
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
  v_prereq_id text;
BEGIN
  IF NOT private.spiral_lms_two_consecutive_failed_attempts(p_user_id, p_node_id) THEN
    RETURN;
  END IF;

  SELECT * INTO v_node
  FROM public.nodes
  WHERE id = p_node_id;

  IF NOT FOUND OR v_node.is_published IS NOT TRUE THEN
    RETURN;
  END IF;

  IF v_node.z_level <= 1 THEN
    RETURN;
  END IF;

  FOR v_prereq_id IN
    SELECT np.prerequisite_node_id
    FROM public.node_prerequisites np
    INNER JOIN public.nodes prereq ON prereq.id = np.prerequisite_node_id
    WHERE np.node_id = p_node_id
      AND prereq.is_published = true
      AND prereq.z_level = v_node.z_level - 1
  LOOP
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
      v_prereq_id,
      'MAINTENANCE',
      coalesce(
        (SELECT up.attempts FROM public.user_progress up
         WHERE up.user_id = p_user_id AND up.node_id = v_prereq_id),
        0
      ),
      NULL,
      NULL
    )
    ON CONFLICT (user_id, node_id) DO UPDATE SET
      status = 'MAINTENANCE',
      mastered_at = NULL,
      updated_at = now();
  END LOOP;
END;
$$;

-- ---------------------------------------------------------------------------
-- Recompute: allow MAINTENANCE → MASTERED / IN_PROGRESS when rework completes.
-- ---------------------------------------------------------------------------
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

  IF v_prev_status = 'MAINTENANCE' THEN
    IF v_mastered THEN
      v_status := 'MASTERED';
    ELSIF private.spiral_lms_node_has_progress(p_user_id, p_node_id) THEN
      v_status := 'IN_PROGRESS';
    ELSE
      v_status := 'MAINTENANCE';
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
      status = EXCLUDED.status,
      mastered_at = CASE
        WHEN EXCLUDED.status = 'MASTERED' AND user_progress.mastered_at IS NULL THEN now()
        WHEN EXCLUDED.status = 'MASTERED' THEN user_progress.mastered_at
        ELSE NULL
      END,
      updated_at = now();

    RETURN;
  END IF;

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

-- ---------------------------------------------------------------------------
-- record_attempt_core: trigger prerequisite MAINTENANCE after a failed attempt.
-- ---------------------------------------------------------------------------
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

  IF NOT p_passed THEN
    PERFORM private.spiral_lms_apply_maintenance_prerequisites(p_user_id, p_node_id);
  END IF;

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

ALTER FUNCTION private.spiral_lms_two_consecutive_failed_attempts(uuid, text) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_apply_maintenance_prerequisites(uuid, text) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_recompute_node_progress(uuid, text) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_record_attempt_core(uuid, text, text, uuid, text, numeric, boolean, jsonb, jsonb) OWNER TO postgres;

REVOKE ALL ON FUNCTION private.spiral_lms_two_consecutive_failed_attempts(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_apply_maintenance_prerequisites(uuid, text) FROM PUBLIC, anon, authenticated;

COMMENT ON FUNCTION private.spiral_lms_apply_maintenance_prerequisites(uuid, text) IS
  'After two consecutive failed attempts on p_node_id, sets published prerequisites one z_level below to MAINTENANCE.';

COMMIT;
