-- Supabase Security Advisor (linter 0028 / 0029): cohort RPC EXECUTE hardening
-- REVOKE FROM PUBLIC alone leaves anon/authenticated EXECUTE on hosted Supabase.
-- Cron-only RPCs: service_role only. User RPCs: authenticated only (no anon).

-- Cron / server-only (service_role)
REVOKE ALL ON FUNCTION public.compute_cohort_weekly_scores(text) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.compute_cohort_weekly_scores(text) TO service_role;

REVOKE ALL ON FUNCTION public.award_cohort_weekly_top3(text) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.award_cohort_weekly_top3(text) TO service_role;

REVOKE ALL ON FUNCTION public.enqueue_cohort_notifications(text, text, text) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.enqueue_cohort_notifications(text, text, text) TO service_role;

-- Authenticated user RPCs (no anonymous execute)
REVOKE ALL ON FUNCTION public.upsert_user_cohort(text, text, boolean) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_user_cohort(text, text, boolean) TO authenticated;

REVOKE ALL ON FUNCTION public.get_cohort_anonymous_stats(text) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_cohort_anonymous_stats(text) TO authenticated;

REVOKE ALL ON FUNCTION public.get_user_cohort_profile() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_cohort_profile() TO authenticated;

REVOKE ALL ON FUNCTION public.mark_written_exam_complete() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_written_exam_complete() TO authenticated;

REVOKE ALL ON FUNCTION public.get_public_user_badges(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_user_badges(uuid) TO authenticated;

-- notification_deliveries: service/cron writes only; allow users to read own rows (RLS lint 0008)
DROP POLICY IF EXISTS notification_deliveries_select_own ON public.notification_deliveries;
CREATE POLICY notification_deliveries_select_own ON public.notification_deliveries
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Performance Advisor: unindexed FK on cohort_weekly_scores.user_id
CREATE INDEX IF NOT EXISTS idx_cohort_weekly_scores_user_id
  ON public.cohort_weekly_scores (user_id);
