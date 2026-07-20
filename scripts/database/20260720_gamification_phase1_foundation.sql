-- Phase 1 gamification foundation
-- Security-first XP, mastery milestones, weekly rewards, and written-exam journey.

BEGIN;

-- ---------------------------------------------------------------------------
-- 0. Remove anonymous write paths from learner-owned data
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS enable_public_profiles_access ON public.profiles;
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

REVOKE ALL ON TABLE public.profiles FROM anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;

DROP POLICY IF EXISTS enable_public_learning_progress_access
  ON public.learning_progress;
DROP POLICY IF EXISTS learning_progress_select_own ON public.learning_progress;
DROP POLICY IF EXISTS learning_progress_insert_own ON public.learning_progress;
DROP POLICY IF EXISTS learning_progress_update_own ON public.learning_progress;
DROP POLICY IF EXISTS learning_progress_delete_own ON public.learning_progress;

CREATE POLICY learning_progress_select_own ON public.learning_progress
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
CREATE POLICY learning_progress_insert_own ON public.learning_progress
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY learning_progress_update_own ON public.learning_progress
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY learning_progress_delete_own ON public.learning_progress
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

REVOKE ALL ON TABLE public.learning_progress FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.learning_progress
  TO authenticated;

-- Mission history is written only by the completion RPC.
DROP POLICY IF EXISTS user_missions_insert_own ON public.user_missions;

-- ---------------------------------------------------------------------------
-- 1. Reward ledger and mastery milestones
-- ---------------------------------------------------------------------------
ALTER TABLE public.xp_award_events
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Existing article rewards were tracked only by learning_progress.xp_awarded_at.
-- Seed the new ledger without changing balances so rollout cannot double-award.
INSERT INTO public.xp_award_events
  (user_id, event_type, event_key, xp_amount, awarded_at, metadata)
SELECT
  lp.user_id,
  'article_read',
  lp.content_id,
  5,
  lp.xp_awarded_at,
  jsonb_build_object('migrated_from_learning_progress', true)
FROM public.learning_progress lp
WHERE lp.xp_awarded_at IS NOT NULL
ON CONFLICT (user_id, event_type, event_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.learning_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  milestone_type text NOT NULL CHECK (
    milestone_type IN (
      'article_comprehension',
      'delayed_retention',
      'weakness_improvement',
      'weekly_mission',
      'written_exam_complete'
    )
  ),
  milestone_key text NOT NULL,
  source_type text NOT NULL,
  source_id text,
  achieved_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (user_id, milestone_type, milestone_key)
);

CREATE INDEX IF NOT EXISTS idx_learning_milestones_user_achieved
  ON public.learning_milestones (user_id, achieved_at DESC);

ALTER TABLE public.learning_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS learning_milestones_select_own ON public.learning_milestones;
CREATE POLICY learning_milestones_select_own ON public.learning_milestones
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

REVOKE ALL ON TABLE public.learning_milestones FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.learning_milestones TO authenticated;

-- Only trusted SECURITY DEFINER functions may write the XP ledger.
REVOKE ALL ON TABLE public.xp_award_events FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.xp_award_events TO authenticated;

CREATE OR REPLACE FUNCTION private.apply_xp_reward(
  p_user_id uuid,
  p_event_type text,
  p_event_key text,
  p_xp_amount integer,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  v_old_rank public.user_rank_type;
  v_new_rank public.user_rank_type;
  v_new_xp integer;
BEGIN
  IF p_user_id IS NULL
     OR p_event_type IS NULL OR btrim(p_event_type) = ''
     OR p_event_key IS NULL OR btrim(p_event_key) = ''
     OR p_xp_amount IS NULL OR p_xp_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_reward');
  END IF;

  SELECT rank INTO v_old_rank
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'profile_not_found');
  END IF;

  INSERT INTO public.xp_award_events
    (user_id, event_type, event_key, xp_amount, metadata)
  VALUES
    (p_user_id, p_event_type, p_event_key, p_xp_amount, coalesce(p_metadata, '{}'::jsonb))
  ON CONFLICT (user_id, event_type, event_key) DO NOTHING;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_awarded');
  END IF;

  UPDATE public.profiles
  SET xp_points = coalesce(xp_points, 0) + p_xp_amount
  WHERE id = p_user_id
  RETURNING xp_points, rank INTO v_new_xp, v_new_rank;

  RETURN jsonb_build_object(
    'success', true,
    'xp_awarded', p_xp_amount,
    'new_xp', v_new_xp,
    'old_rank', v_old_rank,
    'new_rank', v_new_rank,
    'rank_up', v_old_rank IS DISTINCT FROM v_new_rank
  );
END;
$$;

REVOKE ALL ON FUNCTION private.apply_xp_reward(uuid, text, text, integer, jsonb)
  FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.record_learning_milestone(
  p_user_id uuid,
  p_milestone_type text,
  p_milestone_key text,
  p_source_type text,
  p_source_id text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
BEGIN
  INSERT INTO public.learning_milestones
    (user_id, milestone_type, milestone_key, source_type, source_id, metadata)
  VALUES
    (
      p_user_id,
      p_milestone_type,
      p_milestone_key,
      p_source_type,
      p_source_id,
      coalesce(p_metadata, '{}'::jsonb)
    )
  ON CONFLICT (user_id, milestone_type, milestone_key) DO NOTHING;
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION private.record_learning_milestone(
  uuid, text, text, text, text, jsonb
) FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Caller-bound, server-calculated reward RPCs
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.award_article_xp(uuid, text, integer);
DROP FUNCTION IF EXISTS public.award_xp_event(uuid, text, text, integer);

CREATE OR REPLACE FUNCTION public.award_registration_xp()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = v_uid
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'profile_not_found');
  END IF;

  RETURN private.apply_xp_reward(
    v_uid,
    'registration',
    'welcome_setup',
    100,
    jsonb_build_object('rule_version', 1)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.award_quiz_session_xp(p_session_id uuid)
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

CREATE OR REPLACE FUNCTION public.award_article_read_xp(p_article_slug text)
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

CREATE OR REPLACE FUNCTION public.award_article_comprehension_xp(
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

REVOKE ALL ON FUNCTION public.award_registration_xp() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.award_quiz_session_xp(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.award_article_read_xp(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.award_article_comprehension_xp(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.award_registration_xp() TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_quiz_session_xp(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_article_read_xp(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_article_comprehension_xp(text, uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. Mission completion periods and server-side evidence
-- ---------------------------------------------------------------------------
ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS requirement_value integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS requirement_config jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.missions
SET requirement_value = CASE
      WHEN title = '知識の探求者' THEN 50
      WHEN title = 'マスタープランナー' THEN 10
      WHEN title = 'プランニングエキスパート' THEN 5
      ELSE requirement_value
    END,
    requirement_config = CASE
      WHEN title = 'クイズマスター' THEN '{"min_score_percentage":80}'::jsonb
      WHEN title = 'パーフェクトスコア' THEN '{"min_score_percentage":100}'::jsonb
      WHEN title = '学習継続' THEN '{"active_days":3}'::jsonb
      ELSE requirement_config
    END;

-- Legacy social/planning missions have no trustworthy server-side evidence in
-- the current schema. Keep their history, but do not advertise or reward them.
UPDATE public.missions
SET is_active = false,
    updated_at = now()
WHERE required_action IN ('plan_create', 'photo_post')
   OR mission_type = 'weekly';

UPDATE public.missions
SET xp_reward = CASE title
      WHEN '初めてのクイズ' THEN 20
      WHEN '記事を読む' THEN 10
      WHEN 'デイリーチャレンジ' THEN 5
      WHEN 'クイズマスター' THEN 40
      WHEN 'パーフェクトスコア' THEN 50
      WHEN '知識の探求者' THEN 50
      ELSE xp_reward
    END,
    updated_at = now()
WHERE required_action IN ('quiz_pass', 'article_read');

CREATE TABLE IF NOT EXISTS public.mission_completion_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mission_id uuid NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  period_key text NOT NULL,
  xp_earned integer NOT NULL CHECK (xp_earned >= 0),
  completed_at timestamptz NOT NULL DEFAULT now(),
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (user_id, mission_id, period_key)
);

CREATE INDEX IF NOT EXISTS idx_mission_completion_events_user
  ON public.mission_completion_events (user_id, completed_at DESC);

ALTER TABLE public.mission_completion_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mission_completion_events_select_own
  ON public.mission_completion_events;
CREATE POLICY mission_completion_events_select_own
  ON public.mission_completion_events
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
REVOKE ALL ON TABLE public.mission_completion_events FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.mission_completion_events TO authenticated;

DROP FUNCTION IF EXISTS public.complete_mission(uuid, uuid);

CREATE OR REPLACE FUNCTION public.complete_mission(p_mission_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_mission public.missions%ROWTYPE;
  v_period_key text;
  v_eligible boolean := false;
  v_evidence jsonb := '{}'::jsonb;
  v_count integer := 0;
  v_min_score numeric;
  v_result jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT * INTO v_mission
  FROM public.missions
  WHERE id = p_mission_id AND is_active = true;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'mission_not_found');
  END IF;

  v_period_key := CASE v_mission.mission_type
    WHEN 'daily' THEN to_char(now() AT TIME ZONE 'Asia/Tokyo', 'YYYY-MM-DD')
    WHEN 'weekly' THEN to_char(now() AT TIME ZONE 'Asia/Tokyo', 'IYYY-"W"IW')
    ELSE 'once'
  END;

  IF EXISTS (
    SELECT 1 FROM public.mission_completion_events
    WHERE user_id = v_uid
      AND mission_id = p_mission_id
      AND period_key = v_period_key
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_completed');
  END IF;

  IF v_mission.required_action = 'article_read' THEN
    IF v_mission.requirement_config ? 'active_days' THEN
      SELECT count(DISTINCT (updated_at AT TIME ZONE 'Asia/Tokyo')::date)::integer
      INTO v_count
      FROM public.learning_progress
      WHERE user_id = v_uid
        AND completed = true
        AND updated_at >= date_trunc('week', now() AT TIME ZONE 'Asia/Tokyo')
          AT TIME ZONE 'Asia/Tokyo';
      v_eligible := v_count >= (v_mission.requirement_config->>'active_days')::integer;
    ELSE
      SELECT count(*)::integer INTO v_count
      FROM public.learning_progress
      WHERE user_id = v_uid
        AND completed = true
        AND (
          v_mission.mission_type <> 'daily'
          OR updated_at >= (
            date_trunc('day', now() AT TIME ZONE 'Asia/Tokyo')
              AT TIME ZONE 'Asia/Tokyo'
          )
        );
      v_eligible := v_count >= v_mission.requirement_value;
    END IF;
    v_evidence := jsonb_build_object('completed_articles_or_days', v_count);
  ELSIF v_mission.required_action = 'quiz_pass' THEN
    v_min_score := nullif(v_mission.requirement_config->>'min_score_percentage', '')::numeric;
    SELECT count(*)::integer INTO v_count
    FROM public.quiz_sessions
    WHERE user_id = v_uid
      AND is_completed = true
      AND (
        v_mission.mission_type <> 'daily'
        OR completed_at >= (
          date_trunc('day', now() AT TIME ZONE 'Asia/Tokyo')
            AT TIME ZONE 'Asia/Tokyo'
        )
      )
      AND (v_min_score IS NULL OR score_percentage >= v_min_score);
    v_eligible := v_count >= v_mission.requirement_value;
    v_evidence := jsonb_build_object(
      'eligible_quiz_sessions', v_count,
      'min_score_percentage', v_min_score
    );
  END IF;

  IF NOT v_eligible THEN
    RETURN jsonb_build_object('success', false, 'error', 'requirement_not_met');
  END IF;

  INSERT INTO public.mission_completion_events
    (user_id, mission_id, period_key, xp_earned, evidence)
  VALUES
    (
      v_uid,
      p_mission_id,
      v_period_key,
      coalesce(v_mission.xp_reward, 0),
      v_evidence
    )
  ON CONFLICT (user_id, mission_id, period_key) DO NOTHING;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_completed');
  END IF;

  v_result := private.apply_xp_reward(
    v_uid,
    'mission',
    p_mission_id::text || ':' || v_period_key,
    coalesce(v_mission.xp_reward, 0),
    v_evidence || jsonb_build_object('mission_id', p_mission_id, 'period_key', v_period_key)
  );

  INSERT INTO public.user_missions (user_id, mission_id, completed_at, xp_earned)
  VALUES (v_uid, p_mission_id, now(), coalesce(v_mission.xp_reward, 0))
  ON CONFLICT (user_id, mission_id) DO UPDATE
    SET completed_at = excluded.completed_at,
        xp_earned = excluded.xp_earned;

  RETURN v_result || jsonb_build_object('mission_title', v_mission.title);
END;
$$;

REVOKE ALL ON FUNCTION public.complete_mission(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_mission(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- 4. Weekly mission completion and placement rewards
-- ---------------------------------------------------------------------------
ALTER TABLE public.cohort_weekly_mission_templates
  ADD COLUMN IF NOT EXISTS completion_threshold numeric NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS completion_xp integer NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS mvp_xp integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS top3_xp integer NOT NULL DEFAULT 20;

UPDATE public.cohort_weekly_mission_templates
SET completion_threshold = CASE metric_type
      WHEN 'sprint' THEN min_questions
      WHEN 'precision' THEN 70
      WHEN 'comeback' THEN 1
      WHEN 'consistency' THEN 3
      ELSE completion_threshold
    END,
    completion_xp = 20,
    mvp_xp = 30,
    top3_xp = 20;

ALTER TABLE public.cohort_weekly_scores
  ADD COLUMN IF NOT EXISTS qualification_met boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS evidence jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE OR REPLACE FUNCTION public.compute_cohort_weekly_scores(p_iso_week text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  v_bounds record;
  v_previous_bounds record;
  v_template public.cohort_weekly_mission_templates%ROWTYPE;
  v_week_index integer;
  v_rows integer := 0;
BEGIN
  IF p_iso_week !~ '^[0-9]{4}-W[0-9]{2}$' THEN
    RAISE EXCEPTION 'invalid ISO week';
  END IF;

  SELECT * INTO v_bounds FROM private.cohort_week_bounds_jst(p_iso_week);
  SELECT * INTO v_previous_bounds
  FROM private.cohort_week_bounds_jst(
    to_char(
      (v_bounds.week_start - interval '7 days') AT TIME ZONE 'Asia/Tokyo',
      'IYYY-"W"IW'
    )
  );

  v_week_index := ((split_part(p_iso_week, '-W', 2)::integer - 1) % 4) + 1;
  SELECT * INTO v_template
  FROM public.cohort_weekly_mission_templates
  WHERE week_index = v_week_index AND is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  IF v_template.metric_type = 'sprint' THEN
    INSERT INTO public.cohort_weekly_scores
      (
        cohort_key, iso_week, user_id, metric_type, metric_value,
        qualification_met, evidence
      )
    SELECT
      ulp.cohort_key,
      p_iso_week,
      ulp.user_id,
      'sprint',
      coalesce(stats.question_count, 0) + coalesce(stats.study_seconds, 0) / 60.0,
      coalesce(stats.question_count, 0) >= v_template.min_questions,
      jsonb_build_object(
        'question_count', coalesce(stats.question_count, 0),
        'study_minutes', round(coalesce(stats.study_seconds, 0) / 60.0, 1),
        'threshold', v_template.min_questions
      )
    FROM public.user_learning_profiles ulp
    LEFT JOIN LATERAL (
      SELECT
        coalesce(sum(qs.questions_attempted), 0)::numeric AS question_count,
        coalesce(sum(qs.total_time_spent), 0)::numeric AS study_seconds
      FROM public.quiz_sessions qs
      WHERE qs.user_id = ulp.user_id
        AND qs.is_completed = true
        AND qs.completed_at >= v_bounds.week_start
        AND qs.completed_at < v_bounds.week_end_exclusive
    ) stats ON true
    WHERE ulp.cohort_key IS NOT NULL AND ulp.cohort_phase = 'active'
    ON CONFLICT (cohort_key, iso_week, user_id, metric_type)
    DO UPDATE SET
      metric_value = excluded.metric_value,
      qualification_met = excluded.qualification_met,
      evidence = excluded.evidence,
      rank_in_cohort = NULL,
      computed_at = now();
  ELSIF v_template.metric_type = 'precision' THEN
    INSERT INTO public.cohort_weekly_scores
      (
        cohort_key, iso_week, user_id, metric_type, metric_value,
        qualification_met, evidence
      )
    SELECT
      ulp.cohort_key,
      p_iso_week,
      ulp.user_id,
      'precision',
      coalesce(stats.accuracy, 0),
      coalesce(stats.question_count, 0) >= v_template.min_questions
        AND coalesce(stats.accuracy, 0) >= v_template.completion_threshold,
      jsonb_build_object(
        'question_count', coalesce(stats.question_count, 0),
        'accuracy', coalesce(stats.accuracy, 0),
        'threshold', v_template.completion_threshold
      )
    FROM public.user_learning_profiles ulp
    LEFT JOIN LATERAL (
      SELECT
        coalesce(sum(qs.questions_attempted), 0)::integer AS question_count,
        round(avg(qs.score_percentage)::numeric, 2) AS accuracy
      FROM public.quiz_sessions qs
      WHERE qs.user_id = ulp.user_id
        AND qs.is_completed = true
        AND qs.completed_at >= v_bounds.week_start
        AND qs.completed_at < v_bounds.week_end_exclusive
    ) stats ON true
    WHERE ulp.cohort_key IS NOT NULL AND ulp.cohort_phase = 'active'
    ON CONFLICT (cohort_key, iso_week, user_id, metric_type)
    DO UPDATE SET
      metric_value = excluded.metric_value,
      qualification_met = excluded.qualification_met,
      evidence = excluded.evidence,
      rank_in_cohort = NULL,
      computed_at = now();
  ELSIF v_template.metric_type = 'comeback' THEN
    INSERT INTO public.cohort_weekly_scores
      (
        cohort_key, iso_week, user_id, metric_type, metric_value,
        qualification_met, evidence
      )
    SELECT
      ulp.cohort_key,
      p_iso_week,
      ulp.user_id,
      'comeback',
      greatest(coalesce(current_stats.accuracy, 0) - coalesce(previous_stats.accuracy, 0), 0),
      coalesce(current_stats.question_count, 0) >= v_template.min_questions
        AND greatest(
          coalesce(current_stats.accuracy, 0) - coalesce(previous_stats.accuracy, 0),
          0
        ) >= v_template.completion_threshold,
      jsonb_build_object(
        'question_count', coalesce(current_stats.question_count, 0),
        'current_accuracy', coalesce(current_stats.accuracy, 0),
        'previous_accuracy', coalesce(previous_stats.accuracy, 0),
        'threshold', v_template.completion_threshold
      )
    FROM public.user_learning_profiles ulp
    LEFT JOIN LATERAL (
      SELECT
        coalesce(sum(qs.questions_attempted), 0)::integer AS question_count,
        round(avg(qs.score_percentage)::numeric, 2) AS accuracy
      FROM public.quiz_sessions qs
      WHERE qs.user_id = ulp.user_id
        AND qs.is_completed = true
        AND qs.completed_at >= v_bounds.week_start
        AND qs.completed_at < v_bounds.week_end_exclusive
    ) current_stats ON true
    LEFT JOIN LATERAL (
      SELECT round(avg(qs.score_percentage)::numeric, 2) AS accuracy
      FROM public.quiz_sessions qs
      WHERE qs.user_id = ulp.user_id
        AND qs.is_completed = true
        AND qs.completed_at >= v_previous_bounds.week_start
        AND qs.completed_at < v_previous_bounds.week_end_exclusive
    ) previous_stats ON true
    WHERE ulp.cohort_key IS NOT NULL AND ulp.cohort_phase = 'active'
    ON CONFLICT (cohort_key, iso_week, user_id, metric_type)
    DO UPDATE SET
      metric_value = excluded.metric_value,
      qualification_met = excluded.qualification_met,
      evidence = excluded.evidence,
      rank_in_cohort = NULL,
      computed_at = now();
  ELSE
    INSERT INTO public.cohort_weekly_scores
      (
        cohort_key, iso_week, user_id, metric_type, metric_value,
        qualification_met, evidence
      )
    SELECT
      ulp.cohort_key,
      p_iso_week,
      ulp.user_id,
      'consistency',
      coalesce(stats.active_days, 0),
      coalesce(stats.active_days, 0) >= v_template.completion_threshold,
      jsonb_build_object(
        'active_days', coalesce(stats.active_days, 0),
        'threshold', v_template.completion_threshold
      )
    FROM public.user_learning_profiles ulp
    LEFT JOIN LATERAL (
      SELECT count(DISTINCT activity_date)::integer AS active_days
      FROM (
        SELECT (qs.completed_at AT TIME ZONE 'Asia/Tokyo')::date AS activity_date
        FROM public.quiz_sessions qs
        WHERE qs.user_id = ulp.user_id
          AND qs.is_completed = true
          AND qs.completed_at >= v_bounds.week_start
          AND qs.completed_at < v_bounds.week_end_exclusive
        UNION
        SELECT (lp.updated_at AT TIME ZONE 'Asia/Tokyo')::date
        FROM public.learning_progress lp
        WHERE lp.user_id = ulp.user_id
          AND lp.completed = true
          AND lp.updated_at >= v_bounds.week_start
          AND lp.updated_at < v_bounds.week_end_exclusive
      ) activity
    ) stats ON true
    WHERE ulp.cohort_key IS NOT NULL AND ulp.cohort_phase = 'active'
    ON CONFLICT (cohort_key, iso_week, user_id, metric_type)
    DO UPDATE SET
      metric_value = excluded.metric_value,
      qualification_met = excluded.qualification_met,
      evidence = excluded.evidence,
      rank_in_cohort = NULL,
      computed_at = now();
  END IF;

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows;
END;
$$;

REVOKE ALL ON FUNCTION public.compute_cohort_weekly_scores(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.compute_cohort_weekly_scores(text) TO service_role;

DROP FUNCTION IF EXISTS public.award_cohort_weekly_top3(text);

CREATE OR REPLACE FUNCTION public.award_cohort_weekly_top3(p_iso_week text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  v_cohort text;
  v_participant_count integer;
  v_mode text;
  v_completed integer := 0;
  v_placed integer := 0;
  v_result jsonb;
  rec record;
BEGIN
  IF p_iso_week !~ '^[0-9]{4}-W[0-9]{2}$' THEN
    RAISE EXCEPTION 'invalid ISO week';
  END IF;

  FOR v_cohort IN
    SELECT DISTINCT cohort_key
    FROM public.cohort_weekly_scores
    WHERE iso_week = p_iso_week
  LOOP
    SELECT count(*)::integer INTO v_participant_count
    FROM public.user_learning_profiles
    WHERE cohort_key = v_cohort AND cohort_phase = 'active';

    v_mode := CASE
      WHEN v_participant_count >= 10 THEN 'top3'
      WHEN v_participant_count >= 3 THEN 'mvp'
      ELSE 'none'
    END;

    FOR rec IN
      SELECT
        s.user_id,
        s.metric_type,
        s.metric_value,
        s.evidence,
        t.completion_xp,
        t.mvp_xp,
        t.top3_xp
      FROM public.cohort_weekly_scores s
      JOIN public.cohort_weekly_mission_templates t
        ON t.metric_type = s.metric_type AND t.is_active = true
      WHERE s.cohort_key = v_cohort
        AND s.iso_week = p_iso_week
        AND s.qualification_met = true
    LOOP
      v_result := private.apply_xp_reward(
        rec.user_id,
        'weekly_mission_complete',
        p_iso_week || ':' || rec.metric_type,
        rec.completion_xp,
        rec.evidence || jsonb_build_object('cohort_key', v_cohort)
      );
      IF coalesce((v_result->>'success')::boolean, false) THEN
        v_completed := v_completed + 1;
        PERFORM private.record_learning_milestone(
          rec.user_id,
          'weekly_mission',
          p_iso_week || ':' || rec.metric_type,
          'cohort_weekly_score',
          NULL,
          rec.evidence || jsonb_build_object('cohort_key', v_cohort)
        );
      END IF;
    END LOOP;

    IF v_mode = 'none' THEN
      CONTINUE;
    END IF;

    FOR rec IN
      WITH ranked AS (
        SELECT
          s.user_id,
          s.metric_type,
          s.metric_value,
          s.evidence,
          t.mvp_xp,
          t.top3_xp,
          rank() OVER (ORDER BY s.metric_value DESC) AS placement
        FROM public.cohort_weekly_scores s
        JOIN public.cohort_weekly_mission_templates t
          ON t.metric_type = s.metric_type AND t.is_active = true
        WHERE s.cohort_key = v_cohort
          AND s.iso_week = p_iso_week
          AND s.qualification_met = true
      )
      SELECT *
      FROM ranked
      WHERE (v_mode = 'mvp' AND placement = 1)
         OR (v_mode = 'top3' AND placement <= 3)
    LOOP
      UPDATE public.cohort_weekly_scores
      SET rank_in_cohort = rec.placement::integer
      WHERE cohort_key = v_cohort
        AND iso_week = p_iso_week
        AND user_id = rec.user_id
        AND metric_type = rec.metric_type;

      v_result := private.apply_xp_reward(
        rec.user_id,
        CASE WHEN v_mode = 'mvp' THEN 'weekly_mvp' ELSE 'weekly_top3' END,
        p_iso_week || ':' || v_cohort || ':' || rec.placement::text,
        CASE WHEN v_mode = 'mvp' THEN rec.mvp_xp ELSE rec.top3_xp END,
        rec.evidence || jsonb_build_object(
          'cohort_key', v_cohort,
          'placement', rec.placement,
          'award_mode', v_mode
        )
      );

      IF coalesce((v_result->>'success')::boolean, false) THEN
        v_placed := v_placed + 1;
        INSERT INTO public.user_achievements
          (user_id, achievement_type, xp_bonus, is_notified, metadata)
        VALUES (
          rec.user_id,
          'cohort_weekly_' || p_iso_week || '_rank' || rec.placement::text,
          CASE WHEN v_mode = 'mvp' THEN rec.mvp_xp ELSE rec.top3_xp END,
          false,
          rec.evidence || jsonb_build_object(
            'cohort_key', v_cohort,
            'iso_week', p_iso_week,
            'rank', rec.placement,
            'award_mode', v_mode,
            'participant_count', v_participant_count
          )
        )
        ON CONFLICT (user_id, achievement_type) DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object(
    'mission_completions_awarded', v_completed,
    'placement_awards_granted', v_placed
  );
END;
$$;

REVOKE ALL ON FUNCTION public.award_cohort_weekly_top3(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.award_cohort_weekly_top3(text) TO service_role;

-- ---------------------------------------------------------------------------
-- 5. Written-exam milestone and journey projection
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.mark_written_exam_complete_impl()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  p_user_id uuid := auth.uid();
  v_license text;
  v_recorded boolean;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  UPDATE public.user_learning_profiles
  SET cohort_phase = 'post_written',
      written_exam_completed_at = now(),
      updated_at = now()
  WHERE user_id = p_user_id
    AND cohort_phase = 'active'
  RETURNING license_target INTO v_license;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'cannot transition to post_written';
  END IF;

  v_recorded := private.record_learning_milestone(
    p_user_id,
    'written_exam_complete',
    coalesce(v_license, 'CPL') || ':written',
    'user_confirmation',
    NULL,
    jsonb_build_object('license_target', v_license)
  );

  INSERT INTO public.user_achievements
    (user_id, achievement_type, xp_bonus, is_notified, metadata)
  VALUES (
    p_user_id,
    lower(coalesce(v_license, 'CPL')) || '_written_exam_complete',
    0,
    false,
    jsonb_build_object('license_target', v_license, 'phase', 'post_written')
  )
  ON CONFLICT (user_id, achievement_type) DO NOTHING;

  RETURN jsonb_build_object(
    'cohort_phase', 'post_written',
    'license_target', v_license,
    'milestone_recorded', v_recorded
  );
END;
$$;

REVOKE ALL ON FUNCTION private.mark_written_exam_complete_impl() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.mark_written_exam_complete_impl() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_learning_journey()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_profile public.user_learning_profiles%ROWTYPE;
  v_comprehension_count integer := 0;
  v_quiz_count integer := 0;
  v_mastered_subjects integer := 0;
  v_stage text;
  v_stage_order integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT * INTO v_profile
  FROM public.user_learning_profiles
  WHERE user_id = v_uid;

  SELECT count(*)::integer INTO v_comprehension_count
  FROM public.learning_milestones
  WHERE user_id = v_uid AND milestone_type = 'article_comprehension';

  SELECT count(*)::integer INTO v_quiz_count
  FROM public.quiz_sessions
  WHERE user_id = v_uid AND is_completed = true;

  SELECT count(*)::integer INTO v_mastered_subjects
  FROM (
    SELECT subject_category
    FROM public.user_test_results
    WHERE user_id = v_uid AND subject_category IS NOT NULL
    GROUP BY subject_category
    HAVING count(*) >= 10
       AND avg(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END) >= 0.8
  ) mastered;

  IF v_profile.user_id IS NULL OR v_profile.cohort_key IS NULL THEN
    v_stage := 'preparation';
    v_stage_order := 1;
  ELSIF v_profile.cohort_phase = 'post_written' THEN
    v_stage := 'written_complete';
    v_stage_order := 6;
  ELSIF v_profile.exam_date_status = 'set'
        AND v_profile.target_test_date <= (current_date + interval '30 days')::date THEN
    v_stage := 'exam_readiness';
    v_stage_order := 5;
  ELSIF v_mastered_subjects >= 2 THEN
    v_stage := 'cross_subject';
    v_stage_order := 4;
  ELSIF v_comprehension_count >= 3 OR v_quiz_count >= 3 THEN
    v_stage := 'subject_mastery';
    v_stage_order := 3;
  ELSE
    v_stage := 'foundation';
    v_stage_order := 2;
  END IF;

  RETURN jsonb_build_object(
    'license_target', coalesce(v_profile.license_target, 'CPL'),
    'stage', v_stage,
    'stage_order', v_stage_order,
    'cohort_phase', coalesce(v_profile.cohort_phase, 'active'),
    'target_test_date', v_profile.target_test_date,
    'article_comprehension_count', v_comprehension_count,
    'quiz_session_count', v_quiz_count,
    'mastered_subject_count', v_mastered_subjects,
    'written_exam_completed_at', v_profile.written_exam_completed_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_learning_journey() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_learning_journey() TO authenticated;

COMMIT;
