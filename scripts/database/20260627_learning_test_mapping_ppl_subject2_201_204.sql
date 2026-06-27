-- PPL Master Subject 2 Phase 1 (201–204): learning_test_mapping
-- Clusters: 大気の基礎/{大気,温度,気圧,水分} — verified + applicable_exams @> {PPL}
-- Apply: Supabase MCP execute_sql (project_id = fstynltdfdetpyvbrswr) or SQL Editor
-- Idempotent: ON CONFLICT (learning_content_id, topic_category) DO UPDATE

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
     AND q.main_subject = '航空気象'
     AND q.sub_subject = v.sub_subject),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空気象'
     AND q.sub_subject = v.sub_subject),
  '航空気象',
  '航空気象',
  'ppl_subject2_20260627',
  'verified'
FROM learning_contents lc
JOIN (VALUES
  ('PPL-2-1-1_AtmosphereAndIsaBasics', '大気の基礎/大気'),
  ('PPL-2-1-2_TemperatureLapseAndInversion', '大気の基礎/温度'),
  ('PPL-2-1-3_PressureAltimeterSettings', '大気の基礎/気圧'),
  ('PPL-2-1-4_MoistureHumidityDewpoint', '大気の基礎/水分')
) AS v(learning_content_id, sub_subject) ON v.learning_content_id = lc.id
WHERE EXISTS (
  SELECT 1 FROM unified_cpl_questions q
  WHERE q.verification_status = 'verified'
    AND q.applicable_exams @> ARRAY['PPL']::text[]
    AND q.main_subject = '航空気象'
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
