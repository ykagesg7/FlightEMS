-- Spiral matrix LMS (MVP PR ②): record_attempt RPC + user_attempts shape for slug-shared completion.
-- Apply via Supabase migration pipeline only after 上様 approval (not in this PR deploy).
-- Per-question quiz scoring lives in PR ④ (MDX quiz); this RPC accepts aggregate score 0–100 only.
-- Article/lesson completion is stored per content_slug; any node that requires the slug benefits.

BEGIN;

CREATE SCHEMA IF NOT EXISTS private;

-- Prerequisite: apply 20261012_spiral_lms_content_slug_map.sql (explicit MDX slug map).
DROP TABLE IF EXISTS public.spiral_article_slug_learning_id;

-- ---------------------------------------------------------------------------
-- user_attempts: distinguish content views vs node mini-quizzes + client idempotency
-- ---------------------------------------------------------------------------
ALTER TABLE public.user_attempts
  ADD COLUMN IF NOT EXISTS content_slug text,
  ADD COLUMN IF NOT EXISTS attempt_kind text,
  ADD COLUMN IF NOT EXISTS client_attempt_id uuid;

UPDATE public.user_attempts
SET attempt_kind = 'mini_quiz'
WHERE attempt_kind IS NULL;

ALTER TABLE public.user_attempts
  ALTER COLUMN attempt_kind SET NOT NULL;

ALTER TABLE public.user_attempts
  DROP CONSTRAINT IF EXISTS user_attempts_attempt_kind_check;

ALTER TABLE public.user_attempts
  ADD CONSTRAINT user_attempts_attempt_kind_check
  CHECK (attempt_kind IN ('content_view', 'mini_quiz'));

ALTER TABLE public.user_attempts
  DROP CONSTRAINT IF EXISTS user_attempts_content_slug_kind_check;

ALTER TABLE public.user_attempts
  ADD CONSTRAINT user_attempts_content_slug_kind_check
  CHECK (
    (attempt_kind = 'content_view' AND content_slug IS NOT NULL)
    OR (attempt_kind = 'mini_quiz' AND content_slug IS NULL)
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_attempts_user_client_attempt_id
  ON public.user_attempts (user_id, client_attempt_id)
  WHERE client_attempt_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_attempts_user_slug_content_passed
  ON public.user_attempts (user_id, content_slug)
  WHERE attempt_kind = 'content_view' AND passed = true;

CREATE INDEX IF NOT EXISTS idx_user_attempts_user_node_mini_quiz_passed
  ON public.user_attempts (user_id, node_id)
  WHERE attempt_kind = 'mini_quiz' AND passed = true;

COMMENT ON COLUMN public.user_attempts.content_slug IS
  'MDX slug for content_view attempts; NULL for mini_quiz. Completion is shared across all nodes linking this slug.';
COMMENT ON COLUMN public.user_attempts.attempt_kind IS
  'content_view = article/lesson read complete (score=100); mini_quiz = node gate when nodes.passing_score is set.';
COMMENT ON COLUMN public.user_attempts.client_attempt_id IS
  'Client-supplied idempotency key; duplicate (user_id, client_attempt_id) returns the original attempt.';

-- ---------------------------------------------------------------------------
-- Internal helpers (callable only from record_attempt / postgres)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.spiral_lms_validate_score(p_score numeric)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF p_score IS NULL THEN
    RAISE EXCEPTION 'invalid_score'
      USING ERRCODE = '22023';
  END IF;
  -- NaN is the only numeric value where (p_score <> p_score); rejects out-of-range too.
  IF p_score <> p_score OR NOT (p_score >= 0::numeric AND p_score <= 100::numeric) THEN
    RAISE EXCEPTION 'invalid_score'
      USING ERRCODE = '22023';
  END IF;
  RETURN p_score;
END;
$$;

CREATE OR REPLACE FUNCTION private.spiral_lms_content_publishable(p_content_slug text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (
      SELECT lc.is_published IS TRUE
      FROM public.spiral_content_slug_map m
      INNER JOIN public.learning_contents lc ON lc.id = m.learning_content_id
      WHERE m.content_slug = p_content_slug
    ),
    false
  );
$$;

CREATE OR REPLACE FUNCTION private.spiral_lms_attempt_payload_matches(
  p_existing public.user_attempts,
  p_node_id text,
  p_attempt_kind text,
  p_content_slug text,
  p_score numeric
)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT
    p_existing.node_id = p_node_id
    AND p_existing.attempt_kind = p_attempt_kind
    AND p_existing.content_slug IS NOT DISTINCT FROM CASE
      WHEN p_attempt_kind = 'content_view' THEN p_content_slug
      ELSE NULL
    END
    AND p_existing.score IS NOT DISTINCT FROM p_score;
$$;

CREATE OR REPLACE FUNCTION private.spiral_lms_build_attempt_response(
  p_user_id uuid,
  p_attempt public.user_attempts
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_progress public.user_progress%ROWTYPE;
BEGIN
  SELECT * INTO v_progress
  FROM public.user_progress
  WHERE user_id = p_user_id
    AND node_id = p_attempt.node_id;

  RETURN jsonb_build_object(
    'success', true,
    'idempotent', true,
    'attempt_id', p_attempt.id,
    'passed', p_attempt.passed,
    'node_id', p_attempt.node_id,
    'node_status', v_progress.status,
    'content_slug', p_attempt.content_slug
  );
END;
$$;

CREATE OR REPLACE FUNCTION private.spiral_lms_slug_completed(
  p_user_id uuid,
  p_content_slug text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_attempts ua
    WHERE ua.user_id = p_user_id
      AND ua.content_slug = p_content_slug
      AND ua.attempt_kind = 'content_view'
      AND ua.passed = true
  );
$$;

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

CREATE OR REPLACE FUNCTION private.spiral_lms_required_content_met(
  p_user_id uuid,
  p_node_id text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN count(*) = 0 THEN false
    ELSE bool_and(private.spiral_lms_slug_completed(p_user_id, nc.content_slug))
  END
  FROM public.node_contents nc
  WHERE nc.node_id = p_node_id
    AND nc.is_required = true;
$$;

CREATE OR REPLACE FUNCTION private.spiral_lms_mini_quiz_met(
  p_user_id uuid,
  p_node_id text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN n.passing_score IS NULL THEN true
    ELSE EXISTS (
      SELECT 1
      FROM public.user_attempts ua
      WHERE ua.user_id = p_user_id
        AND ua.node_id = p_node_id
        AND ua.attempt_kind = 'mini_quiz'
        AND ua.passed = true
        AND ua.score IS NOT NULL
        AND ua.score >= n.passing_score
    )
  END
  FROM public.nodes n
  WHERE n.id = p_node_id;
$$;

CREATE OR REPLACE FUNCTION private.spiral_lms_node_has_progress(
  p_user_id uuid,
  p_node_id text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1
      FROM public.user_attempts ua
      WHERE ua.user_id = p_user_id
        AND ua.node_id = p_node_id
    )
    OR EXISTS (
      SELECT 1
      FROM public.node_contents nc
      WHERE nc.node_id = p_node_id
        AND private.spiral_lms_slug_completed(p_user_id, nc.content_slug)
    );
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
    -- MAINTENANCE is set by a future PR; do not overwrite via recompute.
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

CREATE OR REPLACE FUNCTION private.spiral_lms_recompute_all_published_nodes(
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_node_id text;
BEGIN
  FOR v_node_id IN
    SELECT n.id
    FROM public.nodes n
    WHERE n.is_published = true
    ORDER BY n.z_level, n.quadrant, n.sort_order
  LOOP
    PERFORM private.spiral_lms_recompute_node_progress(p_user_id, v_node_id);
  END LOOP;
END;
$$;

DROP FUNCTION IF EXISTS private.spiral_lms_lesson_slug_from_content_id(text);
DROP FUNCTION IF EXISTS private.spiral_lms_lesson_publishable(text);
DROP FUNCTION IF EXISTS private.spiral_lms_article_publishable(text);
DROP FUNCTION IF EXISTS private.spiral_lms_content_publishable(text, text);

ALTER FUNCTION private.spiral_lms_validate_score(numeric) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_content_publishable(text) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_attempt_payload_matches(public.user_attempts, text, text, text, numeric) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_build_attempt_response(uuid, public.user_attempts) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_slug_completed(uuid, text) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_published_prerequisites_met(uuid, text) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_z_level_gate_met(uuid, smallint) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_required_content_met(uuid, text) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_mini_quiz_met(uuid, text) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_node_has_progress(uuid, text) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_recompute_node_progress(uuid, text) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_recompute_all_published_nodes(uuid) OWNER TO postgres;

REVOKE ALL ON FUNCTION private.spiral_lms_validate_score(numeric) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_content_publishable(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_attempt_payload_matches(public.user_attempts, text, text, text, numeric) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_build_attempt_response(uuid, public.user_attempts) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_slug_completed(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_published_prerequisites_met(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_z_level_gate_met(uuid, smallint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_required_content_met(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_mini_quiz_met(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_node_has_progress(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_recompute_node_progress(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_recompute_all_published_nodes(uuid) FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Public RPC
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.record_attempt(text, text, text, numeric, boolean);

CREATE OR REPLACE FUNCTION public.record_attempt(
  p_node_id text,
  p_attempt_kind text,
  p_client_attempt_id uuid,
  p_content_slug text DEFAULT NULL,
  p_score numeric DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_node public.nodes%ROWTYPE;
  v_attempt_id uuid;
  v_score numeric;
  v_passed boolean := false;
  v_progress public.user_progress%ROWTYPE;
  v_existing public.user_attempts%ROWTYPE;
  v_content_type text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated'
      USING ERRCODE = '28000';
  END IF;

  IF p_client_attempt_id IS NULL THEN
    RAISE EXCEPTION 'client_attempt_id_required'
      USING ERRCODE = '22023';
  END IF;

  IF p_attempt_kind NOT IN ('content_view', 'mini_quiz') THEN
    RAISE EXCEPTION 'invalid attempt_kind'
      USING ERRCODE = '22023';
  END IF;

  v_score := private.spiral_lms_validate_score(p_score);

  SELECT * INTO v_existing
  FROM public.user_attempts ua
  WHERE ua.user_id = v_uid
    AND ua.client_attempt_id = p_client_attempt_id;

  IF FOUND THEN
    IF NOT private.spiral_lms_attempt_payload_matches(
      v_existing,
      p_node_id,
      p_attempt_kind,
      p_content_slug,
      v_score
    ) THEN
      RAISE EXCEPTION 'idempotency_conflict'
        USING ERRCODE = '22023';
    END IF;

    RETURN private.spiral_lms_build_attempt_response(v_uid, v_existing);
  END IF;

  SELECT * INTO v_node
  FROM public.nodes
  WHERE id = p_node_id;

  IF NOT FOUND OR v_node.is_published IS NOT TRUE THEN
    RAISE EXCEPTION 'node_not_available'
      USING ERRCODE = '22023';
  END IF;

  IF v_node.opens_at IS NOT NULL AND v_node.opens_at > now() THEN
    RAISE EXCEPTION 'node_locked'
      USING ERRCODE = '22023';
  END IF;

  IF NOT private.spiral_lms_published_prerequisites_met(v_uid, p_node_id) THEN
    RAISE EXCEPTION 'prerequisites_not_met'
      USING ERRCODE = '22023';
  END IF;

  IF coalesce(v_node.unlock_config->>'z_level_gate', '') <> 'off'
     AND NOT private.spiral_lms_z_level_gate_met(v_uid, v_node.z_level) THEN
    RAISE EXCEPTION 'z_level_gate_locked'
      USING ERRCODE = '22023';
  END IF;

  IF p_attempt_kind = 'content_view' THEN
    IF p_content_slug IS NULL OR length(trim(p_content_slug)) = 0 THEN
      RAISE EXCEPTION 'content_slug_required'
        USING ERRCODE = '22023';
    END IF;

    SELECT nc.content_type INTO v_content_type
    FROM public.node_contents nc
    WHERE nc.node_id = p_node_id
      AND nc.content_slug = p_content_slug;

    IF v_content_type IS NULL THEN
      RAISE EXCEPTION 'content_not_linked_to_node'
        USING ERRCODE = '22023';
    END IF;

    IF NOT private.spiral_lms_content_publishable(p_content_slug) THEN
      RAISE EXCEPTION 'content_not_published'
        USING ERRCODE = '22023';
    END IF;

    v_passed := v_score = 100::numeric;
  ELSE
    IF p_content_slug IS NOT NULL THEN
      RAISE EXCEPTION 'mini_quiz_content_slug_forbidden'
        USING ERRCODE = '22023';
    END IF;

    IF v_node.passing_score IS NULL THEN
      RAISE EXCEPTION 'mini_quiz_not_configured'
        USING ERRCODE = '22023';
    END IF;

    v_passed := v_score >= v_node.passing_score;
  END IF;

  BEGIN
    INSERT INTO public.user_attempts (
      user_id,
      node_id,
      content_slug,
      attempt_kind,
      client_attempt_id,
      score,
      passed
    )
    VALUES (
      v_uid,
      p_node_id,
      CASE WHEN p_attempt_kind = 'content_view' THEN p_content_slug ELSE NULL END,
      p_attempt_kind,
      p_client_attempt_id,
      v_score,
      v_passed
    )
    RETURNING id INTO v_attempt_id;
  EXCEPTION
    WHEN unique_violation THEN
      SELECT * INTO v_existing
      FROM public.user_attempts ua
      WHERE ua.user_id = v_uid
        AND ua.client_attempt_id = p_client_attempt_id;

      IF NOT FOUND THEN
        RAISE;
      END IF;

      IF NOT private.spiral_lms_attempt_payload_matches(
        v_existing,
        p_node_id,
        p_attempt_kind,
        p_content_slug,
        v_score
      ) THEN
        RAISE EXCEPTION 'idempotency_conflict'
          USING ERRCODE = '22023';
      END IF;

      RETURN private.spiral_lms_build_attempt_response(v_uid, v_existing);
  END;

  INSERT INTO public.user_progress (user_id, node_id, status, attempts, last_attempt_at)
  VALUES (v_uid, p_node_id, 'LOCKED', 1, now())
  ON CONFLICT (user_id, node_id) DO UPDATE SET
    attempts = user_progress.attempts + 1,
    last_attempt_at = now(),
    updated_at = now();

  PERFORM private.spiral_lms_recompute_all_published_nodes(v_uid);

  SELECT * INTO v_progress
  FROM public.user_progress
  WHERE user_id = v_uid
    AND node_id = p_node_id;

  RETURN jsonb_build_object(
    'success', true,
    'idempotent', false,
    'attempt_id', v_attempt_id,
    'passed', v_passed,
    'node_id', p_node_id,
    'node_status', v_progress.status,
    'content_slug', p_content_slug
  );
END;
$$;

ALTER FUNCTION public.record_attempt(text, text, uuid, text, numeric) OWNER TO postgres;

REVOKE ALL ON FUNCTION public.record_attempt(text, text, uuid, text, numeric) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_attempt(text, text, uuid, text, numeric) FROM anon;
GRANT EXECUTE ON FUNCTION public.record_attempt(text, text, uuid, text, numeric) TO authenticated;

COMMENT ON FUNCTION public.record_attempt(text, text, uuid, text, numeric) IS
  'Records spiral LMS content_view (slug-shared) or mini_quiz attempts for auth.uid() only; score 0–100; refreshes user_progress.';

COMMIT;
