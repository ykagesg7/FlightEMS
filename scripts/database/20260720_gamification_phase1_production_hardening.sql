-- Production follow-up for the Phase 1 gamification foundation.
-- Keep exposed RPCs as SECURITY INVOKER and seed the weekly rotation.

BEGIN;

-- The learner-facing progression model is get_learning_journey(), not the
-- legacy XP-based profiles.rank trigger. Keep the enum/column for compatibility.
DROP TRIGGER IF EXISTS trigger_check_rank_up ON public.profiles;
DROP TRIGGER IF EXISTS trigger_check_ppl_ranks_on_progress
  ON public.learning_progress;
DROP TRIGGER IF EXISTS trigger_update_profile_rank_on_ppl_rank_insert
  ON public.user_ppl_ranks;

INSERT INTO public.cohort_weekly_mission_templates (
  week_index,
  metric_type,
  title,
  description,
  min_questions,
  xp_bonus,
  completion_threshold,
  completion_xp,
  mvp_xp,
  top3_xp,
  is_active
)
VALUES
  (1, 'sprint', 'Sprint — 今週の努力量', '5問以上に取り組む', 5, 20, 5, 20, 30, 20, true),
  (2, 'precision', 'Precision — 正答率', '10問以上、正答率70%以上', 10, 20, 70, 20, 30, 20, true),
  (3, 'comeback', 'Comeback — 伸び率', '10問以上、前週比1ポイント以上改善', 10, 20, 1, 20, 30, 20, true),
  (4, 'consistency', 'Consistency — 継続', '週3日以上学習', 0, 20, 3, 20, 30, 20, true)
ON CONFLICT (week_index, metric_type) DO UPDATE
SET
  title = excluded.title,
  description = excluded.description,
  min_questions = excluded.min_questions,
  completion_threshold = excluded.completion_threshold,
  completion_xp = excluded.completion_xp,
  mvp_xp = excluded.mvp_xp,
  top3_xp = excluded.top3_xp,
  is_active = true;

ALTER FUNCTION public.award_registration_xp() SECURITY INVOKER;
ALTER FUNCTION public.award_quiz_session_xp(uuid) SECURITY INVOKER;
ALTER FUNCTION public.award_article_read_xp(text) SECURITY INVOKER;
ALTER FUNCTION public.award_article_comprehension_xp(text, uuid) SECURITY INVOKER;
ALTER FUNCTION public.award_cohort_weekly_top3(text) SECURITY INVOKER;
ALTER FUNCTION public.get_learning_journey() SECURITY INVOKER;

-- Mission completion must write protected history. Move its privileged body
-- outside the exposed schema and leave an invoker wrapper in public.
ALTER FUNCTION public.complete_mission(uuid) SET SCHEMA private;
ALTER FUNCTION private.complete_mission(uuid) RENAME TO complete_mission_impl;

REVOKE ALL ON FUNCTION private.complete_mission_impl(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.complete_mission_impl(uuid) TO authenticated;

CREATE FUNCTION public.complete_mission(p_mission_id uuid)
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT private.complete_mission_impl(p_mission_id);
$$;

REVOKE ALL ON FUNCTION public.award_registration_xp()
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.award_quiz_session_xp(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.award_article_read_xp(text)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.award_article_comprehension_xp(text, uuid)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.complete_mission(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.get_learning_journey()
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.award_cohort_weekly_top3(text)
  FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.award_registration_xp() TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_quiz_session_xp(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_article_read_xp(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_article_comprehension_xp(text, uuid)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_mission(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_learning_journey() TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_cohort_weekly_top3(text) TO service_role;

COMMIT;
