-- Security Advisor fixes (FlightAcademy Supabase)
-- 1. v_question_report_summary: security_invoker (Postgres 15+)
-- 2. Trigger/helper functions: fixed search_path, revoke public RPC execute
-- 3. is_admin_user: SECURITY INVOKER (RLS-only helper, not public RPC)

DROP VIEW IF EXISTS public.v_question_report_summary;

CREATE VIEW public.v_question_report_summary
WITH (security_invoker = true)
AS
SELECT
  question_id,
  count(*) FILTER (WHERE status = 'open') AS open_count,
  count(*) AS total_count,
  max(created_at) AS last_reported_at
FROM public.question_issue_reports
GROUP BY question_id;

COMMENT ON VIEW public.v_question_report_summary IS
  'Aggregated open/total report counts per question for admin triage (security_invoker)';

GRANT SELECT ON public.v_question_report_summary TO authenticated;

CREATE OR REPLACE FUNCTION public.set_question_issue_reports_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.set_question_issue_reports_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_question_issue_reports_updated_at() FROM anon;
REVOKE ALL ON FUNCTION public.set_question_issue_reports_updated_at() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.set_question_issue_reports_updated_at() TO postgres;

CREATE OR REPLACE FUNCTION public.mark_question_needs_review_on_report()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'open' THEN
    UPDATE public.unified_cpl_questions
    SET verification_status = 'needs_review',
        updated_at = now()
    WHERE id = NEW.question_id
      AND verification_status = 'verified';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_question_needs_review_on_report() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.mark_question_needs_review_on_report() FROM anon;
REVOKE ALL ON FUNCTION public.mark_question_needs_review_on_report() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.mark_question_needs_review_on_report() TO postgres;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND lower(coalesce(roll, '')) = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin_user() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO postgres;
