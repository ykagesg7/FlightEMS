-- Spiral matrix LMS (MVP PR ②): record_attempt RPC + user_attempts shape for slug-shared completion.
-- Apply via Supabase migration pipeline only after 上様 approval (not in this PR deploy).
-- Article/lesson completion is stored per content_slug; any node that requires the slug benefits.

BEGIN;

-- ---------------------------------------------------------------------------
-- user_attempts: distinguish content views vs node mini-quizzes
-- ---------------------------------------------------------------------------
ALTER TABLE public.user_attempts
  ADD COLUMN IF NOT EXISTS content_slug text,
  ADD COLUMN IF NOT EXISTS attempt_kind text;

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

CREATE INDEX IF NOT EXISTS idx_user_attempts_user_slug_content_passed
  ON public.user_attempts (user_id, content_slug)
  WHERE attempt_kind = 'content_view' AND passed = true;

CREATE INDEX IF NOT EXISTS idx_user_attempts_user_node_mini_quiz_passed
  ON public.user_attempts (user_id, node_id)
  WHERE attempt_kind = 'mini_quiz' AND passed = true;

COMMENT ON COLUMN public.user_attempts.content_slug IS
  'MDX slug for content_view attempts; NULL for mini_quiz. Completion is shared across all nodes linking this slug.';
COMMENT ON COLUMN public.user_attempts.attempt_kind IS
  'content_view = article/lesson read complete; mini_quiz = node gate when nodes.passing_score is set.';

-- ---------------------------------------------------------------------------
-- Internal helpers (callable only from record_attempt / postgres)
-- ---------------------------------------------------------------------------
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
  SELECT coalesce(
    bool_and(private.spiral_lms_slug_completed(p_user_id, nc.content_slug)),
    true
  )
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
        AND (
          ua.score IS NULL
          OR ua.score >= n.passing_score
        )
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
  v_prev_attempts integer;
BEGIN
  SELECT * INTO v_node
  FROM public.nodes
  WHERE id = p_node_id;

  IF NOT FOUND OR v_node.is_published IS NOT TRUE THEN
    RETURN;
  END IF;

  v_locked := (
    v_node.opens_at IS NOT NULL
    AND v_node.opens_at > now()
  )
  OR NOT private.spiral_lms_published_prerequisites_met(p_user_id, p_node_id);

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
  ELSIF private.spiral_lms_published_prerequisites_met(p_user_id, p_node_id) THEN
    v_status := 'AVAILABLE';
  ELSE
    v_status := 'LOCKED';
  END IF;

  SELECT attempts INTO v_prev_attempts
  FROM public.user_progress
  WHERE user_id = p_user_id
    AND node_id = p_node_id;

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

REVOKE ALL ON FUNCTION private.spiral_lms_slug_completed(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_published_prerequisites_met(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_required_content_met(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_mini_quiz_met(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_node_has_progress(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_recompute_node_progress(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_recompute_all_published_nodes(uuid) FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Public RPC
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_attempt(
  p_node_id text,
  p_attempt_kind text,
  p_content_slug text DEFAULT NULL,
  p_score numeric DEFAULT NULL,
  p_passed boolean DEFAULT false
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
  v_passed boolean := coalesce(p_passed, false);
  v_progress public.user_progress%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated'
      USING ERRCODE = '28000';
  END IF;

  IF p_attempt_kind NOT IN ('content_view', 'mini_quiz') THEN
    RAISE EXCEPTION 'invalid attempt_kind'
      USING ERRCODE = '22023';
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

  IF p_attempt_kind = 'content_view' THEN
    IF p_content_slug IS NULL OR length(trim(p_content_slug)) = 0 THEN
      RAISE EXCEPTION 'content_slug_required'
        USING ERRCODE = '22023';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.node_contents nc
      WHERE nc.node_id = p_node_id
        AND nc.content_slug = p_content_slug
    ) THEN
      RAISE EXCEPTION 'content_not_linked_to_node'
        USING ERRCODE = '22023';
    END IF;

    IF NOT v_passed THEN
      RAISE EXCEPTION 'content_view_must_pass'
        USING ERRCODE = '22023';
    END IF;
  ELSE
    IF p_content_slug IS NOT NULL THEN
      RAISE EXCEPTION 'mini_quiz_content_slug_forbidden'
        USING ERRCODE = '22023';
    END IF;

    IF v_node.passing_score IS NOT NULL THEN
      IF p_score IS NULL THEN
        RAISE EXCEPTION 'mini_quiz_score_required'
          USING ERRCODE = '22023';
      END IF;
      v_passed := p_score >= v_node.passing_score;
    END IF;
  END IF;

  INSERT INTO public.user_attempts (
    user_id,
    node_id,
    content_slug,
    attempt_kind,
    score,
    passed
  )
  VALUES (
    v_uid,
    p_node_id,
    CASE WHEN p_attempt_kind = 'content_view' THEN p_content_slug ELSE NULL END,
    p_attempt_kind,
    p_score,
    v_passed
  )
  RETURNING id INTO v_attempt_id;

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
    'attempt_id', v_attempt_id,
    'passed', v_passed,
    'node_id', p_node_id,
    'node_status', v_progress.status,
    'content_slug', p_content_slug
  );
END;
$$;

REVOKE ALL ON FUNCTION public.record_attempt(text, text, text, numeric, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_attempt(text, text, text, numeric, boolean) FROM anon;
GRANT EXECUTE ON FUNCTION public.record_attempt(text, text, text, numeric, boolean) TO authenticated;

COMMENT ON FUNCTION public.record_attempt(text, text, text, numeric, boolean) IS
  'Records spiral LMS content_view (slug-shared) or mini_quiz attempts for auth.uid() only; refreshes user_progress.';

COMMIT;
