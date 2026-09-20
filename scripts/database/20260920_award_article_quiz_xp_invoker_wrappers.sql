-- Article / Quiz XP: INVOKER wrapper + DEFINER impl (same 403 as registration XP).
-- public.* stay SECURITY INVOKER for PostgREST / Advisor 0029.
-- Bodies move to private.*_impl so they can execute private.apply_xp_reward
-- (EXECUTE is postgres-only; authenticated INVOKER cannot call it).
-- Not a schema break; no user rows are deleted.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Article read XP
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.award_article_read_xp_impl(p_article_slug text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_progress public.learning_progress%ROWTYPE;
  v_result jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF p_article_slug IS NULL OR btrim(p_article_slug) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_article');
  END IF;

  SELECT * INTO v_progress
  FROM public.learning_progress
  WHERE user_id = v_uid
    AND content_id = p_article_slug
  FOR UPDATE;

  IF NOT FOUND
     OR (NOT coalesce(v_progress.completed, false)
         AND coalesce(v_progress.progress_percentage, 0) < 95) THEN
    RETURN jsonb_build_object('success', false, 'error', 'article_not_completed');
  END IF;

  v_result := private.apply_xp_reward(
    v_uid,
    'article_read',
    p_article_slug,
    5,
    jsonb_build_object('rule_version', 1, 'completion_threshold', 95)
  );

  IF coalesce((v_result->>'success')::boolean, false) THEN
    UPDATE public.learning_progress
    SET xp_awarded_at = coalesce(xp_awarded_at, now()),
        updated_at = now()
    WHERE id = v_progress.id;
  END IF;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION private.award_article_read_xp_impl(text)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.award_article_read_xp_impl(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.award_article_read_xp(p_article_slug text)
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT private.award_article_read_xp_impl(p_article_slug);
$$;

REVOKE ALL ON FUNCTION public.award_article_read_xp(text)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.award_article_read_xp(text) TO authenticated;

-- ---------------------------------------------------------------------------
-- 2. Quiz session XP
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.award_quiz_session_xp_impl(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_session public.quiz_sessions%ROWTYPE;
  v_xp integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT * INTO v_session
  FROM public.quiz_sessions
  WHERE id = p_session_id
    AND user_id = v_uid
    AND is_completed = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'eligible_session_not_found');
  END IF;

  IF coalesce(v_session.questions_attempted, 0) < 1 THEN
    RETURN jsonb_build_object('success', false, 'error', 'no_questions_attempted');
  END IF;

  v_xp := 10 + coalesce(v_session.questions_correct, 0) * 2;
  IF v_session.questions_correct = v_session.questions_attempted THEN
    v_xp := v_xp + 15;
  END IF;
  IF v_session.session_type IN ('exam', 'cpl_exam') THEN
    v_xp := round(v_xp * 1.25);
  END IF;

  RETURN private.apply_xp_reward(
    v_uid,
    'quiz_session',
    p_session_id::text,
    v_xp,
    jsonb_build_object(
      'rule_version', 1,
      'questions_attempted', v_session.questions_attempted,
      'questions_correct', v_session.questions_correct,
      'session_type', v_session.session_type
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION private.award_quiz_session_xp_impl(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.award_quiz_session_xp_impl(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.award_quiz_session_xp(p_session_id uuid)
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT private.award_quiz_session_xp_impl(p_session_id);
$$;

REVOKE ALL ON FUNCTION public.award_quiz_session_xp(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.award_quiz_session_xp(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. Article comprehension XP (same INVOKER → apply_xp_reward 403)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.award_article_comprehension_xp_impl(
  p_article_slug text,
  p_session_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_session public.quiz_sessions%ROWTYPE;
  v_content_id text;
  v_result jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT * INTO v_session
  FROM public.quiz_sessions
  WHERE id = p_session_id
    AND user_id = v_uid
    AND is_completed = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'eligible_session_not_found');
  END IF;

  v_content_id := coalesce(
    v_session.settings->>'content_id',
    v_session.settings->>'contentId'
  );

  IF v_content_id IS DISTINCT FROM p_article_slug
     OR coalesce(v_session.questions_attempted, 0) < 3
     OR coalesce(v_session.questions_correct, 0)::numeric
          / greatest(v_session.questions_attempted, 1) < 0.8 THEN
    RETURN jsonb_build_object('success', false, 'error', 'comprehension_threshold_not_met');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.learning_progress
    WHERE user_id = v_uid
      AND content_id = p_article_slug
      AND (completed = true OR progress_percentage >= 95)
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'article_not_completed');
  END IF;

  v_result := private.apply_xp_reward(
    v_uid,
    'article_comprehension',
    p_article_slug,
    10,
    jsonb_build_object(
      'rule_version', 1,
      'session_id', p_session_id,
      'score_percentage', v_session.score_percentage
    )
  );

  IF coalesce((v_result->>'success')::boolean, false) THEN
    PERFORM private.record_learning_milestone(
      v_uid,
      'article_comprehension',
      p_article_slug,
      'quiz_session',
      p_session_id::text,
      jsonb_build_object('score_percentage', v_session.score_percentage)
    );
  END IF;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION private.award_article_comprehension_xp_impl(text, uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.award_article_comprehension_xp_impl(text, uuid)
  TO authenticated;

CREATE OR REPLACE FUNCTION public.award_article_comprehension_xp(
  p_article_slug text,
  p_session_id uuid
)
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT private.award_article_comprehension_xp_impl(p_article_slug, p_session_id);
$$;

REVOKE ALL ON FUNCTION public.award_article_comprehension_xp(text, uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.award_article_comprehension_xp(text, uuid)
  TO authenticated;

COMMIT;
