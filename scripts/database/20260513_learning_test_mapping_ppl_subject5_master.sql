-- PPL Master Subject 5（航空法規）全14本への learning_test_mapping 追補
-- unified_cpl_questions の main_subject = 航空法規 を記事テーマごとに束ねる。
-- 原則: verified かつ applicable_exams に PPL を含む設問のみ。
-- 例外（DB 上 PPL フラグ無しだが教科書整合のため収載）:
--   - 国際条約/シカゴ条約 → PPL-5-1-2
--   - 管制空域（単票）→ PPL-5-4-1
--   - 航空路、空港等及び航空保安施設/* → PPL-5-4-6
-- 冪等: ON CONFLICT (learning_content_id, topic_category) DO UPDATE
-- 適用: Supabase MCP execute_sql（project_id = fstynltdfdetpyvbrswr）

-- =============================================================================
-- PPL-5-1-1 定義・法令読み
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
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.sub_subject IN ('総則/定義', '総則/目的', '航空法及び航空法施行規則')),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空法規'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.sub_subject IN ('総則/定義', '総則/目的', '航空法及び航空法施行規則')),
  '航空法規/PPL5_definitions_and_law_text',
  '航空法規',
  'ppl5_subject5_master_20260513',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-5-1-1_AviationLawDefinitions'
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空法規'
      AND q.applicable_exams @> ARRAY['PPL']::text[]
      AND q.sub_subject IN ('総則/定義', '総則/目的', '航空法及び航空法施行規則')
    LIMIT 1
  )
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();

-- =============================================================================
-- PPL-5-1-2 シカゴ条約（CPL フラグのみの設問を許容）
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
     AND q.sub_subject = '国際条約/シカゴ条約'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空法規'
     AND q.sub_subject = '国際条約/シカゴ条約'),
  '航空法規/PPL5_chicago_convention',
  '航空法規',
  'ppl5_subject5_master_20260513',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-5-1-2_ChicagoConventionOverview'
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空法規'
      AND q.sub_subject = '国際条約/シカゴ条約'
    LIMIT 1
  )
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();

-- =============================================================================
-- PPL-5-2-1 国籍・登録
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
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.sub_subject IN ('登録/新規登録', '登録/変更登録')),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空法規'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.sub_subject IN ('登録/新規登録', '登録/変更登録')),
  '航空法規/PPL5_registration',
  '航空法規',
  'ppl5_subject5_master_20260513',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-5-2-1_AircraftNationalityAndRegistration'
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空法規'
      AND q.applicable_exams @> ARRAY['PPL']::text[]
      AND q.sub_subject IN ('登録/新規登録', '登録/変更登録')
    LIMIT 1
  )
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();

-- =============================================================================
-- PPL-5-2-2 耐空性・整備
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
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.sub_subject IN (
       '航空機の安全性/耐空証明',
       '航空機の安全性/修理改造検査',
       '航空機の安全性/耐空証明の有効期間',
       '航空機の安全性/飛行規程'
     )),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空法規'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.sub_subject IN (
       '航空機の安全性/耐空証明',
       '航空機の安全性/修理改造検査',
       '航空機の安全性/耐空証明の有効期間',
       '航空機の安全性/飛行規程'
     )),
  '航空法規/PPL5_airworthiness',
  '航空法規',
  'ppl5_subject5_master_20260513',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-5-2-2_AirworthinessAndMaintenanceOverview'
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空法規'
      AND q.applicable_exams @> ARRAY['PPL']::text[]
      AND q.sub_subject IN (
        '航空機の安全性/耐空証明',
        '航空機の安全性/修理改造検査',
        '航空機の安全性/耐空証明の有効期間',
        '航空機の安全性/飛行規程'
      )
    LIMIT 1
  )
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();

-- =============================================================================
-- PPL-5-3-1 技能証・業務範囲
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
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.sub_subject = '航空従事者/業務範囲'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空法規'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.sub_subject = '航空従事者/業務範囲'),
  '航空法規/PPL5_pilot_certificate_scope',
  '航空法規',
  'ppl5_subject5_master_20260513',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-5-3-1_PilotCertificateBasics'
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空法規'
      AND q.applicable_exams @> ARRAY['PPL']::text[]
      AND q.sub_subject = '航空従事者/業務範囲'
    LIMIT 1
  )
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();

-- =============================================================================
-- PPL-5-3-2 身体検査
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
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.sub_subject = '航空従事者/航空身体検査証明'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空法規'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.sub_subject = '航空従事者/航空身体検査証明'),
  '航空法規/PPL5_medical_certificate',
  '航空法規',
  'ppl5_subject5_master_20260513',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-5-3-2_MedicalCertificateBasics'
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空法規'
      AND q.applicable_exams @> ARRAY['PPL']::text[]
      AND q.sub_subject = '航空従事者/航空身体検査証明'
    LIMIT 1
  )
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();

-- =============================================================================
-- PPL-5-3-3 航空英語
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
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.sub_subject = '航空従事者/航空英語能力証明'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空法規'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.sub_subject = '航空従事者/航空英語能力証明'),
  '航空法規/PPL5_aviation_english',
  '航空法規',
  'ppl5_subject5_master_20260513',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-5-3-3_AviationEnglishRequirements'
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空法規'
      AND q.applicable_exams @> ARRAY['PPL']::text[]
      AND q.sub_subject = '航空従事者/航空英語能力証明'
    LIMIT 1
  )
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();

-- =============================================================================
-- PPL-5-4-1 空域・交通フロー（管制空域は PPL フラグ無しを許容）
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
     AND (
       (
         q.applicable_exams @> ARRAY['PPL']::text[]
         AND q.sub_subject IN (
           '航空機の運航/航空交通管制圏等における速度の制限',
           '航空機の運航/進路権',
           '航空機の運航/航空交通の指示',
           '航空機の運航/航空交通情報の入手のための連絡'
         )
       )
       OR q.sub_subject = '管制空域'
     )),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空法規'
     AND (
       (
         q.applicable_exams @> ARRAY['PPL']::text[]
         AND q.sub_subject IN (
           '航空機の運航/航空交通管制圏等における速度の制限',
           '航空機の運航/進路権',
           '航空機の運航/航空交通の指示',
           '航空機の運航/航空交通情報の入手のための連絡'
         )
       )
       OR q.sub_subject = '管制空域'
     )),
  '航空法規/PPL5_airspace_atc_flow',
  '航空法規',
  'ppl5_subject5_master_20260513',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-5-4-1_AirspaceAndFacilitiesOverview'
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空法規'
      AND (
        (
          q.applicable_exams @> ARRAY['PPL']::text[]
          AND q.sub_subject IN (
            '航空機の運航/航空交通管制圏等における速度の制限',
            '航空機の運航/進路権',
            '航空機の運航/航空交通の指示',
            '航空機の運航/航空交通情報の入手のための連絡'
          )
        )
        OR q.sub_subject = '管制空域'
      )
    LIMIT 1
  )
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();

-- =============================================================================
-- PPL-5-4-2 機長・出発前・運航準備
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
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.sub_subject IN (
       '航空機の運航/出発前の確認',
       '航空機の運航/救急用具',
       '航空機の運航/情報の提供',
       '航空機の運航/操縦者の見張り義務',
       '航空機の運航/危難の場合の措置',
       '航空機の運航/飛行計画及びその承認',
       '航空機の運航/航空機に備え付ける書類'
     )),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空法規'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.sub_subject IN (
       '航空機の運航/出発前の確認',
       '航空機の運航/救急用具',
       '航空機の運航/情報の提供',
       '航空機の運航/操縦者の見張り義務',
       '航空機の運航/危難の場合の措置',
       '航空機の運航/飛行計画及びその承認',
       '航空機の運航/航空機に備え付ける書類'
     )),
  '航空法規/PPL5_captain_preflight_ops',
  '航空法規',
  'ppl5_subject5_master_20260513',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-5-4-2_CaptainAuthorityAndPreflight'
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空法規'
      AND q.applicable_exams @> ARRAY['PPL']::text[]
      AND q.sub_subject IN (
        '航空機の運航/出発前の確認',
        '航空機の運航/救急用具',
        '航空機の運航/情報の提供',
        '航空機の運航/操縦者の見張り義務',
        '航空機の運航/危難の場合の措置',
        '航空機の運航/飛行計画及びその承認',
        '航空機の運航/航空機に備え付ける書類'
      )
    LIMIT 1
  )
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();

-- =============================================================================
-- PPL-5-4-3 特定操縦技能
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
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.sub_subject = '航空機の運航/特定操縦技能の審査等'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空法規'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.sub_subject = '航空機の運航/特定操縦技能の審査等'),
  '航空法規/PPL5_spc_review',
  '航空法規',
  'ppl5_subject5_master_20260513',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-5-4-3_RecurrentProficiencyOverview'
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空法規'
      AND q.applicable_exams @> ARRAY['PPL']::text[]
      AND q.sub_subject = '航空機の運航/特定操縦技能の審査等'
    LIMIT 1
  )
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();

-- =============================================================================
-- PPL-5-4-4 安全阻害・粗暴操縦・酒薬など
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
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.sub_subject IN (
       '航空機の運航/安全阻害行為等の禁止等',
       '航空機の運航/粗暴な操縦の禁止',
       '航空機の運航/アルコール又は薬物',
       '航空機の運航/物件の投下等'
     )),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空法規'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.sub_subject IN (
       '航空機の運航/安全阻害行為等の禁止等',
       '航空機の運航/粗暴な操縦の禁止',
       '航空機の運航/アルコール又は薬物',
       '航空機の運航/物件の投下等'
     )),
  '航空法規/PPL5_safety_endangering',
  '航空法規',
  'ppl5_subject5_master_20260513',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-5-4-4_SafetyEndangeringProhibitions'
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空法規'
      AND q.applicable_exams @> ARRAY['PPL']::text[]
      AND q.sub_subject IN (
        '航空機の運航/安全阻害行為等の禁止等',
        '航空機の運航/粗暴な操縦の禁止',
        '航空機の運航/アルコール又は薬物',
        '航空機の運航/物件の投下等'
      )
    LIMIT 1
  )
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();

-- =============================================================================
-- PPL-5-4-5 事故・重大インシデント報告
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
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.sub_subject = '航空機の運航/報告の義務'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空法規'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.sub_subject = '航空機の運航/報告の義務'),
  '航空法規/PPL5_accident_reporting',
  '航空法規',
  'ppl5_subject5_master_20260513',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-5-4-5_AccidentIncidentReportingBasics'
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空法規'
      AND q.applicable_exams @> ARRAY['PPL']::text[]
      AND q.sub_subject = '航空機の運航/報告の義務'
    LIMIT 1
  )
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();

-- =============================================================================
-- PPL-5-4-6 地上運用・空港保安施設（施設系は PPL フラグ無しを許容）
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
     AND (
       (
         q.applicable_exams @> ARRAY['PPL']::text[]
         AND q.sub_subject IN ('航空機の運航/地上移動', '航空機の運航/空港等付近の航行方法')
       )
       OR q.sub_subject LIKE '航空路、空港等及び航空保安施設/%'
     )),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空法規'
     AND (
       (
         q.applicable_exams @> ARRAY['PPL']::text[]
         AND q.sub_subject IN ('航空機の運航/地上移動', '航空機の運航/空港等付近の航行方法')
       )
       OR q.sub_subject LIKE '航空路、空港等及び航空保安施設/%'
     )),
  '航空法規/PPL5_aerodrome_ground',
  '航空法規',
  'ppl5_subject5_master_20260513',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-5-4-6_AerodromeGroundOperationsBasics'
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空法規'
      AND (
        (
          q.applicable_exams @> ARRAY['PPL']::text[]
          AND q.sub_subject IN ('航空機の運航/地上移動', '航空機の運航/空港等付近の航行方法')
        )
        OR q.sub_subject LIKE '航空路、空港等及び航空保安施設/%'
      )
    LIMIT 1
  )
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();

-- =============================================================================
-- PPL-5-4-7 最低高度・計器/VFR の入口
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
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.sub_subject IN (
       '航空機の運航/最低安全高度',
       '航空機の運航/計器気象状態における飛行',
       '航空機の運航/計器飛行及び計器航法による飛行',
       '航空機の運航/有視界飛行方式による飛行',
       '航空機の運航/巡航高度'
     )),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空法規'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.sub_subject IN (
       '航空機の運航/最低安全高度',
       '航空機の運航/計器気象状態における飛行',
       '航空機の運航/計器飛行及び計器航法による飛行',
       '航空機の運航/有視界飛行方式による飛行',
       '航空機の運航/巡航高度'
     )),
  '航空法規/PPL5_minimum_altitude_ifr_intro',
  '航空法規',
  'ppl5_subject5_master_20260513',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-5-4-7_IFRMinimumAltitudeIntroForPPL'
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空法規'
      AND q.applicable_exams @> ARRAY['PPL']::text[]
      AND q.sub_subject IN (
        '航空機の運航/最低安全高度',
        '航空機の運航/計器気象状態における飛行',
        '航空機の運航/計器飛行及び計器航法による飛行',
        '航空機の運航/有視界飛行方式による飛行',
        '航空機の運航/巡航高度'
      )
    LIMIT 1
  )
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();
