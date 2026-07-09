-- W29 2026-07-10: Tier B — 航空工学「電波の伝播/電波の伝播」→ `engineering_basics`
-- Article_Coverage_Backlog §6 上位クラスタ（verified 3 問）
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
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '電波の伝播/電波の伝播'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '電波の伝播/電波の伝播'),
  '航空工学/電波の伝播',
  '電波の伝播',
  'w29_20260710_radio_propagation',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'engineering_basics'
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空工学'
      AND q.sub_subject = '電波の伝播/電波の伝播'
    LIMIT 1
  )
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();
