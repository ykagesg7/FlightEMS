-- Phase 2 mastery loop: SRS write path, weak-area refresh,
-- delayed retention XP, weakness improvement XP, formation quest.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Sync SRS cards from a completed quiz session
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.sync_srs_after_session_impl(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_session public.quiz_sessions%ROWTYPE;
  v_updated integer := 0;
  rec record;
  v_ease numeric;
  v_reps integer;
  v_interval integer;
  v_next timestamptz;
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

  FOR rec IN
    SELECT
      coalesce(utr.unified_question_id::text, nullif(utr.question_id, '')) AS qid,
      utr.id AS attempt_id,
      utr.is_correct
    FROM public.user_test_results utr
    WHERE utr.user_id = v_uid
      AND utr.session_id = p_session_id
      AND (
        utr.unified_question_id IS NOT NULL
        OR utr.question_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      )
  LOOP
    IF rec.qid IS NULL THEN
      CONTINUE;
    END IF;

    -- Skip IDs that are not in the unified question bank.
    IF NOT EXISTS (
      SELECT 1 FROM public.unified_cpl_questions u WHERE u.id::text = rec.qid
    ) THEN
      CONTINUE;
    END IF;

    SELECT
      coalesce(s.ease_factor, 2.5),
      coalesce(s.repetitions, 0),
      coalesce(s.interval_days, 1)
    INTO v_ease, v_reps, v_interval
    FROM public.user_unified_srs_status s
    WHERE s.user_id = v_uid AND s.question_id = rec.qid::uuid;

    IF NOT FOUND THEN
      v_ease := 2.5;
      v_reps := 0;
      v_interval := 1;
    END IF;

    IF rec.is_correct THEN
      v_reps := v_reps + 1;
      v_ease := least(3.0, greatest(1.3, v_ease + 0.1));
      IF v_reps = 1 THEN
        v_interval := 1;
      ELSIF v_reps = 2 THEN
        v_interval := 3;
      ELSE
        v_interval := greatest(1, round(v_interval * v_ease)::integer);
      END IF;
      v_next := now() + make_interval(days => v_interval);
    ELSE
      v_reps := 0;
      v_ease := greatest(1.3, v_ease - 0.2);
      v_interval := 1;
      v_next := now() + interval '1 day';
    END IF;

    INSERT INTO public.user_unified_srs_status AS s (
      user_id,
      question_id,
      ease_factor,
      interval_days,
      repetitions,
      next_review_date,
      last_attempt_record_id,
      updated_at
    )
    VALUES (
      v_uid,
      rec.qid::uuid,
      v_ease,
      v_interval,
      v_reps,
      v_next,
      rec.attempt_id,
      now()
    )
    ON CONFLICT (user_id, question_id) DO UPDATE
      SET ease_factor = excluded.ease_factor,
          interval_days = excluded.interval_days,
          repetitions = excluded.repetitions,
          next_review_date = excluded.next_review_date,
          last_attempt_record_id = excluded.last_attempt_record_id,
          updated_at = now();

    v_updated := v_updated + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'cards_updated', v_updated
  );
END;
$$;

REVOKE ALL ON FUNCTION private.sync_srs_after_session_impl(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.sync_srs_after_session_impl(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.sync_srs_after_session(p_session_id uuid)
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT private.sync_srs_after_session_impl(p_session_id);
$$;

REVOKE ALL ON FUNCTION public.sync_srs_after_session(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.sync_srs_after_session(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- 2. Refresh weak areas from cumulative test results
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.refresh_user_weak_areas_impl()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_rows integer := 0;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  INSERT INTO public.user_weak_areas AS w (
    user_id,
    subject_category,
    sub_category,
    accuracy_rate,
    attempt_count,
    priority_level,
    improvement_trend,
    first_identified,
    last_updated
  )
  SELECT
    v_uid,
    subject_category,
    'general',
    round(100.0 * sum(CASE WHEN is_correct THEN 1 ELSE 0 END) / count(*))::numeric,
    count(*)::integer,
    CASE
      WHEN round(100.0 * sum(CASE WHEN is_correct THEN 1 ELSE 0 END) / count(*)) < 40 THEN 1
      WHEN round(100.0 * sum(CASE WHEN is_correct THEN 1 ELSE 0 END) / count(*)) < 60 THEN 2
      ELSE 3
    END,
    CASE
      WHEN round(100.0 * sum(CASE WHEN is_correct THEN 1 ELSE 0 END) / count(*)) < 60
        THEN 'declining'
      ELSE 'stable'
    END,
    min(coalesce(answered_at, created_at)),
    now()
  FROM public.user_test_results
  WHERE user_id = v_uid
    AND subject_category IS NOT NULL
    AND btrim(subject_category) <> ''
  GROUP BY subject_category
  HAVING count(*) >= 5
  ON CONFLICT (user_id, subject_category, sub_category) DO UPDATE
    SET accuracy_rate = excluded.accuracy_rate,
        attempt_count = excluded.attempt_count,
        priority_level = excluded.priority_level,
        improvement_trend = excluded.improvement_trend,
        last_updated = now();

  GET DIAGNOSTICS v_rows = ROW_COUNT;

  DELETE FROM public.user_weak_areas w
  WHERE w.user_id = v_uid
    AND NOT EXISTS (
      SELECT 1
      FROM public.user_test_results utr
      WHERE utr.user_id = v_uid
        AND utr.subject_category = w.subject_category
      GROUP BY utr.subject_category
      HAVING count(*) >= 5
         AND round(100.0 * sum(CASE WHEN utr.is_correct THEN 1 ELSE 0 END) / count(*)) < 70
    );

  RETURN jsonb_build_object('success', true, 'subjects_upserted', v_rows);
END;
$$;

REVOKE ALL ON FUNCTION private.refresh_user_weak_areas_impl()
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.refresh_user_weak_areas_impl() TO authenticated;

CREATE OR REPLACE FUNCTION public.refresh_user_weak_areas()
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT private.refresh_user_weak_areas_impl();
$$;

REVOKE ALL ON FUNCTION public.refresh_user_weak_areas()
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.refresh_user_weak_areas() TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. Delayed retention XP (7+ day retest or due SRS review success)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.award_delayed_retention_xp_impl(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_session public.quiz_sessions%ROWTYPE;
  v_awarded integer := 0;
  v_xp_total integer := 0;
  rec record;
  v_result jsonb;
  v_qid text;
  v_due boolean;
  v_prior_wrong boolean;
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

  FOR rec IN
    SELECT
      utr.id AS attempt_id,
      coalesce(utr.unified_question_id::text, nullif(utr.question_id, '')) AS qid,
      utr.is_correct,
      coalesce(utr.answered_at, utr.created_at) AS answered_at
    FROM public.user_test_results utr
    WHERE utr.user_id = v_uid
      AND utr.session_id = p_session_id
      AND utr.is_correct = true
  LOOP
    v_qid := rec.qid;
    IF v_qid IS NULL THEN
      CONTINUE;
    END IF;

    SELECT EXISTS (
      SELECT 1
      FROM public.user_unified_srs_status s
      WHERE s.user_id = v_uid
        AND s.question_id = v_qid::uuid
        AND s.next_review_date IS NOT NULL
        AND s.next_review_date <= coalesce(v_session.completed_at, now())
    ) INTO v_due;

    SELECT EXISTS (
      SELECT 1
      FROM public.user_test_results prior
      WHERE prior.user_id = v_uid
        AND (
          prior.unified_question_id::text = v_qid
          OR prior.question_id = v_qid
        )
        AND prior.is_correct = false
        AND coalesce(prior.answered_at, prior.created_at)
              <= coalesce(rec.answered_at, now()) - interval '7 days'
    ) INTO v_prior_wrong;

    IF NOT (v_due OR v_prior_wrong) THEN
      CONTINUE;
    END IF;

    IF NOT private.record_learning_milestone(
      v_uid,
      'delayed_retention',
      v_qid,
      'quiz_session',
      p_session_id::text,
      jsonb_build_object(
        'due_srs', v_due,
        'prior_wrong_7d', v_prior_wrong,
        'session_type', v_session.session_type
      )
    ) THEN
      CONTINUE;
    END IF;

    v_result := private.apply_xp_reward(
      v_uid,
      'delayed_retention',
      v_qid,
      10,
      jsonb_build_object(
        'rule_version', 1,
        'session_id', p_session_id,
        'due_srs', v_due,
        'prior_wrong_7d', v_prior_wrong
      )
    );

    IF coalesce((v_result->>'success')::boolean, false) THEN
      v_awarded := v_awarded + 1;
      v_xp_total := v_xp_total + 10;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'milestones_awarded', v_awarded,
    'xp_awarded', v_xp_total
  );
END;
$$;

REVOKE ALL ON FUNCTION private.award_delayed_retention_xp_impl(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.award_delayed_retention_xp_impl(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.award_delayed_retention_xp(p_session_id uuid)
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT private.award_delayed_retention_xp_impl(p_session_id);
$$;

REVOKE ALL ON FUNCTION public.award_delayed_retention_xp(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.award_delayed_retention_xp(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- 4. Weakness improvement XP (subject recovered this ISO week)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.award_weakness_improvement_xp_impl(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_session public.quiz_sessions%ROWTYPE;
  v_week text;
  v_awarded integer := 0;
  v_xp_total integer := 0;
  rec record;
  v_recent_acc numeric;
  v_recent_n integer;
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

  -- Ensure weak-area snapshot is current before judging recovery.
  PERFORM private.refresh_user_weak_areas_impl();

  v_week := to_char(now() AT TIME ZONE 'Asia/Tokyo', 'IYYY-"W"IW');

  FOR rec IN
    SELECT DISTINCT utr.subject_category
    FROM public.user_test_results utr
    WHERE utr.user_id = v_uid
      AND utr.session_id = p_session_id
      AND utr.subject_category IS NOT NULL
  LOOP
    SELECT
      count(*)::integer,
      round(
        100.0 * sum(CASE WHEN is_correct THEN 1 ELSE 0 END) / greatest(count(*), 1),
        1
      )
    INTO v_recent_n, v_recent_acc
    FROM (
      SELECT is_correct
      FROM public.user_test_results
      WHERE user_id = v_uid
        AND subject_category = rec.subject_category
      ORDER BY coalesce(answered_at, created_at) DESC
      LIMIT 10
    ) recent;

    IF v_recent_n < 10 OR v_recent_acc < 70 THEN
      CONTINUE;
    END IF;

    -- Must have been weak historically (attempt>=5 and overall accuracy < 60)
    -- OR currently tracked in user_weak_areas with accuracy_rate < 60.
    IF NOT EXISTS (
      SELECT 1
      FROM (
        SELECT
          count(*) AS total,
          round(100.0 * sum(CASE WHEN is_correct THEN 1 ELSE 0 END) / count(*)) AS acc
        FROM public.user_test_results
        WHERE user_id = v_uid
          AND subject_category = rec.subject_category
      ) hist
      WHERE hist.total >= 5 AND hist.acc < 60
    ) AND NOT EXISTS (
      SELECT 1
      FROM public.user_weak_areas w
      WHERE w.user_id = v_uid
        AND w.subject_category = rec.subject_category
        AND w.accuracy_rate < 60
    ) THEN
      CONTINUE;
    END IF;

    IF NOT private.record_learning_milestone(
      v_uid,
      'weakness_improvement',
      rec.subject_category || ':' || v_week,
      'quiz_session',
      p_session_id::text,
      jsonb_build_object(
        'subject_category', rec.subject_category,
        'recent_accuracy', v_recent_acc,
        'recent_n', v_recent_n,
        'iso_week', v_week
      )
    ) THEN
      CONTINUE;
    END IF;

    v_result := private.apply_xp_reward(
      v_uid,
      'weakness_improvement',
      rec.subject_category || ':' || v_week,
      15,
      jsonb_build_object(
        'rule_version', 1,
        'session_id', p_session_id,
        'subject_category', rec.subject_category,
        'recent_accuracy', v_recent_acc
      )
    );

    IF coalesce((v_result->>'success')::boolean, false) THEN
      v_awarded := v_awarded + 1;
      v_xp_total := v_xp_total + 15;

      UPDATE public.user_weak_areas
      SET improvement_trend = 'improving',
          last_updated = now()
      WHERE user_id = v_uid
        AND subject_category = rec.subject_category;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'subjects_awarded', v_awarded,
    'xp_awarded', v_xp_total
  );
END;
$$;

REVOKE ALL ON FUNCTION private.award_weakness_improvement_xp_impl(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.award_weakness_improvement_xp_impl(uuid)
  TO authenticated;

CREATE OR REPLACE FUNCTION public.award_weakness_improvement_xp(p_session_id uuid)
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT private.award_weakness_improvement_xp_impl(p_session_id);
$$;

REVOKE ALL ON FUNCTION public.award_weakness_improvement_xp(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.award_weakness_improvement_xp(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- 5. Formation (cooperative) quest progress + shared completion bonus
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_cohort_formation_progress()
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

REVOKE ALL ON FUNCTION public.get_cohort_formation_progress()
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_cohort_formation_progress() TO authenticated;

-- Shared formation bonus inside weekly award job (service_role).
CREATE OR REPLACE FUNCTION private.award_formation_quest_bonus(
  p_iso_week text,
  p_cohort_key text,
  p_metric_type text,
  p_qualified_count integer,
  p_threshold integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  v_placed integer := 0;
  rec record;
  v_result jsonb;
BEGIN
  IF p_qualified_count < p_threshold THEN
    RETURN 0;
  END IF;

  FOR rec IN
    SELECT user_id
    FROM public.cohort_weekly_scores
    WHERE cohort_key = p_cohort_key
      AND iso_week = p_iso_week
      AND metric_type = p_metric_type
      AND qualification_met = true
  LOOP
    v_result := private.apply_xp_reward(
      rec.user_id,
      'formation_quest',
      p_iso_week || ':' || p_cohort_key || ':' || p_metric_type,
      10,
      jsonb_build_object(
        'cohort_key', p_cohort_key,
        'qualified_count', p_qualified_count,
        'threshold', p_threshold,
        'metric_type', p_metric_type
      )
    );

    IF coalesce((v_result->>'success')::boolean, false) THEN
      v_placed := v_placed + 1;
      PERFORM private.record_learning_milestone(
        rec.user_id,
        'weekly_mission',
        p_iso_week || ':formation:' || p_metric_type,
        'cohort_formation_quest',
        NULL,
        jsonb_build_object(
          'cohort_key', p_cohort_key,
          'qualified_count', p_qualified_count,
          'threshold', p_threshold
        )
      );
    END IF;
  END LOOP;

  RETURN v_placed;
END;
$$;

REVOKE ALL ON FUNCTION private.award_formation_quest_bonus(text, text, text, integer, integer)
  FROM PUBLIC, anon, authenticated, service_role;

-- Patch award_cohort_weekly_top3 to also grant formation bonus.
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
  v_formation integer := 0;
  v_result jsonb;
  v_qualified_count integer;
  v_threshold integer;
  v_metric_type text;
  rec record;
BEGIN
  IF p_iso_week !~ '^[0-9]{4}-W[0-9]{2}$' THEN
    RAISE EXCEPTION 'invalid ISO week';
  END IF;

  UPDATE public.cohort_weekly_scores s
  SET
    qualification_met = s.metric_value >= t.completion_threshold,
    evidence = jsonb_build_object(
      'metric_value', s.metric_value,
      'threshold', t.completion_threshold
    )
  FROM public.cohort_weekly_mission_templates t
  WHERE s.iso_week = p_iso_week
    AND s.metric_type = t.metric_type
    AND t.is_active;

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

    SELECT
      count(*)::integer,
      max(s.metric_type)
    INTO v_qualified_count, v_metric_type
    FROM public.cohort_weekly_scores s
    WHERE s.cohort_key = v_cohort
      AND s.iso_week = p_iso_week
      AND s.qualification_met = true;

    v_threshold := greatest(3, ceil(v_participant_count * 0.5)::integer);
    IF v_metric_type IS NOT NULL THEN
      v_formation := v_formation + private.award_formation_quest_bonus(
        p_iso_week,
        v_cohort,
        v_metric_type,
        coalesce(v_qualified_count, 0),
        v_threshold
      );
    END IF;

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
    'placement_awards_granted', v_placed,
    'formation_bonuses_granted', v_formation
  );
END;
$$;

REVOKE ALL ON FUNCTION public.award_cohort_weekly_top3(text)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.award_cohort_weekly_top3(text) TO service_role;

-- ---------------------------------------------------------------------------
-- 6. Extend learning journey projection with mastery counters
-- ---------------------------------------------------------------------------
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

REVOKE ALL ON FUNCTION public.get_learning_journey()
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_learning_journey() TO authenticated;

COMMIT;
