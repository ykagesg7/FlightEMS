-- PPL Subject 3 Phase 1 第9本 mapping — 空間識失調 22問（11+11）
-- Clusters: 空間識／空間識失調/空間識失調の分類, 空間識／空間識失調/飛行への適合性
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
  'ppl332_20260709_spatial_disorientation',
  'verified'
FROM learning_contents lc
JOIN (VALUES
  ('PPL-3-3-2_SpatialDisorientationBasics', '空間識／空間識失調/空間識失調の分類', '空中航法/空間識失調の分類'),
  ('PPL-3-3-2_SpatialDisorientationBasics', '空間識／空間識失調/飛行への適合性', '空中航法/空間識失調・適合性')
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
