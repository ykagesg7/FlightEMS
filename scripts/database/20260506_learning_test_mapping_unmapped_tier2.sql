-- §5.2 上位未マッピングクラスタの追補（2026-05-06、Article_Coverage_Backlog §6 の次段）。
--
-- 監査: MCP execute_sql（project_id FlightAcademy）で §5.2 と同一の WITH mapped クエリを実行し、
--       未マッピング件数が多い sub_subject を優先。
--
-- 方針:
--   - 工学の「構造・燃料・雑音」系は既存ハブ `engineering_basics` へ束ね（topic_category で区別）。
--   - 法規「総則」小分類は入口 `3.1.1_AviationLegal0` へ束ね。
--   - 冪等: ON CONFLICT (learning_content_id, topic_category) DO UPDATE。
--   - mapping_source でロールバック時に追跡可能にする。
--
-- 適用: Supabase MCP execute_sql または Dashboard SQL エディタ（本番は [04_Operations_Guide.md](../../docs/04_Operations_Guide.md) に沿う）

-- 1) 工学: 航空機の構造/荷重と強度（§6 スナップショット 16 問）
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
     AND q.sub_subject = '航空機の構造/荷重と強度'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '航空機の構造/荷重と強度'),
  '航空工学/unmapped_荷重と強度',
  '航空機の構造/荷重と強度',
  'phase_b_20260506_unmapped_tier2',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'engineering_basics'
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空工学'
      AND q.sub_subject = '航空機の構造/荷重と強度'
    LIMIT 1
  )
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();

-- 2) 工学: 航空機の構造/機体の構造（12 問）
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
     AND q.sub_subject = '航空機の構造/機体の構造'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '航空機の構造/機体の構造'),
  '航空工学/unmapped_機体の構造',
  '航空機の構造/機体の構造',
  'phase_b_20260506_unmapped_tier2',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'engineering_basics'
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空工学'
      AND q.sub_subject = '航空機の構造/機体の構造'
    LIMIT 1
  )
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();

-- 3) 工学: 燃料供給系統/燃料供給系統（11 問）
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
  '航空工学/unmapped_燃料供給系統',
  '燃料供給系統/燃料供給系統',
  'phase_b_20260506_unmapped_tier2',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'engineering_basics'
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空工学'
      AND q.sub_subject = '燃料供給系統/燃料供給系統'
    LIMIT 1
  )
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();

-- 4) 法規: 総則/定義（8 問）→ 法規入口記事
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
     AND q.sub_subject = '総則/定義'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空法規'
     AND q.sub_subject = '総則/定義'),
  '航空法規/unmapped_総則定義',
  '総則/定義',
  'phase_b_20260506_unmapped_tier2',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.1.1_AviationLegal0'
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空法規'
      AND q.sub_subject = '総則/定義'
    LIMIT 1
  )
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();

-- 5) 工学（分類上 main_subject=航空工学）: 無線通信/雑音と空電（7 問）
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
     AND q.sub_subject = '無線通信/雑音と空電'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '無線通信/雑音と空電'),
  '航空工学/unmapped_雑音と空電',
  '無線通信/雑音と空電',
  'phase_b_20260506_unmapped_tier2',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'engineering_basics'
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空工学'
      AND q.sub_subject = '無線通信/雑音と空電'
    LIMIT 1
  )
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();
