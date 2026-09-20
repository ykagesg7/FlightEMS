-- Quiz → Review consistency: failed SRS cards are due immediately,
-- and registration XP uses the INVOKER-wrapper + DEFINER-impl pattern.
-- Not a schema break; no user rows are deleted.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Failed cards are due now (lapses), not tomorrow.
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
      -- Lapses are due immediately so Review can load the same session.
      v_next := now();
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

-- Existing lapses scheduled for tomorrow by the previous function.
UPDATE public.user_unified_srs_status
SET next_review_date = now()
WHERE repetitions = 0
  AND next_review_date IS NOT NULL
  AND next_review_date > now();

-- ---------------------------------------------------------------------------
-- 2. Registration XP: INVOKER wrapper + DEFINER impl (fixes PostgREST 403
--    when the public function is INVOKER but calls private.apply_xp_reward).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.award_registration_xp_impl()
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

REVOKE ALL ON FUNCTION private.award_registration_xp_impl()
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.award_registration_xp_impl() TO authenticated;

CREATE OR REPLACE FUNCTION public.award_registration_xp()
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT private.award_registration_xp_impl();
$$;

REVOKE ALL ON FUNCTION public.award_registration_xp()
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.award_registration_xp() TO authenticated;

COMMIT;
