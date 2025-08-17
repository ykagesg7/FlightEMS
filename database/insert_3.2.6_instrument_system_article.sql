-- 航空工学 Mission E-6: 計器システム記事の登録
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
    '3.2.6_InstrumentSystem',
    '【航空工学 Mission E-6】計器システム - 世界を計る目',
    'CPL学科',
    '航空機の計器システムの基本原理からグラスコックピット、HUDまでを徹底解説。空間識失調の危険性、Six Packの六つの基本計器、グラスコックピットの統合表示、HUDの拡張現実技術を理解し、計器飛行の本質を習得。',
    326,
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
    '3.2.6_InstrumentSystem',
    '【航空工学 Mission E-6】計器システム - 世界を計る目',
    'CPL学科',
    '航空工学',
    '計器システム',
    'direct',
    1.0,
    5,
    70,
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
UPDATE learning_contents SET sub_category = '航空工学' WHERE id = '3.2.6_InstrumentSystem';

-- ===============================
-- 3. 関連する航空工学問題とのマッピング（将来的な拡張用）
-- ===============================

-- 計器システム関連の問題IDを配列で設定
-- 注意: 実際の統一CPL問題IDは実データに基づいて設定する必要があります
UPDATE learning_test_mapping
SET unified_cpl_question_ids = ARRAY[
    -- 計器システム関連の問題IDをここに配列で設定
    -- 例: (SELECT ARRAY_AGG(id) FROM unified_cpl_questions
    --      WHERE main_subject = '航空工学' AND sub_subject LIKE '%計器%' OR sub_subject LIKE '%Six Pack%' LIMIT 10)
]::UUID[]
WHERE learning_content_id = '3.2.6_InstrumentSystem';

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
WHERE id = '3.2.6_InstrumentSystem';

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
WHERE learning_content_id = '3.2.6_InstrumentSystem';
