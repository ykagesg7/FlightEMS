-- Replace quartile-based mapping for 3.1.2_AviationLegal1 with a single (main_subject, sub_subject) cluster.
-- Target cluster (verified counts as of 2026-03): 航空法規 / 航空機の運航/特定操縦技能の審査等
-- Idempotent: UPDATE by learning_content_id; safe to re-run.
--
-- Related MDX: src/content/lessons/3.1.2_AviationLegal1.mdx
-- Docs: docs/08_Syllabus_Management_Guide.md (problem-article contract)

BEGIN;

WITH agg AS (
  SELECT
    COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[]) AS uuids,
    COALESCE(array_agg(q.id::text ORDER BY q.id), ARRAY[]::text[]) AS ids_text
  FROM unified_cpl_questions q
  WHERE q.verification_status = 'verified'
    AND q.main_subject = '航空法規'
    AND q.sub_subject = '航空機の運航/特定操縦技能の審査等'
)
UPDATE learning_test_mapping m
SET
  unified_cpl_question_ids = agg.uuids,
  test_question_ids = agg.ids_text,
  mapping_source = 'cluster_20260331_aviation_legal_skill_review',
  updated_at = now()
FROM agg
WHERE m.learning_content_id = '3.1.2_AviationLegal1';

COMMIT;
