-- Phase 2: Legacy CPL staging tables and unused user_progress; obsolete migration helpers.
-- Prerequisites (MCP 2026-04-11):
-- - unified_cpl_questions is the live question store; cpl_exam_questions has 0 rows and no app references.
-- - user_progress has 0 rows and no src references.
-- - quiz_questions / exam_questions_metadata do not exist; migrate_* helpers are dead.
-- - analyze_content_gaps() referenced missing exam_questions_metadata (broken).
-- Order: DROP TABLE CASCADE removes triggers; then drop standalone trigger functions.

DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_progress_upsert() CASCADE;

DROP TABLE IF EXISTS public.cpl_exam_questions CASCADE;
DROP TABLE IF EXISTS public.cpl_subject_master CASCADE;

DROP FUNCTION IF EXISTS public.analyze_content_gaps() CASCADE;
DROP FUNCTION IF EXISTS public.migrate_quiz_questions() CASCADE;
DROP FUNCTION IF EXISTS public.migrate_exam_questions_metadata() CASCADE;
