-- 航空工学 Mission E-4: 油圧・電気系統記事の登録
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
    '3.2.4_HydraulicElectrical',
    '【航空工学 Mission E-4】油圧・電気系統 - 機体の神経と血管',
    'CPL学科',
    '航空機の油圧・電気系統の基本原理と冗長性設計を徹底解説。油圧系統のパスカルの原理、電気系統の神経網的役割、Redundancy（冗長性）の重要性、フライ・バイ・ワイヤへの依存度を理解し、システム統合思想を習得。',
    324,
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
    '3.2.4_HydraulicElectrical',
    '【航空工学 Mission E-4】油圧・電気系統 - 機体の神経と血管',
    'CPL学科',
    '航空工学',
    '油圧・電気系統',
    'direct',
    1.0,
    4,
    60,
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

-- サブカテゴリ設定（タグ相当）
UPDATE learning_contents SET sub_category = '航空工学' WHERE id = '3.2.4_HydraulicElectrical';

-- ===============================
-- 3. 関連する航空工学問題とのマッピング（将来的な拡張用）
-- ===============================

-- 油圧・電気系統関連の問題IDを配列で設定
-- 注意: 実際の統一CPL問題IDは実データに基づいて設定する必要があります
UPDATE learning_test_mapping
SET unified_cpl_question_ids = ARRAY[
    -- 油圧・電気系統関連の問題IDをここに配列で設定
    -- 例: (SELECT ARRAY_AGG(id) FROM unified_cpl_questions
    --      WHERE main_subject = '航空工学' AND sub_subject LIKE '%油圧%' OR sub_subject LIKE '%電気%' LIMIT 10)
]::UUID[]
WHERE learning_content_id = '3.2.4_HydraulicElectrical';

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
WHERE id = '3.2.4_HydraulicElectrical';

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
WHERE learning_content_id = '3.2.4_HydraulicElectrical';
