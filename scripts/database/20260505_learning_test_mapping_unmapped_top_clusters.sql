-- §5.2 未マッピング設問が多いクラスタの上位を、既存記事へ束ねる追補（Phase B / 2026-05-05）。
--
-- 方針:
--   - `learning_test_mapping` のユニークは (learning_content_id, topic_category)。
--     既存の `engineering_basics`（topic_category=航空工学）や `3.1.1`（航空法規）と衝突しないよう、
--     topic_category は `…/unmapped_<sub_subject略>` を採用。
--   - 束ねは sub_subject 完全一致のみ（広げすぎない）。Review 時に狭義化・記事分割可。
--   - 冪等: ON CONFLICT (learning_content_id, topic_category) DO UPDATE。
--
-- 適用: Supabase MCP execute_sql（project_id = FlightAcademy）

-- 1) 工学ハブ: 航空機装備（34 問想定）
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
     AND q.sub_subject = '航空機装備'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '航空機装備'),
  '航空工学/unmapped_航空機装備',
  '航空機装備',
  'phase_b_20260505_unmapped_top_clusters',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'engineering_basics'
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空工学'
      AND q.sub_subject = '航空機装備'
    LIMIT 1
  )
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();

-- 2) 工学ハブ: 航空機構造（33 問想定）
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
     AND q.sub_subject = '航空機構造'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空工学'
     AND q.sub_subject = '航空機構造'),
  '航空工学/unmapped_航空機構造',
  '航空機構造',
  'phase_b_20260505_unmapped_top_clusters',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'engineering_basics'
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空工学'
      AND q.sub_subject = '航空機構造'
    LIMIT 1
  )
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();

-- 3) 法規入口: 航空法及び航空法施行規則（10 問想定）
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
     AND q.sub_subject = '航空法及び航空法施行規則'),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空法規'
     AND q.sub_subject = '航空法及び航空法施行規則'),
  '航空法規/unmapped_施行規則',
  '航空法及び航空法施行規則',
  'phase_b_20260505_unmapped_top_clusters',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.1.1_AviationLegal0'
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空法規'
      AND q.sub_subject = '航空法及び航空法施行規則'
    LIMIT 1
  )
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();
