-- Phase 2 follow-up: INVOKER wrappers for journey / formation RPCs
-- (Security Advisor 0029). Bodies live in private.*_impl.

CREATE OR REPLACE FUNCTION private.get_learning_journey_impl()
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
  v_delayed_count integer := 0;
  v_weakness_count integer := 0;
  v_quiz_count integer := 0;
  v_mastered_subjects integer := 0;
  v_srs_due integer := 0;
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

  SELECT count(*)::integer INTO v_delayed_count
  FROM public.learning_milestones
  WHERE user_id = v_uid AND milestone_type = 'delayed_retention';

  SELECT count(*)::integer INTO v_weakness_count
  FROM public.learning_milestones
  WHERE user_id = v_uid AND milestone_type = 'weakness_improvement';

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

  SELECT count(*)::integer INTO v_srs_due
  FROM public.user_unified_srs_status
  WHERE user_id = v_uid
    AND next_review_date IS NOT NULL
    AND next_review_date <= now();

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
  ELSIF v_comprehension_count >= 3 OR v_quiz_count >= 3 OR v_delayed_count >= 1 THEN
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
    'delayed_retention_count', v_delayed_count,
    'weakness_improvement_count', v_weakness_count,
    'quiz_session_count', v_quiz_count,
    'mastered_subject_count', v_mastered_subjects,
    'srs_due_count', v_srs_due,
    'written_exam_completed_at', v_profile.written_exam_completed_at
  );
END;
$$;

REVOKE ALL ON FUNCTION private.get_learning_journey_impl()
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.get_learning_journey_impl() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_learning_journey()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT private.get_learning_journey_impl();
$$;

REVOKE ALL ON FUNCTION public.get_learning_journey()
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_learning_journey() TO authenticated;

CREATE OR REPLACE FUNCTION private.get_cohort_formation_progress_impl()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_profile public.user_learning_profiles%ROWTYPE;
  v_iso_week text;
  v_template public.cohort_weekly_mission_templates%ROWTYPE;
  v_week_index integer;
  v_participant_count integer := 0;
  v_qualified_count integer := 0;
  v_shared_threshold integer;
  v_my_score numeric := 0;
  v_my_qualified boolean := false;
  v_metric_type text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT * INTO v_profile
  FROM public.user_learning_profiles
  WHERE user_id = v_uid;

  IF v_profile.user_id IS NULL
     OR v_profile.cohort_key IS NULL
     OR v_profile.cohort_phase IS DISTINCT FROM 'active'
     OR v_profile.exam_date_status IS DISTINCT FROM 'set' THEN
    RETURN jsonb_build_object(
      'registered', false,
      'eligible', false
    );
  END IF;

  v_iso_week := to_char(now() AT TIME ZONE 'Asia/Tokyo', 'IYYY-"W"IW');
  v_week_index := ((split_part(v_iso_week, '-W', 2)::integer - 1) % 4) + 1;

  SELECT * INTO v_template
  FROM public.cohort_weekly_mission_templates
  WHERE week_index = v_week_index AND is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'registered', true,
      'eligible', false,
      'cohort_key', v_profile.cohort_key,
      'iso_week', v_iso_week
    );
  END IF;

  v_metric_type := v_template.metric_type;

  SELECT count(*)::integer INTO v_participant_count
  FROM public.user_learning_profiles
  WHERE cohort_key = v_profile.cohort_key
    AND cohort_phase = 'active'
    AND exam_date_status = 'set';

  SELECT count(*)::integer INTO v_qualified_count
  FROM public.cohort_weekly_scores
  WHERE cohort_key = v_profile.cohort_key
    AND iso_week = v_iso_week
    AND metric_type = v_metric_type
    AND qualification_met = true;

  SELECT
    coalesce(metric_value, 0),
    coalesce(qualification_met, false)
  INTO v_my_score, v_my_qualified
  FROM public.cohort_weekly_scores
  WHERE cohort_key = v_profile.cohort_key
    AND iso_week = v_iso_week
    AND user_id = v_uid
    AND metric_type = v_metric_type;

  v_shared_threshold := greatest(3, ceil(v_participant_count * 0.5)::integer);

  RETURN jsonb_build_object(
    'registered', true,
    'eligible', true,
    'cohort_key', v_profile.cohort_key,
    'iso_week', v_iso_week,
    'week_index', v_week_index,
    'metric_type', v_metric_type,
    'mission_title', v_template.title,
    'mission_description', v_template.description,
    'participant_count', v_participant_count,
    'qualified_count', v_qualified_count,
    'shared_threshold', v_shared_threshold,
    'shared_progress_pct',
      CASE
        WHEN v_shared_threshold <= 0 THEN 0
        ELSE least(100, round(100.0 * v_qualified_count / v_shared_threshold))
      END,
    'shared_complete', v_qualified_count >= v_shared_threshold,
    'my_metric_value', v_my_score,
    'my_qualification_met', v_my_qualified
  );
END;
$$;

REVOKE ALL ON FUNCTION private.get_cohort_formation_progress_impl()
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.get_cohort_formation_progress_impl() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_cohort_formation_progress()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT private.get_cohort_formation_progress_impl();
$$;

REVOKE ALL ON FUNCTION public.get_cohort_formation_progress()
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_cohort_formation_progress() TO authenticated;
