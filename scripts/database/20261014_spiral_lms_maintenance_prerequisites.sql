-- Spiral LMS: automatic MAINTENANCE (整備点検) on two consecutive mini_quiz failures.
-- Published prerequisites up to one z_level back (same z_level + z_level - 1).
-- Apply via Supabase migration pipeline only after 上様 approval (not in this PR deploy).

BEGIN;

ALTER TABLE public.user_progress
  ADD COLUMN IF NOT EXISTS maintenance_since timestamptz;

ALTER TABLE public.user_progress
  ADD COLUMN IF NOT EXISTS maintenance_cleared_at timestamptz;

COMMENT ON COLUMN public.user_progress.maintenance_since IS
  'Set when status becomes MAINTENANCE; cleared on recovery to MASTERED. Recovery attempts must be after this instant.';

COMMENT ON COLUMN public.user_progress.maintenance_cleared_at IS
  'Set when leaving MAINTENANCE for MASTERED. Downstream mini_quiz streaks ignore attempts at or before the latest prerequisite cleared_at.';

UPDATE public.user_progress
SET maintenance_since = now()
WHERE status = 'MAINTENANCE'
  AND maintenance_since IS NULL;

-- ---------------------------------------------------------------------------
-- Two consecutive failed mini_quiz attempts on the same node (most recent first).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.spiral_lms_two_consecutive_failed_attempts(
  p_user_id uuid,
  p_node_id text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_node public.nodes%ROWTYPE;
  v_cutoff timestamptz;
  v_consecutive boolean;
BEGIN
  SELECT * INTO v_node
  FROM public.nodes
  WHERE id = p_node_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  SELECT max(up.maintenance_cleared_at)
  INTO v_cutoff
  FROM public.node_prerequisites np
  INNER JOIN public.nodes prereq ON prereq.id = np.prerequisite_node_id
  INNER JOIN public.user_progress up
    ON up.user_id = p_user_id
    AND up.node_id = np.prerequisite_node_id
  WHERE np.node_id = p_node_id
    AND prereq.is_published = true
    AND prereq.z_level <= v_node.z_level
    AND prereq.z_level >= v_node.z_level - 1;

  SELECT
    count(*) = 2
    AND bool_and(NOT passed)
  INTO v_consecutive
  FROM (
    SELECT ua.passed
    FROM public.user_attempts ua
    WHERE ua.user_id = p_user_id
      AND ua.node_id = p_node_id
      AND ua.attempt_kind = 'mini_quiz'
      AND (v_cutoff IS NULL OR ua.created_at > v_cutoff)
    ORDER BY ua.created_at DESC, ua.id DESC
    LIMIT 2
  ) last_two;

  RETURN coalesce(v_consecutive, false);
END;
$$;

-- ---------------------------------------------------------------------------
-- Recovery from MAINTENANCE (after maintenance_since).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.spiral_lms_maintenance_recovery_met(
  p_user_id uuid,
  p_node_id text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_node public.nodes%ROWTYPE;
  v_since timestamptz;
  v_required_count integer;
BEGIN
  SELECT up.maintenance_since
  INTO v_since
  FROM public.user_progress up
  WHERE up.user_id = p_user_id
    AND up.node_id = p_node_id
    AND up.status = 'MAINTENANCE';

  IF v_since IS NULL THEN
    RETURN false;
  END IF;

  SELECT * INTO v_node
  FROM public.nodes
  WHERE id = p_node_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF v_node.passing_score IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1
      FROM public.user_attempts ua
      WHERE ua.user_id = p_user_id
        AND ua.node_id = p_node_id
        AND ua.attempt_kind = 'mini_quiz'
        AND ua.passed = true
        AND ua.score IS NOT NULL
        AND ua.created_at >= v_since
        AND ua.score >= v_node.passing_score
        AND ua.mini_quiz_version IS NOT DISTINCT FROM private.spiral_lms_node_mini_quiz_version(p_node_id)
    );
  END IF;

  SELECT count(*)::integer
  INTO v_required_count
  FROM public.node_contents nc
  WHERE nc.node_id = p_node_id
    AND nc.is_required = true;

  IF v_required_count = 0 THEN
    RETURN true;
  END IF;

  RETURN NOT EXISTS (
    SELECT 1
    FROM public.node_contents nc
    WHERE nc.node_id = p_node_id
      AND nc.is_required = true
      AND NOT EXISTS (
        SELECT 1
        FROM public.user_attempts ua
        WHERE ua.user_id = p_user_id
          AND ua.content_slug = nc.content_slug
          AND ua.attempt_kind = 'content_view'
          AND ua.passed = true
          AND ua.created_at >= v_since
      )
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- Set published prerequisites (same z_level or one below) to MAINTENANCE.
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

  FOR v_prereq_id IN
    SELECT np.prerequisite_node_id
    FROM public.node_prerequisites np
    INNER JOIN public.nodes prereq ON prereq.id = np.prerequisite_node_id
    WHERE np.node_id = p_node_id
      AND prereq.is_published = true
      AND prereq.z_level <= v_node.z_level
      AND prereq.z_level >= v_node.z_level - 1
    ORDER BY np.prerequisite_node_id
  LOOP
    PERFORM pg_advisory_xact_lock(
      (hashtext(p_user_id::text) & 2147483647),
      hashtext(v_prereq_id)
    );

    INSERT INTO public.user_progress (
      user_id,
      node_id,
      status,
      attempts,
      last_attempt_at,
      mastered_at,
      maintenance_since,
      maintenance_cleared_at
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
      NULL,
      now(),
      NULL
    )
    ON CONFLICT (user_id, node_id) DO UPDATE SET
      status = 'MAINTENANCE',
      mastered_at = NULL,
      maintenance_cleared_at = NULL,
      maintenance_since = CASE
        WHEN user_progress.status = 'MAINTENANCE' THEN user_progress.maintenance_since
        ELSE now()
      END,
      updated_at = now();
  END LOOP;
END;
$$;

-- Prerequisites in MAINTENANCE still unlock downstream nodes (no demotion).
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
          AND up.status IN ('MASTERED', 'MAINTENANCE')
      )
  );
$$;

-- ---------------------------------------------------------------------------
-- Recompute: MAINTENANCE → MASTERED when recovery criteria met.
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
  v_maint_since timestamptz;
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
    SELECT maintenance_since
    INTO v_maint_since
    FROM public.user_progress
    WHERE user_id = p_user_id
      AND node_id = p_node_id;

    v_mastered := NOT v_locked
      AND private.spiral_lms_maintenance_recovery_met(p_user_id, p_node_id);

    IF v_mastered THEN
      v_status := 'MASTERED';
    ELSE
      v_status := 'MAINTENANCE';
    END IF;

    INSERT INTO public.user_progress (
      user_id,
      node_id,
      status,
      attempts,
      last_attempt_at,
      mastered_at,
      maintenance_since,
      maintenance_cleared_at
    )
    VALUES (
      p_user_id,
      p_node_id,
      v_status,
      coalesce(v_prev_attempts, 0),
      NULL,
      CASE WHEN v_mastered THEN now() ELSE NULL END,
      CASE WHEN v_mastered THEN NULL ELSE v_maint_since END,
      CASE WHEN v_mastered THEN now() ELSE NULL END
    )
    ON CONFLICT (user_id, node_id) DO UPDATE SET
      status = EXCLUDED.status,
      mastered_at = CASE
        WHEN EXCLUDED.status = 'MASTERED' AND user_progress.mastered_at IS NULL THEN now()
        WHEN EXCLUDED.status = 'MASTERED' THEN user_progress.mastered_at
        ELSE NULL
      END,
      maintenance_since = CASE
        WHEN EXCLUDED.status = 'MASTERED' THEN NULL
        ELSE user_progress.maintenance_since
      END,
      maintenance_cleared_at = CASE
        WHEN EXCLUDED.status = 'MASTERED' THEN now()
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
-- record_attempt_core: per-user/node lock + MAINTENANCE on mini_quiz failures.
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

  PERFORM pg_advisory_xact_lock(
    (hashtext(p_user_id::text) & 2147483647),
    hashtext(p_node_id)
  );

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

  IF NOT p_passed AND p_attempt_kind = 'mini_quiz' THEN
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
ALTER FUNCTION private.spiral_lms_maintenance_recovery_met(uuid, text) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_apply_maintenance_prerequisites(uuid, text) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_published_prerequisites_met(uuid, text) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_recompute_node_progress(uuid, text) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_record_attempt_core(uuid, text, text, uuid, text, numeric, boolean, jsonb, jsonb) OWNER TO postgres;

REVOKE ALL ON FUNCTION private.spiral_lms_two_consecutive_failed_attempts(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_maintenance_recovery_met(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_apply_maintenance_prerequisites(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_published_prerequisites_met(uuid, text) FROM PUBLIC, anon, authenticated;

COMMENT ON FUNCTION private.spiral_lms_apply_maintenance_prerequisites(uuid, text) IS
  'After two consecutive failed mini_quiz attempts on p_node_id, sets published prerequisites at same z_level or one below to MAINTENANCE.';

COMMIT;
