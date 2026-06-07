-- question_issue_reports: user-reported quiz question issues
-- Apply via Supabase MCP or Dashboard SQL editor

CREATE TABLE IF NOT EXISTS public.question_issue_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.unified_cpl_questions(id) ON DELETE CASCADE,
  report_type text NOT NULL CHECK (
    report_type IN (
      'wrong_answer',
      'wrong_explanation',
      'typo',
      'outdated',
      'unclear',
      'other'
    )
  ),
  comment text CHECK (char_length(comment) <= 1000),
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'open' CHECK (
    status IN ('open', 'triaged', 'resolved', 'dismissed')
  ),
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_question_issue_reports_open_unique
  ON public.question_issue_reports (user_id, question_id)
  WHERE status = 'open';

CREATE INDEX IF NOT EXISTS idx_question_issue_reports_question_id
  ON public.question_issue_reports (question_id);

CREATE INDEX IF NOT EXISTS idx_question_issue_reports_status_created
  ON public.question_issue_reports (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_question_issue_reports_user_id
  ON public.question_issue_reports (user_id);

CREATE OR REPLACE VIEW public.v_question_report_summary AS
SELECT
  question_id,
  count(*) FILTER (WHERE status = 'open') AS open_count,
  count(*) AS total_count,
  max(created_at) AS last_reported_at
FROM public.question_issue_reports
GROUP BY question_id;

COMMENT ON VIEW public.v_question_report_summary IS
  'Aggregated open/total report counts per question for admin triage';

CREATE OR REPLACE FUNCTION public.set_question_issue_reports_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_question_issue_reports_updated_at ON public.question_issue_reports;
CREATE TRIGGER trg_question_issue_reports_updated_at
  BEFORE UPDATE ON public.question_issue_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.set_question_issue_reports_updated_at();

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

DROP TRIGGER IF EXISTS trg_question_issue_report_needs_review ON public.question_issue_reports;
CREATE TRIGGER trg_question_issue_report_needs_review
  AFTER INSERT ON public.question_issue_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.mark_question_needs_review_on_report();

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND lower(coalesce(roll, '')) = 'admin'
  );
$$;

ALTER TABLE public.question_issue_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS question_issue_reports_insert_own ON public.question_issue_reports;
CREATE POLICY question_issue_reports_insert_own
  ON public.question_issue_reports
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS question_issue_reports_select_own ON public.question_issue_reports;
CREATE POLICY question_issue_reports_select_own
  ON public.question_issue_reports
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS question_issue_reports_admin_select ON public.question_issue_reports;
CREATE POLICY question_issue_reports_admin_select
  ON public.question_issue_reports
  FOR SELECT
  TO authenticated
  USING (public.is_admin_user());

DROP POLICY IF EXISTS question_issue_reports_admin_update ON public.question_issue_reports;
CREATE POLICY question_issue_reports_admin_update
  ON public.question_issue_reports
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

GRANT SELECT, INSERT ON public.question_issue_reports TO authenticated;
GRANT UPDATE ON public.question_issue_reports TO authenticated;
GRANT SELECT ON public.v_question_report_summary TO authenticated;
