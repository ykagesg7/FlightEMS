-- Post-Phase-B: 空中航法 3.4.5 NDB / 3.4.6 DME、航空通信 3.5.5 フレーズロジー系スタブのマッピング
-- 冪等: NOT EXISTS (learning_content_id)
-- mapping_source: post_phase_b_20260413_nav_345_355
--
-- 3.4.5: 設問文に NDB / ADF / 無方向性（verified・空中航法）
-- 3.4.6: DME・距離測定装置かつ VOR を含まない設問文（3.4.2 の広い束ねとの重複を減らす）
-- 3.5.5: 復唱・略号クラスタ + 用語系キーワード（件数はスタブ向けに抑えめ）

-- 3.4.5 NDB / ADF
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
       q.question_text ILIKE '%NDB%'
       OR q.question_text ILIKE '%ADF%'
       OR q.question_text ILIKE '%無方向性%'
     )),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '空中航法'
     AND (
       q.question_text ILIKE '%NDB%'
       OR q.question_text ILIKE '%ADF%'
       OR q.question_text ILIKE '%無方向性%'
     )),
  '空中航法',
  '空中航法',
  'post_phase_b_20260413_nav_345_355',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.4.5_NDBNavigation'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '空中航法'
      AND (
        q.question_text ILIKE '%NDB%'
        OR q.question_text ILIKE '%ADF%'
        OR q.question_text ILIKE '%無方向性%'
      )
    LIMIT 1
  );

-- 3.4.6 DME（VOR 非含有）
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
     AND (q.question_text ILIKE '%DME%' OR q.question_text ILIKE '%距離測定装置%')
     AND q.question_text NOT ILIKE '%VOR%'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '空中航法'
     AND (q.question_text ILIKE '%DME%' OR q.question_text ILIKE '%距離測定装置%')
     AND q.question_text NOT ILIKE '%VOR%'),
  '空中航法',
  '空中航法',
  'post_phase_b_20260413_nav_345_355',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.4.6_DMENavigation'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '空中航法'
      AND (q.question_text ILIKE '%DME%' OR q.question_text ILIKE '%距離測定装置%')
      AND q.question_text NOT ILIKE '%VOR%'
    LIMIT 1
  );

-- 3.5.5 管制用語・復唱・略号
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
     AND q.main_subject = '航空通信'
     AND (
       q.sub_subject IN (
         'クリアランスを受けた操縦士の責任/復唱要領',
         'クリアランスを受けた操縦士の責任（AIP）/復唱要領',
         '航空情報業務/略号及び記号'
       )
       OR q.question_text ILIKE '%復唱%'
       OR q.question_text ILIKE '%アルファベット%'
       OR q.question_text ILIKE '%数字の読み方%'
       OR q.question_text ILIKE '%標準用語%'
     )),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空通信'
     AND (
       q.sub_subject IN (
         'クリアランスを受けた操縦士の責任/復唱要領',
         'クリアランスを受けた操縦士の責任（AIP）/復唱要領',
         '航空情報業務/略号及び記号'
       )
       OR q.question_text ILIKE '%復唱%'
       OR q.question_text ILIKE '%アルファベット%'
       OR q.question_text ILIKE '%数字の読み方%'
       OR q.question_text ILIKE '%標準用語%'
     )),
  '航空通信',
  '航空通信',
  'post_phase_b_20260413_nav_345_355',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.5.5_ATCPhraseology'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空通信'
      AND (
        q.sub_subject IN (
          'クリアランスを受けた操縦士の責任/復唱要領',
          'クリアランスを受けた操縦士の責任（AIP）/復唱要領',
          '航空情報業務/略号及び記号'
        )
        OR q.question_text ILIKE '%復唱%'
        OR q.question_text ILIKE '%アルファベット%'
        OR q.question_text ILIKE '%数字の読み方%'
        OR q.question_text ILIKE '%標準用語%'
      )
    LIMIT 1
  );
