# Question Issue Reports (Quiz Quality Pipeline)

## DB
- Table: `public.question_issue_reports` (migration: `scripts/database/20260607_question_issue_reports.sql`)
- Applied on Supabase project `fstynltdfdetpyvbrswr` (migration name: `question_issue_reports`)
- Admin delete policy: `scripts/database/20260607_question_issue_reports_admin_delete.sql` — DELETE allowed for admins when `status IN ('resolved', 'dismissed')`
- Unique open report per user+question: partial index `idx_question_issue_reports_open_unique`
- Trigger: open reports mark `unified_cpl_questions.verification_status = 'needs_review'` when previously `verified`
- RLS: users INSERT/SELECT own; admins SELECT/UPDATE/DELETE (closed only) via `is_admin_user()`

## User reporting flow
- UI: `QuestionReportTrigger` → `QuestionReportDialog` (portal to `document.body` to avoid nested `<form>` in `QuestionComponent`)
- Hook: `src/pages/test/hooks/useQuestionReport.ts` — merges `page_url` into `context` via `mergeReportContextWithLocation()`
- Types/labels: `src/pages/test/utils/questionReportTypes.ts`
- Links: `src/pages/test/utils/questionReportLinks.ts` — `buildAdminQuestionPreviewUrl`, `getAdminReportSourcePageUrl`
- Placed in `QuestionComponent` (quiz_active) and `QuizResultsView` (quiz_results)
- GA4: `quiz_question_report` in `src/lib/quizAnalytics.ts`
- Text fields use `.quiz-text-field` CSS class (`src/index.css`)

## Admin triage
- Page: `/admin/question-reports` — `src/pages/admin/QuestionReportsPage.tsx`
- Preview link: `/test?previewQuestion={uuid}&mode=practice` — wired in `TestPage.tsx` via `fetchQuestionPreviewById()`
- Delete button shown only when `canDeleteQuestionReport(status)` (resolved/dismissed)
- Default status filter: `all`

## Audit SQL
- `scripts/database/20260607_audit_unified_cpl_questions.sql` for batch verification review

## Commit
- Landed on `main` as `865c6d9` (2026-06-07): feat: add quiz question reports and admin management hub
