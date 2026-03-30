-- Incremental learning_test_mapping for PPL lesson articles (航空工学 clusters).
-- Links ReviewContentLink: unified_cpl_question_ids / test_question_ids overlaps.
--
-- Rules (see docs/08_Syllabus_Management_Guide.md):
-- - Default: verified + applicable_exams @> {PPL}（/test の PPL 基礎モードと整合）
-- - Exception blocks below: 性能と耐空性/*・遠隔表示計器/ジャイロ・航法計器/磁方位計器 は、
--   現行データが CPL のみの行が多いため **PPL 条件なし（verified のみ）** で束ねる。
--   PPL 限定試験では当該設問が出ない場合があるが、CPL 試験・復習で ReviewContentLink が効く。
-- - topic_category / subject_area = main_subject ('航空工学')
-- - Idempotent: skips if mapping row already exists for learning_content_id
--
-- Prerequisites: rows exist in learning_contents for each id below.
-- Safe to re-run.

BEGIN;

-- PPL-1-1-1: often already inserted by 20260324_pilot_ppl_tag_aviation_eng.sql — NOT EXISTS guards.

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
     AND q.sub_subject = '空力の基礎理論/対気速度'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '空力の基礎理論/対気速度'),
  '航空工学',
  '航空工学',
  'incremental_20260329_ppl_engineering',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-1-1-2_AirspeedBasics'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.applicable_exams @> ARRAY['PPL']::text[]
      AND q.main_subject = '航空工学'
      AND q.sub_subject = '空力の基礎理論/対気速度'
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
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '空力の基礎理論/二次元翼'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '空力の基礎理論/二次元翼'),
  '航空工学',
  '航空工学',
  'incremental_20260329_ppl_engineering',
  'verified'
FROM learning_contents lc
WHERE lc.id IN ('PPL-1-1-3_BernoulliPrinciple', 'PPL-1-1-4_DragBasics')
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.applicable_exams @> ARRAY['PPL']::text[]
      AND q.main_subject = '航空工学'
      AND q.sub_subject = '空力の基礎理論/二次元翼'
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
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '空力の基礎理論/安定性'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '空力の基礎理論/安定性'),
  '航空工学',
  '航空工学',
  'incremental_20260329_ppl_engineering',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-1-1-5_AxesStability'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.applicable_exams @> ARRAY['PPL']::text[]
      AND q.main_subject = '航空工学'
      AND q.sub_subject = '空力の基礎理論/安定性'
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
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '空力の基礎理論/全機の空力特性'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '空力の基礎理論/全機の空力特性'),
  '航空工学',
  '航空工学',
  'incremental_20260329_ppl_engineering',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-1-1-6_StallSpin'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.applicable_exams @> ARRAY['PPL']::text[]
      AND q.main_subject = '航空工学'
      AND q.sub_subject = '空力の基礎理論/全機の空力特性'
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
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '空力の基礎理論/プロペラ'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '空力の基礎理論/プロペラ'),
  '航空工学',
  '航空工学',
  'incremental_20260329_ppl_engineering',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-1-1-8_PropellerBasics'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.applicable_exams @> ARRAY['PPL']::text[]
      AND q.main_subject = '航空工学'
      AND q.sub_subject = '空力の基礎理論/プロペラ'
    LIMIT 1
  );

-- CPL のみプール（PPL 試験では未出題の可能性あり）
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
     AND q.sub_subject = '性能と耐空性/飛行性能'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '性能と耐空性/飛行性能'),
  '航空工学',
  '航空工学',
  'incremental_20260329_ppl_engineering_cpl_pool',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-1-1-9_FlightPerformance'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空工学'
      AND q.sub_subject = '性能と耐空性/飛行性能'
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
     AND q.sub_subject = '性能と耐空性/設計強度'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '性能と耐空性/設計強度'),
  '航空工学',
  '航空工学',
  'incremental_20260329_ppl_engineering_cpl_pool',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-1-1-7_VnDiagram'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空工学'
      AND q.sub_subject = '性能と耐空性/設計強度'
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
     AND q.sub_subject = '性能と耐空性/離着陸性能'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '性能と耐空性/離着陸性能'),
  '航空工学',
  '航空工学',
  'incremental_20260329_ppl_engineering_cpl_pool',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-1-1-10_TakeoffLandingPerformance'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空工学'
      AND q.sub_subject = '性能と耐空性/離着陸性能'
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
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空工学'
     AND (
       q.sub_subject LIKE '%エア・データー表示計器/ピトー・スタティック系統%'
       OR q.sub_subject LIKE '%エア・データー表示計器/高度計%'
       OR q.sub_subject LIKE '%ピトー・スタティック%'
     )),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空工学'
     AND (
       q.sub_subject LIKE '%エア・データー表示計器/ピトー・スタティック系統%'
       OR q.sub_subject LIKE '%エア・データー表示計器/高度計%'
       OR q.sub_subject LIKE '%ピトー・スタティック%'
     )),
  '航空工学',
  '航空工学',
  'incremental_20260329_ppl_engineering',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-1-2-2_PitotStatic'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.applicable_exams @> ARRAY['PPL']::text[]
      AND q.main_subject = '航空工学'
      AND (
        q.sub_subject LIKE '%エア・データー表示計器/ピトー・スタティック系統%'
        OR q.sub_subject LIKE '%エア・データー表示計器/高度計%'
        OR q.sub_subject LIKE '%ピトー・スタティック%'
      )
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
     AND q.sub_subject = '遠隔表示計器/ジャイロ'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '遠隔表示計器/ジャイロ'),
  '航空工学',
  '航空工学',
  'incremental_20260329_ppl_engineering_cpl_pool',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-1-2-1_GyroBasics'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空工学'
      AND q.sub_subject = '遠隔表示計器/ジャイロ'
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
     AND q.sub_subject = '航法計器/磁方位計器'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '航法計器/磁方位計器'),
  '航空工学',
  '航空工学',
  'incremental_20260329_ppl_engineering_cpl_pool',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-1-2-3_MagneticCompass'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空工学'
      AND q.sub_subject = '航法計器/磁方位計器'
    LIMIT 1
  );

-- PPL-1-2-4（作動原理）: DB に「作動原理」小分類が無いため、PPL 付きのピストン基礎系小分類を束ねる
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
     AND q.sub_subject IN (
       'ピストン・エンジン/出力',
       'ピストン・エンジン/冷却系統',
       'ピストン・エンジン/航空燃料',
       'ピストン・エンジン/航空燃料の燃焼'
     )),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空工学'
     AND q.sub_subject IN (
       'ピストン・エンジン/出力',
       'ピストン・エンジン/冷却系統',
       'ピストン・エンジン/航空燃料',
       'ピストン・エンジン/航空燃料の燃焼'
     )),
  '航空工学',
  '航空工学',
  'incremental_20260329_ppl_engineering',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-1-2-4_ReciprocatingEngine'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.applicable_exams @> ARRAY['PPL']::text[]
      AND q.main_subject = '航空工学'
      AND q.sub_subject IN (
        'ピストン・エンジン/出力',
        'ピストン・エンジン/冷却系統',
        'ピストン・エンジン/航空燃料',
        'ピストン・エンジン/航空燃料の燃焼'
      )
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
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空工学'
     AND q.sub_subject = 'ピストン・エンジン/混合気供給系統'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空工学'
     AND q.sub_subject = 'ピストン・エンジン/混合気供給系統'),
  '航空工学',
  '航空工学',
  'incremental_20260329_ppl_engineering',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-1-2-5_CarburetorMixture'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.applicable_exams @> ARRAY['PPL']::text[]
      AND q.main_subject = '航空工学'
      AND q.sub_subject = 'ピストン・エンジン/混合気供給系統'
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
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空工学'
     AND q.sub_subject = 'ピストン・エンジン/点火系統と始動系統'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空工学'
     AND q.sub_subject = 'ピストン・エンジン/点火系統と始動系統'),
  '航空工学',
  '航空工学',
  'incremental_20260329_ppl_engineering',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-1-2-6_IgnitionMagneto'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.applicable_exams @> ARRAY['PPL']::text[]
      AND q.main_subject = '航空工学'
      AND q.sub_subject = 'ピストン・エンジン/点火系統と始動系統'
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
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空工学'
     AND q.sub_subject = 'ピストン・エンジン/潤滑油と潤滑系統'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.applicable_exams @> ARRAY['PPL']::text[]
     AND q.main_subject = '航空工学'
     AND q.sub_subject = 'ピストン・エンジン/潤滑油と潤滑系統'),
  '航空工学',
  '航空工学',
  'incremental_20260329_ppl_engineering',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-1-2-7_LubricationCooling'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1 FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.applicable_exams @> ARRAY['PPL']::text[]
      AND q.main_subject = '航空工学'
      AND q.sub_subject = 'ピストン・エンジン/潤滑油と潤滑系統'
    LIMIT 1
  );

COMMIT;
