-- PPL Subject 4 Phase 1 第2本 mapping — 捜索救難 28問（22+6）
-- Clusters: 捜索救難業務/捜索救難業務, 捜索救難業務/捜索救難信号
-- 緊急機の行動(20) は 4-3-2 側に残す（本記事は参照のみ）
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
     AND q.main_subject = '航空通信'
     AND q.sub_subject = v.sub_subject),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空通信'
     AND q.sub_subject = v.sub_subject),
  v.topic_category,
  '航空通信',
  'ppl412_20260716_search_and_rescue',
  'verified'
FROM learning_contents lc
JOIN (VALUES
  ('PPL-4-1-2_SearchAndRescueBasics', '捜索救難業務/捜索救難業務', '航空通信/捜索救難業務'),
  ('PPL-4-1-2_SearchAndRescueBasics', '捜索救難業務/捜索救難信号', '航空通信/捜索救難信号')
) AS v(learning_content_id, sub_subject, topic_category) ON v.learning_content_id = lc.id
WHERE EXISTS (
  SELECT 1 FROM unified_cpl_questions q
  WHERE q.verification_status = 'verified'
    AND q.applicable_exams @> ARRAY['PPL']::text[]
    AND q.main_subject = '航空通信'
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
