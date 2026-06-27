-- Cohort weekly awards: MVP at 3-9 active members, TOP3 at 10+.
-- Requires metric_value > 0. MVP allows tied rank 1 (co-MVP).

-- ---------------------------------------------------------------------------
-- get_cohort_anonymous_stats — add MVP tier fields
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_cohort_anonymous_stats(p_cohort_key text DEFAULT NULL)
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

REVOKE ALL ON FUNCTION public.get_cohort_anonymous_stats(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_cohort_anonymous_stats(text) TO authenticated;

-- ---------------------------------------------------------------------------
-- award_cohort_weekly_top3 — tiered MVP / TOP3 (RPC name unchanged)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.award_cohort_weekly_top3(p_iso_week text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cohort text;
  v_count int;
  v_awarded int := 0;
  v_week_index int;
  v_achievement_type text;
  v_award_mode text;
  rec record;
BEGIN
  v_week_index := ((split_part(p_iso_week, '-W', 2)::int - 1) % 4) + 1;
  v_achievement_type := 'cohort_weekly_w' || v_week_index;

  FOR v_cohort IN
    SELECT DISTINCT cohort_key FROM public.cohort_weekly_scores WHERE iso_week = p_iso_week
  LOOP
    SELECT count(DISTINCT user_id) INTO v_count
    FROM public.user_learning_profiles
    WHERE cohort_key = v_cohort AND cohort_phase = 'active';

    IF v_count < 3 THEN
      CONTINUE;
    END IF;

    v_award_mode := CASE WHEN v_count >= 10 THEN 'top3' ELSE 'mvp' END;

    FOR rec IN
      WITH ranked AS (
        SELECT user_id, metric_value,
          rank() OVER (ORDER BY metric_value DESC) AS rk
        FROM public.cohort_weekly_scores
        WHERE cohort_key = v_cohort
          AND iso_week = p_iso_week
          AND metric_value > 0
      ),
      eligible AS (
        SELECT user_id, metric_value, rk
        FROM ranked
        WHERE (v_award_mode = 'top3' AND rk <= 3)
           OR (v_award_mode = 'mvp' AND rk = 1)
      )
      SELECT user_id, metric_value, rk FROM eligible
    LOOP
      UPDATE public.cohort_weekly_scores
      SET rank_in_cohort = rec.rk::int
      WHERE cohort_key = v_cohort AND iso_week = p_iso_week AND user_id = rec.user_id;

      INSERT INTO public.user_achievements (user_id, achievement_type, xp_bonus, is_notified, metadata)
      VALUES (
        rec.user_id,
        v_achievement_type || '_rank' || rec.rk::text,
        50,
        false,
        jsonb_build_object(
          'cohort_key', v_cohort,
          'iso_week', p_iso_week,
          'rank', rec.rk,
          'metric_value', rec.metric_value,
          'award_mode', v_award_mode,
          'participant_count', v_count
        )
      )
      ON CONFLICT (user_id, achievement_type) DO NOTHING;

      IF FOUND THEN
        v_awarded := v_awarded + 1;
      END IF;
    END LOOP;
  END LOOP;

  RETURN v_awarded;
END;
$$;

REVOKE ALL ON FUNCTION public.award_cohort_weekly_top3(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.award_cohort_weekly_top3(text) TO service_role;
