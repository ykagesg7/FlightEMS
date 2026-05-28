-- W23 2026: 航空法規クラスタ「総則/目的」→ `3.1.1_AviationLegal0` への learning_test_mapping 追補案。
-- 参照: docs/Article_Coverage_Backlog.md §6（2026-05-06 スナップショットで上位の未マッピング例）。
-- 冪等: ON CONFLICT (learning_content_id, topic_category) DO UPDATE。
-- 適用: Supabase MCP execute_sql または Dashboard（本番は docs/04_Operations_Guide.md に沿う）。

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
     AND q.main_subject = '航空法規'
     AND q.sub_subject = '総則/目的'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空法規'
     AND q.sub_subject = '総則/目的'),
  '航空法規/unmapped_総則目的',
  '総則/目的',
  'w23_20260512_legal_sokusoku_mokuteki',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.1.1_AviationLegal0'
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空法規'
      AND q.sub_subject = '総則/目的'
    LIMIT 1
  )
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();
