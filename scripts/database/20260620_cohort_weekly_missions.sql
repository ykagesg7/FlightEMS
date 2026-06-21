-- Cohort weekly missions, TOP3 badges, notifications (Phase D pilot)
-- Week: ISO YYYY-Www, JST Mon 00:00 – Sat 23:59:59, batch Sunday 09:00 JST

-- ---------------------------------------------------------------------------
-- 1. user_learning_profiles extensions
-- ---------------------------------------------------------------------------
ALTER TABLE public.user_learning_profiles
  ADD COLUMN IF NOT EXISTS license_target text NOT NULL DEFAULT 'CPL',
  ADD COLUMN IF NOT EXISTS exam_date_status text CHECK (exam_date_status IN ('set', 'undecided')),
  ADD COLUMN IF NOT EXISTS cohort_key text,
  ADD COLUMN IF NOT EXISTS cohort_phase text NOT NULL DEFAULT 'active'
    CHECK (cohort_phase IN ('active', 'post_written', 'alumni')),
  ADD COLUMN IF NOT EXISTS written_exam_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS cohort_registered_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_user_learning_profiles_cohort_key
  ON public.user_learning_profiles (cohort_key)
  WHERE cohort_key IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 2. cohort_weekly_mission_templates
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cohort_weekly_mission_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_index integer NOT NULL CHECK (week_index >= 1),
  metric_type text NOT NULL CHECK (metric_type IN ('sprint', 'precision', 'comeback', 'consistency')),
  title text NOT NULL,
  description text,
  min_questions integer NOT NULL DEFAULT 10,
  xp_bonus integer NOT NULL DEFAULT 50,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (week_index, metric_type)
);

INSERT INTO public.cohort_weekly_mission_templates
  (week_index, metric_type, title, description, min_questions, xp_bonus)
VALUES
  (1, 'sprint', 'Sprint — 今週の努力量',
   'クイズ回答数と学習時間の合計で競います。量を積み重ねて仲間と並走しましょう。',
   5, 50),
  (2, 'precision', 'Precision — 正答率',
   '今週のクイズ正答率（最低10問以上）で競います。正確さを追求しましょう。',
   10, 75),
  (3, 'comeback', 'Comeback — 伸び率',
   '前週比の正答率改善幅で競います。弱点克服の勢いを可視化します。',
   10, 75),
  (4, 'consistency', 'Consistency — 継続',
   '今週のアクティブ日数（クイズまたは記事読了）で競います。',
   0, 50)
ON CONFLICT (week_index, metric_type) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. cohort_weekly_scores
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cohort_weekly_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_key text NOT NULL,
  iso_week text NOT NULL,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  metric_type text NOT NULL,
  metric_value numeric NOT NULL DEFAULT 0,
  rank_in_cohort integer,
  computed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cohort_key, iso_week, user_id, metric_type)
);

CREATE INDEX IF NOT EXISTS idx_cohort_weekly_scores_lookup
  ON public.cohort_weekly_scores (cohort_key, iso_week);

-- ---------------------------------------------------------------------------
-- 4. notification_deliveries
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('in_app', 'email', 'push')),
  template_key text NOT NULL,
  dedupe_key text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb,
  UNIQUE (user_id, channel, dedupe_key)
);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_user
  ON public.notification_deliveries (user_id, sent_at DESC);

-- ---------------------------------------------------------------------------
-- 5. in_app_notifications
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.in_app_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  link_url text,
  template_key text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_in_app_notifications_user_unread
  ON public.in_app_notifications (user_id, created_at DESC)
  WHERE read_at IS NULL;

-- ---------------------------------------------------------------------------
-- 6. push_subscriptions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, endpoint)
);

-- ---------------------------------------------------------------------------
-- 7. RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.cohort_weekly_mission_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_weekly_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.in_app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cohort_weekly_mission_templates_select ON public.cohort_weekly_mission_templates;
CREATE POLICY cohort_weekly_mission_templates_select ON public.cohort_weekly_mission_templates
  FOR SELECT TO authenticated USING (is_active = true);

DROP POLICY IF EXISTS cohort_weekly_scores_select_own ON public.cohort_weekly_scores;
CREATE POLICY cohort_weekly_scores_select_own ON public.cohort_weekly_scores
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS in_app_notifications_own ON public.in_app_notifications;
CREATE POLICY in_app_notifications_own ON public.in_app_notifications
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS push_subscriptions_own ON public.push_subscriptions;
CREATE POLICY push_subscriptions_own ON public.push_subscriptions
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ---------------------------------------------------------------------------
-- 8. Helpers (JST week boundaries)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.cohort_iso_week_for_ts(p_ts timestamptz DEFAULT now())
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT to_char((p_ts AT TIME ZONE 'Asia/Tokyo')::date, 'IYYY-"W"IW');
$$;

CREATE OR REPLACE FUNCTION private.cohort_week_bounds_jst(p_iso_week text)
RETURNS TABLE (week_start timestamptz, week_end_exclusive timestamptz)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  v_year int;
  v_week int;
  v_monday date;
BEGIN
  v_year := split_part(p_iso_week, '-W', 1)::int;
  v_week := split_part(p_iso_week, '-W', 2)::int;
  v_monday := to_date(v_year::text || v_week::text, 'IYYYIW');
  week_start := (v_monday::timestamp AT TIME ZONE 'Asia/Tokyo');
  -- Sat 23:59:59 JST = Sun 00:00 exclusive
  week_end_exclusive := week_start + interval '6 days';
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION private.build_cohort_key(p_license text, p_exam_ym text, p_undecided boolean)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF coalesce(p_undecided, false) THEN
    RETURN upper(trim(p_license)) || '-UNDECIDED';
  END IF;
  IF p_exam_ym IS NULL OR trim(p_exam_ym) = '' THEN
    RAISE EXCEPTION 'exam month required when not undecided';
  END IF;
  RETURN upper(trim(p_license)) || '-' || trim(p_exam_ym);
END;
$$;

-- ---------------------------------------------------------------------------
-- 9. upsert_user_cohort
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.upsert_user_cohort(
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

REVOKE ALL ON FUNCTION public.upsert_user_cohort(text, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_user_cohort(text, text, boolean) TO authenticated;

-- ---------------------------------------------------------------------------
-- 10. get_cohort_anonymous_stats
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
    'min_population_top3', 10
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_cohort_anonymous_stats(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_cohort_anonymous_stats(text) TO authenticated;

-- ---------------------------------------------------------------------------
-- 11. compute_cohort_weekly_scores
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.compute_cohort_weekly_scores(p_iso_week text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bounds record;
  v_week_index int;
  v_metric text;
  v_rows int := 0;
BEGIN
  SELECT * INTO v_bounds FROM private.cohort_week_bounds_jst(p_iso_week);
  v_week_index := ((split_part(p_iso_week, '-W', 2)::int - 1) % 4) + 1;

  SELECT metric_type INTO v_metric FROM public.cohort_weekly_mission_templates
  WHERE week_index = v_week_index AND is_active LIMIT 1;

  IF v_metric IS NULL THEN
    RETURN 0;
  END IF;

  -- Sprint
  IF v_metric = 'sprint' THEN
    INSERT INTO public.cohort_weekly_scores (cohort_key, iso_week, user_id, metric_type, metric_value)
    SELECT ulp.cohort_key, p_iso_week, ulp.user_id, 'sprint',
      coalesce(sum(qs.questions_attempted), 0)::numeric + coalesce(sum(qs.total_time_spent), 0) / 60.0
    FROM public.user_learning_profiles ulp
    LEFT JOIN public.quiz_sessions qs ON qs.user_id = ulp.user_id
      AND qs.is_completed = true
      AND qs.completed_at >= v_bounds.week_start
      AND qs.completed_at < v_bounds.week_end_exclusive
    WHERE ulp.cohort_key IS NOT NULL AND ulp.cohort_phase = 'active'
    GROUP BY ulp.cohort_key, ulp.user_id
    ON CONFLICT (cohort_key, iso_week, user_id, metric_type)
    DO UPDATE SET metric_value = EXCLUDED.metric_value, computed_at = now();
  END IF;

  -- Precision
  IF v_metric = 'precision' THEN
    INSERT INTO public.cohort_weekly_scores (cohort_key, iso_week, user_id, metric_type, metric_value)
    SELECT ulp.cohort_key, p_iso_week, ulp.user_id, 'precision',
      CASE WHEN coalesce(sum(qs.questions_attempted), 0) >= 10
        THEN round(avg(qs.score_percentage)::numeric, 2) ELSE 0 END
    FROM public.user_learning_profiles ulp
    LEFT JOIN public.quiz_sessions qs ON qs.user_id = ulp.user_id
      AND qs.is_completed = true
      AND qs.completed_at >= v_bounds.week_start
      AND qs.completed_at < v_bounds.week_end_exclusive
    WHERE ulp.cohort_key IS NOT NULL AND ulp.cohort_phase = 'active'
    GROUP BY ulp.cohort_key, ulp.user_id
    HAVING coalesce(sum(qs.questions_attempted), 0) >= 10
    ON CONFLICT (cohort_key, iso_week, user_id, metric_type)
    DO UPDATE SET metric_value = EXCLUDED.metric_value, computed_at = now();
  END IF;

  -- Comeback (delta vs previous week precision)
  IF v_metric = 'comeback' THEN
    WITH prev_bounds AS (
      SELECT * FROM private.cohort_week_bounds_jst(
        to_char((v_bounds.week_start - interval '7 days') AT TIME ZONE 'Asia/Tokyo', 'IYYY-"W"IW')
      )
    ),
    curr AS (
      SELECT ulp.cohort_key, ulp.user_id,
        round(avg(qs.score_percentage)::numeric, 2) AS prec
      FROM public.user_learning_profiles ulp
      INNER JOIN public.quiz_sessions qs ON qs.user_id = ulp.user_id
        AND qs.is_completed = true
        AND qs.completed_at >= v_bounds.week_start
        AND qs.completed_at < v_bounds.week_end_exclusive
      WHERE ulp.cohort_key IS NOT NULL AND ulp.cohort_phase = 'active'
      GROUP BY ulp.cohort_key, ulp.user_id
      HAVING sum(qs.questions_attempted) >= 10
    ),
    prev AS (
      SELECT ulp.user_id, round(avg(qs.score_percentage)::numeric, 2) AS prec
      FROM public.user_learning_profiles ulp
      INNER JOIN public.quiz_sessions qs ON qs.user_id = ulp.user_id
        AND qs.is_completed = true
        AND qs.completed_at >= (SELECT week_start FROM prev_bounds)
        AND qs.completed_at < (SELECT week_end_exclusive FROM prev_bounds)
      WHERE ulp.cohort_phase = 'active'
      GROUP BY ulp.user_id
      HAVING sum(qs.questions_attempted) >= 10
    )
    INSERT INTO public.cohort_weekly_scores (cohort_key, iso_week, user_id, metric_type, metric_value)
    SELECT c.cohort_key, p_iso_week, c.user_id, 'comeback', greatest(c.prec - coalesce(p.prec, 0), 0)
    FROM curr c
    LEFT JOIN prev p ON p.user_id = c.user_id
    ON CONFLICT (cohort_key, iso_week, user_id, metric_type)
    DO UPDATE SET metric_value = EXCLUDED.metric_value, computed_at = now();
  END IF;

  -- Consistency (active days)
  IF v_metric = 'consistency' THEN
    INSERT INTO public.cohort_weekly_scores (cohort_key, iso_week, user_id, metric_type, metric_value)
    SELECT ulp.cohort_key, p_iso_week, ulp.user_id, 'consistency', coalesce(days.cnt, 0)
    FROM public.user_learning_profiles ulp
    LEFT JOIN LATERAL (
      SELECT count(DISTINCT d)::numeric AS cnt FROM (
        SELECT (qs.completed_at AT TIME ZONE 'Asia/Tokyo')::date AS d
        FROM public.quiz_sessions qs
        WHERE qs.user_id = ulp.user_id AND qs.is_completed = true
          AND qs.completed_at >= v_bounds.week_start
          AND qs.completed_at < v_bounds.week_end_exclusive
        UNION
        SELECT (lp.updated_at AT TIME ZONE 'Asia/Tokyo')::date AS d
        FROM public.learning_progress lp
        WHERE lp.user_id = ulp.user_id AND lp.completed = true
          AND lp.updated_at >= v_bounds.week_start
          AND lp.updated_at < v_bounds.week_end_exclusive
      ) u
    ) days ON true
    WHERE ulp.cohort_key IS NOT NULL AND ulp.cohort_phase = 'active'
    ON CONFLICT (cohort_key, iso_week, user_id, metric_type)
    DO UPDATE SET metric_value = EXCLUDED.metric_value, computed_at = now();
  END IF;

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows;
END;
$$;

REVOKE ALL ON FUNCTION public.compute_cohort_weekly_scores(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.compute_cohort_weekly_scores(text) TO service_role;

-- ---------------------------------------------------------------------------
-- 12. award_cohort_weekly_top3
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

    IF v_count < 10 THEN
      CONTINUE;
    END IF;

    FOR rec IN
      SELECT user_id, metric_value,
        rank() OVER (ORDER BY metric_value DESC) AS rk
      FROM public.cohort_weekly_scores
      WHERE cohort_key = v_cohort AND iso_week = p_iso_week
      ORDER BY metric_value DESC
      LIMIT 3
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
        jsonb_build_object('cohort_key', v_cohort, 'iso_week', p_iso_week, 'rank', rec.rk, 'metric_value', rec.metric_value)
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

-- ---------------------------------------------------------------------------
-- 13. mark_written_exam_complete
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.mark_written_exam_complete()
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

REVOKE ALL ON FUNCTION public.mark_written_exam_complete() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_written_exam_complete() TO authenticated;

-- ---------------------------------------------------------------------------
-- 14. get_public_user_badges
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_public_user_badges(p_user_id uuid)
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

REVOKE ALL ON FUNCTION public.get_public_user_badges(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_user_badges(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- 15. enqueue_cohort_notifications (service role / cron)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enqueue_cohort_notifications(
  p_template_key text,
  p_iso_week text DEFAULT NULL,
  p_dedupe_suffix text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int := 0;
  v_dedupe text;
  rec record;
BEGIN
  v_dedupe := p_template_key || coalesce('-' || p_iso_week, '') || coalesce('-' || p_dedupe_suffix, '');

  IF p_template_key = 'cohort_registration_reminder' THEN
    FOR rec IN
      SELECT ulp.user_id FROM public.user_learning_profiles ulp
      WHERE ulp.cohort_key IS NULL
      UNION
      SELECT p.id FROM public.profiles p
      WHERE NOT EXISTS (SELECT 1 FROM public.user_learning_profiles ulp2 WHERE ulp2.user_id = p.id)
    LOOP
      IF EXISTS (
        SELECT 1 FROM public.notification_deliveries nd
        WHERE nd.user_id = rec.user_id AND nd.channel = 'in_app' AND nd.dedupe_key = v_dedupe
      ) THEN
        CONTINUE;
      END IF;

      INSERT INTO public.in_app_notifications (user_id, title, body, link_url, template_key)
      VALUES (
        rec.user_id,
        '学科試験の受験予定を登録',
        '試験月または受験日未定を登録すると、同じ試験月の仲間と週次ミッションに参加できます。',
        '/welcome?mode=cohort',
        p_template_key
      );

      INSERT INTO public.notification_deliveries (user_id, channel, template_key, dedupe_key)
      VALUES (rec.user_id, 'in_app', p_template_key, v_dedupe)
      ON CONFLICT DO NOTHING;

      v_count := v_count + 1;
    END LOOP;
  ELSIF p_template_key = 'weekly_mission_start' THEN
    FOR rec IN
      SELECT ulp.user_id FROM public.user_learning_profiles ulp
      WHERE ulp.cohort_key IS NOT NULL AND ulp.cohort_phase = 'active'
    LOOP
      IF EXISTS (
        SELECT 1 FROM public.notification_deliveries nd
        WHERE nd.user_id = rec.user_id AND nd.channel = 'in_app' AND nd.dedupe_key = v_dedupe
      ) THEN
        CONTINUE;
      END IF;

      INSERT INTO public.in_app_notifications (user_id, title, body, link_url, template_key)
      VALUES (
        rec.user_id,
        '今週の週次ミッション',
        '新しい週次ミッションが始まりました。Dashboard で確認しましょう。',
        '/dashboard',
        p_template_key
      );

      INSERT INTO public.notification_deliveries (user_id, channel, template_key, dedupe_key)
      VALUES (rec.user_id, 'in_app', p_template_key, v_dedupe)
      ON CONFLICT DO NOTHING;

      v_count := v_count + 1;
    END LOOP;
  ELSIF p_template_key = 'post_written_cta' THEN
    FOR rec IN
      SELECT ulp.user_id FROM public.user_learning_profiles ulp
      WHERE ulp.cohort_phase = 'active'
        AND ulp.exam_date_status = 'set'
        AND ulp.target_test_date IS NOT NULL
        AND ulp.target_test_date <= ((now() AT TIME ZONE 'Asia/Tokyo')::date + interval '1 month')
        AND ulp.target_test_date >= (now() AT TIME ZONE 'Asia/Tokyo')::date
    LOOP
      IF EXISTS (
        SELECT 1 FROM public.notification_deliveries nd
        WHERE nd.user_id = rec.user_id AND nd.channel = 'in_app' AND nd.dedupe_key = v_dedupe
      ) THEN
        CONTINUE;
      END IF;

      INSERT INTO public.in_app_notifications (user_id, title, body, link_url, template_key)
      VALUES (
        rec.user_id,
        '学科試験完了の記録',
        '学科試験が終わったら「学科試験完了」を押して学科試験後フェーズへ進みましょう。',
        '/profile?tab=cohort',
        p_template_key
      );

      INSERT INTO public.notification_deliveries (user_id, channel, template_key, dedupe_key)
      VALUES (rec.user_id, 'in_app', p_template_key, v_dedupe)
      ON CONFLICT DO NOTHING;

      v_count := v_count + 1;
    END LOOP;
  END IF;

  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.enqueue_cohort_notifications(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enqueue_cohort_notifications(text, text, text) TO service_role;

-- ---------------------------------------------------------------------------
-- 16. get_user_cohort_profile (client helper)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_cohort_profile()
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

REVOKE ALL ON FUNCTION public.get_user_cohort_profile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_cohort_profile() TO authenticated;

-- Extend public leaderboard with user_id for opt-in badge viewing (Phase 6)
CREATE OR REPLACE FUNCTION private.get_public_leaderboard_impl(p_limit integer)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  xp_points integer,
  rank user_rank_type,
  leaderboard_position bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sub.user_id,
         sub.display_name,
         sub.xp_points::integer,
         sub.rank,
         sub.pos
  FROM (
    SELECT
      p.id AS user_id,
      COALESCE(
        NULLIF(trim(p.leaderboard_display_name), ''),
        NULLIF(trim(p.username), ''),
        'Learner'
      ) AS display_name,
      coalesce(p.xp_points, 0) AS xp_points,
      p.rank,
      row_number() OVER (ORDER BY coalesce(p.xp_points, 0) DESC, p.id) AS pos
    FROM public.profiles p
    WHERE p.leaderboard_opt_in = true
  ) sub
  WHERE sub.pos <= least(coalesce(p_limit, 30), 50)
  ORDER BY sub.pos;
$$;

CREATE OR REPLACE FUNCTION public.get_public_leaderboard(p_limit integer DEFAULT 30)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  xp_points integer,
  rank user_rank_type,
  leaderboard_position bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT * FROM private.get_public_leaderboard_impl(p_limit);
$$;

REVOKE ALL ON FUNCTION public.get_public_leaderboard(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_leaderboard(integer) TO authenticated;
