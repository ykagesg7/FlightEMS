-- 航空法規 Mission 0: 完全攻略ブリーフィング記事の登録
-- 2025-08-15 作成

-- ===============================
-- 1. learning_contentsテーブルに記事を登録
-- ===============================

INSERT INTO learning_contents (
    id,
    title,
    category,
    description,
    order_index,
    parent_id,
    content_type,
    is_published,
    created_at,
    updated_at
) VALUES (
    '3.1.1_AviationLegal0',
    '【CPL航空法 Mission 0】戦闘機乗りへの第一歩！トム兄ぃと学ぶ空の法律・完全攻略ブリーフィング',
    'CPL学科',
    'CPL航空法試験の完全攻略ブリーフィング。技能証明、航空身体検査証明、耐空証明、飛行規則、航空交通管制の基本概念を理解し、戦闘機乗りへの道筋を明確化。',
    311,
    null,
    'article',
    true,
    now(),
    now()
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    order_index = EXCLUDED.order_index,
    content_type = EXCLUDED.content_type,
    is_published = EXCLUDED.is_published,
    updated_at = now();

-- ===============================
-- 2. learning_test_mappingテーブルにマッピングを登録
-- ===============================

INSERT INTO learning_test_mapping (
    learning_content_id,
    content_title,
    content_category,
    topic_category,
    subject_area,
    relationship_type,
    weight_score,
    difficulty_level,
    estimated_study_time,
    mapping_source,
    confidence_score,
    verification_status
) VALUES (
    '3.1.1_AviationLegal0',
    '【CPL航空法 Mission 0】戦闘機乗りへの第一歩！トム兄ぃと学ぶ空の法律・完全攻略ブリーフィング',
    'CPL学科',
    '航空法規',
    'CPL航空法基礎',
    'direct',
    1.0,
    2,
    30,
    'expert_reviewed',
    0.95,
    'verified'
) ON CONFLICT (learning_content_id, topic_category, relationship_type) DO UPDATE SET
    content_title = EXCLUDED.content_title,
    content_category = EXCLUDED.content_category,
    subject_area = EXCLUDED.subject_area,
    weight_score = EXCLUDED.weight_score,
    difficulty_level = EXCLUDED.difficulty_level,
    estimated_study_time = EXCLUDED.estimated_study_time,
    mapping_source = EXCLUDED.mapping_source,
    confidence_score = EXCLUDED.confidence_score,
    verification_status = EXCLUDED.verification_status,
    updated_at = now();

-- ===============================
-- 3. 関連する航空法規問題とのマッピング（将来的な拡張用）
-- ===============================

-- 航空法規基礎関連の問題IDを配列で設定
-- 注意: 実際の統一CPL問題IDは実データに基づいて設定する必要があります
UPDATE learning_test_mapping
SET unified_cpl_question_ids = ARRAY[
    -- 航空法規基礎関連の問題IDをここに配列で設定
    -- 例: (SELECT ARRAY_AGG(id) FROM unified_cpl_questions
    --      WHERE main_subject = '航空法規' AND sub_subject LIKE '%基礎%' OR sub_subject LIKE '%概要%' LIMIT 10)
]::UUID[]
WHERE learning_content_id = '3.1.1_AviationLegal0';

-- ===============================
-- 4. 確認クエリ
-- ===============================

-- 登録された記事の確認
SELECT
    id,
    title,
    category,
    order_index,
    is_published,
    created_at
FROM learning_contents
WHERE id = '3.1.1_AviationLegal0';

-- マッピングの確認
SELECT
    learning_content_id,
    content_title,
    topic_category,
    subject_area,
    relationship_type,
    weight_score,
    difficulty_level
FROM learning_test_mapping
WHERE learning_content_id = '3.1.1_AviationLegal0';
