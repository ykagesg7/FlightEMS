-- W26 2026-06-30: Tier B マッピング精緻化 — 航空工学「航法計器/無線航法計器」→ `3.4.2_VORNavigation`
-- docs/Article_Coverage_Backlog.md §7 Tier B（3.4.x 航法）
-- 冪等: ON CONFLICT (learning_content_id, topic_category) DO UPDATE

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
     AND q.sub_subject = '航法計器/無線航法計器'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '航法計器/無線航法計器'),
  '航空工学/航法計器_無線航法',
  '航法計器',
  'w26_20260630_nav_radio_instruments',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.4.2_VORNavigation'
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空工学'
      AND q.sub_subject = '航法計器/無線航法計器'
    LIMIT 1
  )
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();
