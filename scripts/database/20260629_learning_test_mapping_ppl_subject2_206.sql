-- PPL-2-1-6: learning_test_mapping — 雲と霧/雲の観測 + 雲の形成 (verified + PPL)
-- Apply: Supabase MCP execute_sql or npx supabase db query --linked -f

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
     AND q.sub_subject IN ('雲と霧/雲の観測', '雲と霧/雲の形成')),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空気象'
     AND q.sub_subject IN ('雲と霧/雲の観測', '雲と霧/雲の形成')),
  '航空気象',
  '航空気象',
  'ppl_subject2_20260629_cloud_types',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-2-1-6_CloudTypesAndFormation'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.applicable_exams @> ARRAY['PPL']::text[]
      AND q.main_subject = '航空気象'
      AND q.sub_subject IN ('雲と霧/雲の観測', '雲と霧/雲の形成')
    LIMIT 1
  );
