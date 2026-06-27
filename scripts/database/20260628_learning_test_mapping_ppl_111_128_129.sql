-- PPL Master Subject 1: remaining learning_test_mapping (3 articles)
-- PPL-1-1-11: 空力の基礎理論/操縦性 (verified + PPL)
-- PPL-1-2-8: 燃料供給系統/燃料供給系統 (verified CPL pool — vapor lock)
-- PPL-1-2-9: 航空計器一般/計器表示及び注意警報装置 (verified CPL pool)
-- Apply: MCP execute_sql or npx supabase db query --linked -f
-- Idempotent: NOT EXISTS per learning_content_id

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
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '空力の基礎理論/操縦性'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '空力の基礎理論/操縦性'),
  '航空工学',
  '航空工学',
  'ppl_engineering_20260628_control_surfaces',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-1-1-11_ControlSurfaces'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.applicable_exams @> ARRAY['PPL']::text[]
      AND q.main_subject = '航空工学'
      AND q.sub_subject = '空力の基礎理論/操縦性'
    LIMIT 1
  );

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
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '燃料供給系統/燃料供給系統'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '燃料供給系統/燃料供給系統'),
  '航空工学',
  '航空工学',
  'ppl_engineering_20260628_fuel_system_cpl_pool',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-1-2-8_FuelSystemVaporLock'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空工学'
      AND q.sub_subject = '燃料供給系統/燃料供給系統'
    LIMIT 1
  );

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
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '航空計器一般/計器表示及び注意警報装置'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '航空計器一般/計器表示及び注意警報装置'),
  '航空工学',
  '航空工学',
  'ppl_engineering_20260628_instrument_scan_cpl_pool',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-1-2-9_TScanInstrumentScan'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空工学'
      AND q.sub_subject = '航空計器一般/計器表示及び注意警報装置'
    LIMIT 1
  );
