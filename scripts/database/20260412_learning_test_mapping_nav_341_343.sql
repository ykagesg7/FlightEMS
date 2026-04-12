-- learning_test_mapping: 空中航法 3.4.1 / 3.4.2 / 3.4.3（MDX のみで行が無かった件の補完）
-- 冪等: NOT EXISTS (learning_content_id)。sub_subject は DB 実データの長い日本語ラベルに合わせて複数 OR。
-- mapping_source: phase_b_20260412_nav341_343

-- 3.4.1 推測航法・風・偏流（「航法」単独 63 件は広すぎるため、キーワードで絞る）
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
     AND q.main_subject = '空中航法'
     AND (
       q.sub_subject ILIKE '%推測%'
       OR q.sub_subject ILIKE '%偏流%'
       OR q.sub_subject ILIKE '%風修正%'
       OR q.sub_subject ILIKE '%針路%'
       OR q.sub_subject ILIKE '%所要時間%計算%'
     )),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '空中航法'
     AND (
       q.sub_subject ILIKE '%推測%'
       OR q.sub_subject ILIKE '%偏流%'
       OR q.sub_subject ILIKE '%風修正%'
       OR q.sub_subject ILIKE '%針路%'
       OR q.sub_subject ILIKE '%所要時間%計算%'
     )),
  '空中航法',
  '空中航法',
  'phase_b_20260412_nav341_343',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.4.1_DeadReckoning'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '空中航法'
      AND (
        q.sub_subject ILIKE '%推測%'
        OR q.sub_subject ILIKE '%偏流%'
        OR q.sub_subject ILIKE '%風修正%'
        OR q.sub_subject ILIKE '%針路%'
        OR q.sub_subject ILIKE '%所要時間%計算%'
      )
    LIMIT 1
  );

-- 3.4.2 VOR（および関連：DME / TACAN / RMI）
-- 備考: verified データでは sub_subject に「VOR」等が無く、
--  「航法の実施/航空保安無線施設等に関する知識」が VOR・DME・磁針・GPS を混在。
--  本リポ MCP 集計（2026-04-13）に基づき question_text で抽出（VOR/DME/TACAN/RMI）。
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
     AND q.main_subject = '空中航法'
     AND (
       q.question_text ILIKE '%VOR%'
       OR q.question_text ILIKE '%DME%'
       OR q.question_text ILIKE '%TACAN%'
       OR q.question_text ILIKE '%RMI%'
     )),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '空中航法'
     AND (
       q.question_text ILIKE '%VOR%'
       OR q.question_text ILIKE '%DME%'
       OR q.question_text ILIKE '%TACAN%'
       OR q.question_text ILIKE '%RMI%'
     )),
  '空中航法',
  '空中航法',
  'phase_b_20260413_nav342_343_qtext',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.4.2_VORNavigation'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '空中航法'
      AND (
        q.question_text ILIKE '%VOR%'
        OR q.question_text ILIKE '%DME%'
        OR q.question_text ILIKE '%TACAN%'
        OR q.question_text ILIKE '%RMI%'
      )
    LIMIT 1
  );

-- 3.4.3 GPS / GNSS / 衛星（question_text；sub_subject に GPS ラベル無し）
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
     AND q.main_subject = '空中航法'
     AND (
       q.question_text ILIKE '%GPS%'
       OR q.question_text ILIKE '%GNSS%'
       OR q.question_text ILIKE '%衛星%'
     )),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '空中航法'
     AND (
       q.question_text ILIKE '%GPS%'
       OR q.question_text ILIKE '%GNSS%'
       OR q.question_text ILIKE '%衛星%'
     )),
  '空中航法',
  '空中航法',
  'phase_b_20260413_nav342_343_qtext',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.4.3_GPSNavigation'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '空中航法'
      AND (
        q.question_text ILIKE '%GPS%'
        OR q.question_text ILIKE '%GNSS%'
        OR q.question_text ILIKE '%衛星%'
      )
    LIMIT 1
  );
