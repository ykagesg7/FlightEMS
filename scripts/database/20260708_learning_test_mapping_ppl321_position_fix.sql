-- PPL Subject 3 Phase 2 第1本: learning_test_mapping（機位の確認2問）
-- Cluster: 航法の実施/機位の確認
-- Apply: Supabase MCP execute_sql (project_id = fstynltdfdetpyvbrswr)

INSERT INTO learning_test_mapping (
  learning_content_id,
  content_title,
  content_category,
  test_question_ids,
  unified_cpl_question_ids,
  topic_category,
  subject_area,
  mapping_source,
  verification_status
)
SELECT
  lc.id,
  lc.title,
  lc.category,
  (SELECT COALESCE(array_agg(q.id::text ORDER BY q.id), ARRAY[]::text[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '空中航法'
     AND q.sub_subject = v.sub_subject),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '空中航法'
     AND q.sub_subject = v.sub_subject),
  v.topic_category,
  '空中航法',
  'ppl321_20260708_position_fix',
  'verified'
FROM learning_contents lc
JOIN (VALUES
  ('PPL-3-2-1_PilotageAndPositionFix', '航法の実施/機位の確認', '空中航法/機位の確認')
) AS v(learning_content_id, sub_subject, topic_category) ON v.learning_content_id = lc.id
WHERE EXISTS (
  SELECT 1 FROM unified_cpl_questions q
  WHERE q.verification_status = 'verified'
    AND q.applicable_exams @> ARRAY['PPL']::text[]
    AND q.main_subject = '空中航法'
    AND q.sub_subject = v.sub_subject
  LIMIT 1
)
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  topic_category = EXCLUDED.topic_category,
  subject_area = EXCLUDED.subject_area,
  mapping_source = EXCLUDED.mapping_source,
  verification_status = EXCLUDED.verification_status,
  updated_at = NOW();
