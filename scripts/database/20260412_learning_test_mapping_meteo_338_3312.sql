-- learning_test_mapping: 気象スタブ 3.3.8 / 3.3.12（20260410 スタブ SQL の ILIKE が DB の sub_subject と不一致でスキップされていた件の是正）
--
-- 背景:
--   - 3.3.8: ICAO/国際標準大気 という sub_subject は verified に存在しない（0 件）。
--     → `高層気象/高層大気の構造と特徴`（2 問）を紐付け（ハブ CPL-Hub-Meteorology と重複可）。
--   - 3.3.12: スタブ SQL は sub_subject ILIKE '%乱流%' だが、実データは「乱気流」（例: 飛行に影響する気象障害/乱気流）。
--     → `飛行に影響する気象障害/乱気流` + `高層気象/ジェット気流` を紐付け。
--
-- 冪等: NOT EXISTS (learning_content_id)。
-- 適用: Supabase SQL Editor または Supabase MCP `execute_sql`。

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
     AND q.main_subject = '航空気象'
     AND q.sub_subject = '高層気象/高層大気の構造と特徴'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空気象'
     AND q.sub_subject = '高層気象/高層大気の構造と特徴'),
  '航空気象',
  '航空気象',
  'fix_20260412_icao_stub_predicate',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.3.8_ICAOStandardAtmosphere'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空気象'
      AND q.sub_subject = '高層気象/高層大気の構造と特徴'
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
     AND q.main_subject = '航空気象'
     AND q.sub_subject IN ('飛行に影響する気象障害/乱気流', '高層気象/ジェット気流')),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空気象'
     AND q.sub_subject IN ('飛行に影響する気象障害/乱気流', '高層気象/ジェット気流')),
  '航空気象',
  '航空気象',
  'fix_20260412_turbulence_stub_predicate',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.3.12_Turbulence'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空気象'
      AND q.sub_subject IN ('飛行に影響する気象障害/乱気流', '高層気象/ジェット気流')
    LIMIT 1
  );
