-- CPL 学科シリーズ（3.2.x）・engineering_basics・気象 weather_basics 向け:
-- 1) 航空力学バッチ（20260325_batch_ppl_aviation_mechanics.sql と同等）＋工学サブトピック・気象に PPL 付与
-- 2) learning_test_mapping の unified_cpl_question_ids / test_question_ids を更新
-- 再実行: UPDATE は冪等（同じ ID 集合を再設定）。法規 3.1.x は CPL のみの ID をマッピング（PPL タグなし）
-- 単体の力学のみ先に当てたい場合は 20260325_batch_ppl_aviation_mechanics.sql のみ実行可（本ファイルと重複しても安全）

BEGIN;

UPDATE unified_cpl_questions u
SET applicable_exams = ARRAY['PPL', 'CPL']::text[],
  updated_at = COALESCE(u.updated_at, now())
WHERE u.verification_status = 'verified'
  AND u.main_subject = '航空工学'
  AND u.sub_subject = '航空力学'
  AND NOT (u.applicable_exams @> ARRAY['PPL']::text[]);

-- --- A: PPL タグ（工学シリーズ + 気象トピック）---
UPDATE unified_cpl_questions u
SET applicable_exams = ARRAY['PPL', 'CPL']::text[],
  updated_at = COALESCE(u.updated_at, now())
WHERE u.verification_status = 'verified'
  AND NOT (u.applicable_exams @> ARRAY['PPL']::text[])
  AND (
    (u.main_subject = '航空工学' AND u.sub_subject LIKE '%プロペラ%')
    OR (u.main_subject = '航空工学' AND (u.sub_subject LIKE '%二次元翼%' OR u.sub_subject LIKE '%全機の空力特性%'))
    OR (u.main_subject = '航空工学' AND u.sub_subject LIKE '%安定性%')
    OR (u.main_subject = '航空工学' AND (u.sub_subject LIKE '%油圧%' OR u.sub_subject LIKE '%航空機電気%'))
    OR (u.main_subject = '航空工学' AND (u.sub_subject LIKE '%エンジン%' OR u.sub_subject LIKE '%推進%'))
    OR (
      u.main_subject = '航空工学'
      AND (
        u.sub_subject LIKE '%エア・データー%'
        OR u.sub_subject LIKE '%高度計%'
        OR u.sub_subject LIKE '%ピトー%'
      )
    )
    OR (u.main_subject = '航空気象' AND u.sub_subject = '大気の基礎/温度')
  );

-- --- B: マッピング用ヘルパ（記事 ID → 問題 UUID 配列）---
CREATE TEMP TABLE _map_engineering (
  learning_content_id varchar PRIMARY KEY,
  unified_cpl_question_ids uuid[],
  test_question_ids text[]
) ON COMMIT DROP;

INSERT INTO _map_engineering
SELECT '3.2.1_PropellerTheory',
  array_agg(id ORDER BY id),
  array_agg(id::text ORDER BY id)
FROM unified_cpl_questions
WHERE verification_status = 'verified'
  AND main_subject = '航空工学'
  AND sub_subject LIKE '%プロペラ%';

INSERT INTO _map_engineering
SELECT '3.2.2_WingTheory',
  array_agg(id ORDER BY id),
  array_agg(id::text ORDER BY id)
FROM unified_cpl_questions
WHERE verification_status = 'verified'
  AND main_subject = '航空工学'
  AND (sub_subject LIKE '%二次元翼%' OR sub_subject LIKE '%全機の空力特性%');

INSERT INTO _map_engineering
SELECT '3.2.3_StabilityControl',
  array_agg(id ORDER BY id),
  array_agg(id::text ORDER BY id)
FROM unified_cpl_questions
WHERE verification_status = 'verified'
  AND main_subject = '航空工学'
  AND sub_subject LIKE '%安定性%';

INSERT INTO _map_engineering
SELECT '3.2.4_HydraulicElectrical',
  array_agg(id ORDER BY id),
  array_agg(id::text ORDER BY id)
FROM unified_cpl_questions
WHERE verification_status = 'verified'
  AND main_subject = '航空工学'
  AND (sub_subject LIKE '%油圧%' OR sub_subject LIKE '%航空機電気%');

INSERT INTO _map_engineering
SELECT '3.2.5_EngineTheory',
  array_agg(id ORDER BY id),
  array_agg(id::text ORDER BY id)
FROM unified_cpl_questions
WHERE verification_status = 'verified'
  AND main_subject = '航空工学'
  AND (sub_subject LIKE '%エンジン%' OR sub_subject LIKE '%推進%');

INSERT INTO _map_engineering
SELECT '3.2.6_InstrumentSystem',
  array_agg(id ORDER BY id),
  array_agg(id::text ORDER BY id)
FROM unified_cpl_questions
WHERE verification_status = 'verified'
  AND main_subject = '航空工学'
  AND (
    sub_subject LIKE '%エア・データー%'
    OR sub_subject LIKE '%高度計%'
    OR sub_subject LIKE '%ピトー%'
  );

INSERT INTO _map_engineering
SELECT 'engineering_basics',
  array_agg(id ORDER BY id),
  array_agg(id::text ORDER BY id)
FROM unified_cpl_questions
WHERE verification_status = 'verified'
  AND main_subject = '航空工学'
  AND sub_subject = '航空力学';

INSERT INTO _map_engineering
SELECT 'weather_basics',
  array_agg(id ORDER BY id),
  array_agg(id::text ORDER BY id)
FROM unified_cpl_questions
WHERE verification_status = 'verified'
  AND main_subject = '航空気象'
  AND sub_subject = '大気の基礎/温度';

-- 航空法規: PPL タグは付けず、記事ごとに ID 範囲を分割（CPL 学科記事の復習導線用）
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY id) AS rn,
    COUNT(*) OVER () AS total_n
  FROM unified_cpl_questions
  WHERE verification_status = 'verified'
    AND main_subject = '航空法規'
),
buckets AS (
  SELECT
    id,
    CASE
      WHEN rn <= total_n / 4.0 THEN '3.1.1_AviationLegal0'
      WHEN rn <= 2 * total_n / 4.0 THEN '3.1.2_AviationLegal1'
      WHEN rn <= 3 * total_n / 4.0 THEN '3.1.3_AviationLegal2'
      ELSE '3.1.4_AviationLegal3'
    END AS learning_content_id
  FROM ranked
)
INSERT INTO _map_engineering
SELECT
  learning_content_id,
  array_agg(id ORDER BY id),
  array_agg(id::text ORDER BY id)
FROM buckets
GROUP BY learning_content_id;

UPDATE learning_test_mapping m
SET
  unified_cpl_question_ids = e.unified_cpl_question_ids,
  test_question_ids = e.test_question_ids,
  mapping_source = 'batch_20260325_engineering',
  updated_at = now()
FROM _map_engineering e
WHERE m.learning_content_id = e.learning_content_id
  AND e.unified_cpl_question_ids IS NOT NULL
  AND cardinality(e.unified_cpl_question_ids) > 0;

COMMIT;
