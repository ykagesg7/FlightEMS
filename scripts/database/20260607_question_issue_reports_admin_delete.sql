-- Allow admins to delete closed question issue reports (resolved / dismissed)

DROP POLICY IF EXISTS question_issue_reports_admin_delete ON public.question_issue_reports;
CREATE POLICY question_issue_reports_admin_delete
  ON public.question_issue_reports
  FOR DELETE
  TO authenticated
  USING (
    public.is_admin_user()
    AND status IN ('resolved', 'dismissed')
  );

GRANT DELETE ON public.question_issue_reports TO authenticated;
