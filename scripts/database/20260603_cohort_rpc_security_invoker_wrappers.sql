-- Security Advisor linter 0029: cohort user RPCs as private DEFINER impl + public INVOKER wrappers.
-- Pattern: scripts/database/20260511_security_definer_rpc_hardening.sql
-- Do NOT add schema `private` to API "Exposed schemas".

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO postgres;
GRANT USAGE ON SCHEMA private TO authenticated;

-- ---------------------------------------------------------------------------
-- upsert_user_cohort
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.upsert_user_cohort_impl(
  p_license text DEFAULT 'CPL',
  p_exam_ym text DEFAULT NULL,
  p_undecided boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_key text;
  v_status text;
  v_target date;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF coalesce(p_undecided, false) THEN
    v_status := 'undecided';
    v_key := private.build_cohort_key(p_license, NULL, true);
    v_target := NULL;
  ELSE
    v_status := 'set';
    v_key := private.build_cohort_key(p_license, p_exam_ym, false);
    v_target := (p_exam_ym || '-01')::date;
  END IF;

  INSERT INTO public.user_learning_profiles (user_id, updated_at)
  VALUES (v_uid, now())
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.user_learning_profiles
  SET
    license_target = upper(trim(p_license)),
    exam_date_status = v_status,
    cohort_key = v_key,
    target_test_date = v_target,
    cohort_registered_at = coalesce(cohort_registered_at, now()),
    updated_at = now()
  WHERE user_id = v_uid;

  RETURN jsonb_build_object(
    'cohort_key', v_key,
    'exam_date_status', v_status,
    'target_test_date', v_target
  );
END;
$$;

ALTER FUNCTION private.upsert_user_cohort_impl(text, text, boolean) OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.upsert_user_cohort(
  p_license text DEFAULT 'CPL',
  p_exam_ym text DEFAULT NULL,
  p_undecided boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT private.upsert_user_cohort_impl(p_license, p_exam_ym, p_undecided);
$$;

-- ---------------------------------------------------------------------------
-- get_cohort_anonymous_stats (MVP tier fields from 20260626)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.get_cohort_anonymous_stats_impl(p_cohort_key text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_key text;
  v_iso text;
  v_bounds record;
  v_count bigint;
  v_avg_accuracy numeric;
  v_median_effort numeric;
  v_week_index int;
  v_mission record;
  v_award_tier text;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT cohort_key INTO v_key FROM public.user_learning_profiles WHERE user_id = v_uid;
  v_key := coalesce(p_cohort_key, v_key);
  IF v_key IS NULL THEN
    RETURN jsonb_build_object('registered', false);
  END IF;

  SELECT count(*) INTO v_count
  FROM public.user_learning_profiles
  WHERE cohort_key = v_key AND cohort_phase = 'active';

  v_award_tier := CASE
    WHEN v_count >= 10 THEN 'top3'
    WHEN v_count >= 3 THEN 'mvp'
    ELSE 'none'
  END;

  v_iso := private.cohort_iso_week_for_ts(now());
  SELECT * INTO v_bounds FROM private.cohort_week_bounds_jst(v_iso);

  SELECT round(avg(qs.score_percentage)::numeric, 1) INTO v_avg_accuracy
  FROM public.quiz_sessions qs
  INNER JOIN public.user_learning_profiles ulp ON ulp.user_id = qs.user_id
  WHERE ulp.cohort_key = v_key
    AND qs.is_completed = true
    AND qs.completed_at >= v_bounds.week_start
    AND qs.completed_at < v_bounds.week_end_exclusive;

  SELECT round(percentile_cont(0.5) WITHIN GROUP (ORDER BY sub.effort)::numeric, 0) INTO v_median_effort
  FROM (
    SELECT coalesce(sum(qs.questions_attempted), 0) + coalesce(sum(qs.total_time_spent), 0) / 60.0 AS effort
    FROM public.user_learning_profiles ulp
    LEFT JOIN public.quiz_sessions qs ON qs.user_id = ulp.user_id
      AND qs.is_completed = true
      AND qs.completed_at >= v_bounds.week_start
      AND qs.completed_at < v_bounds.week_end_exclusive
    WHERE ulp.cohort_key = v_key
    GROUP BY ulp.user_id
  ) sub;

  v_week_index := ((extract(week FROM (now() AT TIME ZONE 'Asia/Tokyo')::date)::int - 1) % 4) + 1;
  SELECT * INTO v_mission FROM public.cohort_weekly_mission_templates
  WHERE week_index = v_week_index AND is_active LIMIT 1;

  RETURN jsonb_build_object(
    'registered', true,
    'cohort_key', v_key,
    'participant_count', v_count,
    'iso_week', v_iso,
    'avg_accuracy', v_avg_accuracy,
    'median_effort', v_median_effort,
    'week_index', v_week_index,
    'mission_title', v_mission.title,
    'mission_description', v_mission.description,
    'metric_type', v_mission.metric_type,
    'min_population_mvp', 3,
    'min_population_top3', 10,
    'award_tier', v_award_tier
  );
END;
$$;

ALTER FUNCTION private.get_cohort_anonymous_stats_impl(text) OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.get_cohort_anonymous_stats(p_cohort_key text DEFAULT NULL)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT private.get_cohort_anonymous_stats_impl(p_cohort_key);
$$;

-- ---------------------------------------------------------------------------
-- get_user_cohort_profile
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.get_user_cohort_profile_impl()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'license_target', ulp.license_target,
    'exam_date_status', ulp.exam_date_status,
    'cohort_key', ulp.cohort_key,
    'cohort_phase', ulp.cohort_phase,
    'target_test_date', ulp.target_test_date,
    'written_exam_completed_at', ulp.written_exam_completed_at,
    'cohort_registered_at', ulp.cohort_registered_at
  )
  FROM public.user_learning_profiles ulp
  WHERE ulp.user_id = auth.uid();
$$;

ALTER FUNCTION private.get_user_cohort_profile_impl() OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.get_user_cohort_profile()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT private.get_user_cohort_profile_impl();
$$;

-- ---------------------------------------------------------------------------
-- mark_written_exam_complete
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.mark_written_exam_complete_impl()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  UPDATE public.user_learning_profiles
  SET
    cohort_phase = 'post_written',
    written_exam_completed_at = now(),
    updated_at = now()
  WHERE user_id = v_uid AND cohort_phase = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'cannot transition to post_written';
  END IF;

  RETURN jsonb_build_object('cohort_phase', 'post_written');
END;
$$;

ALTER FUNCTION private.mark_written_exam_complete_impl() OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.mark_written_exam_complete()
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT private.mark_written_exam_complete_impl();
$$;

-- ---------------------------------------------------------------------------
-- get_public_user_badges
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.get_public_user_badges_impl(p_user_id uuid)
RETURNS SETOF jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = p_user_id AND p.leaderboard_opt_in = true
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT jsonb_build_object(
    'achievement_type', ua.achievement_type,
    'achieved_at', ua.achieved_at,
    'metadata', ua.metadata
  )
  FROM public.user_achievements ua
  WHERE ua.user_id = p_user_id
    AND ua.achievement_type LIKE 'cohort_weekly_%'
  ORDER BY ua.achieved_at DESC;
END;
$$;

ALTER FUNCTION private.get_public_user_badges_impl(uuid) OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.get_public_user_badges(p_user_id uuid)
RETURNS SETOF jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT * FROM private.get_public_user_badges_impl(p_user_id);
$$;

-- ---------------------------------------------------------------------------
-- EXECUTE grants (private impl + public invoker wrappers)
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION private.upsert_user_cohort_impl(text, text, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.get_cohort_anonymous_stats_impl(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.get_user_cohort_profile_impl() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.mark_written_exam_complete_impl() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.get_public_user_badges_impl(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION private.upsert_user_cohort_impl(text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION private.get_cohort_anonymous_stats_impl(text) TO authenticated;
GRANT EXECUTE ON FUNCTION private.get_user_cohort_profile_impl() TO authenticated;
GRANT EXECUTE ON FUNCTION private.mark_written_exam_complete_impl() TO authenticated;
GRANT EXECUTE ON FUNCTION private.get_public_user_badges_impl(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.upsert_user_cohort(text, text, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_cohort_anonymous_stats(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_user_cohort_profile() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mark_written_exam_complete() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_public_user_badges(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.upsert_user_cohort(text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_cohort_anonymous_stats(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_cohort_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_written_exam_complete() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_user_badges(uuid) TO authenticated;
