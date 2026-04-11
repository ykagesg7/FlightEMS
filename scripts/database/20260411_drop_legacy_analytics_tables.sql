-- Phase 1: Remove empty legacy analytics / recommendation tables (DB slimming).
-- Prerequisites (verified via Supabase MCP 2026-04-11):
-- - No FK references *to* these tables from other public tables.
-- - Views v_mapped_questions, learning_content_stats, fan_photo_like_counts do not reference them.
-- - log_user_creation() inserts into audit_log; drop function before dropping audit_log.
-- Apply: Supabase MCP apply_migration or SQL Editor. Idempotent via IF EXISTS.

-- Audit log writer (would fail if audit_log is dropped while trigger still attached; no trigger found on auth.users in MCP check)
DROP FUNCTION IF EXISTS public.log_user_creation() CASCADE;

DROP TABLE IF EXISTS public.adaptive_learning_paths CASCADE;
DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.content_effectiveness CASCADE;
DROP TABLE IF EXISTS public.content_recommendations CASCADE;
DROP TABLE IF EXISTS public.exam_trend_analysis CASCADE;
DROP TABLE IF EXISTS public.learning_effectiveness_metrics CASCADE;
DROP TABLE IF EXISTS public.learning_recommendations CASCADE;
