-- Learning-Test連携システム初期データ投入
-- CPL航空法記事と統一CPL問題のマッピング

-- ===============================
-- CPL航空法記事とテスト問題のマッピング
-- ===============================

INSERT INTO learning_test_mapping (
    learning_content_id, content_title, content_category,
    topic_category, subject_area, relationship_type,
    weight_score, difficulty_level, estimated_study_time,
    mapping_source, confidence_score, verification_status
) VALUES

-- Mission 0: CPL航空法完全攻略ブリーフィング
('3.0_AviationLegal0', 'CPL航空法 Mission 0: 完全攻略ブリーフィング', 'CPL航空法',
 '航空法規', '航空法基礎', 'prerequisite',
 0.9, 2, 45, 'expert_reviewed', 0.95, 'verified'),

-- Mission 1-1: 技能証明制度の完全理解
('3.1_AviationLegal1', 'CPL航空法 Mission 1-1: 技能証明制度の完全理解', 'CPL航空法',
 '航空法規', '技能証明', 'direct',
 1.0, 3, 35, 'expert_reviewed', 0.98, 'verified'),

-- Mission 1-2: 航空身体検査証明の要件
('3.2_AviationLegal2', 'CPL航空法 Mission 1-2: 航空身体検査証明の要件', 'CPL航空法',
 '航空法規', '身体検査証明', 'direct',
 1.0, 3, 30, 'expert_reviewed', 0.98, 'verified'),

-- Mission 2-1: 耐空証明と航空機の健康管理
('3.3_AviationLegal3', 'CPL航空法 Mission 2-1: 耐空証明と航空機の健康管理', 'CPL航空法',
 '航空法規', '耐空証明', 'direct',
 1.0, 4, 40, 'expert_reviewed', 0.97, 'verified');

-- ===============================
-- 航空工学分野のマッピング（サンプル）
-- ===============================

-- 追加の航空工学関連記事マッピング（将来的な拡張用）
INSERT INTO learning_test_mapping (
    learning_content_id, content_title, content_category,
    topic_category, subject_area, relationship_type,
    weight_score, difficulty_level, estimated_study_time,
    mapping_source, confidence_score, verification_status
) VALUES

-- 航空工学基礎（仮想記事例）
('engineering_basics', '航空工学の基礎原理', '航空工学',
 '航空工学', '基礎理論', 'prerequisite',
 0.8, 3, 60, 'manual', 0.85, 'pending'),

-- 航空気象基礎（仮想記事例）
('weather_basics', '航空気象の基礎知識', '航空気象',
 '航空気象', '気象現象', 'prerequisite',
 0.8, 2, 45, 'manual', 0.80, 'pending');

-- ===============================
-- 統一CPL問題との関連付け（サンプル）
-- ===============================

-- CPL航空法記事に対応する統一CPL問題IDを更新
-- 注意: 実際の統一CPL問題IDは実データに基づいて設定する必要があります

UPDATE learning_test_mapping
SET unified_cpl_question_ids = ARRAY[
    -- 航空法規関連の問題IDをここに配列で設定
    -- 例: (SELECT ARRAY_AGG(id) FROM unified_cpl_questions WHERE main_subject = '航空法規' AND sub_subject LIKE '%技能証明%' LIMIT 5)
]::UUID[]
WHERE learning_content_id = '3.1_AviationLegal1';

UPDATE learning_test_mapping
SET unified_cpl_question_ids = ARRAY[
    -- 身体検査証明関連の問題IDをここに配列で設定
]::UUID[]
WHERE learning_content_id = '3.2_AviationLegal2';

UPDATE learning_test_mapping
SET unified_cpl_question_ids = ARRAY[
    -- 耐空証明関連の問題IDをここに配列で設定
]::UUID[]
WHERE learning_content_id = '3.3_AviationLegal3';

-- ===============================
-- 学習推奨エンジンの初期データ
-- ===============================

-- サンプル推奨データ（特定ユーザー向け）
-- 実際の運用では動的に生成される
INSERT INTO learning_recommendations (
    user_id, recommended_content_id, content_type,
    recommendation_reason, priority_score, estimated_impact,
    estimated_time, difficulty_match, algorithm_version
) 
SELECT 
    p.id as user_id,
    '3.0_AviationLegal0' as recommended_content_id,
    'article' as content_type,
    'CPL試験対策の基礎として推奨' as recommendation_reason,
    8.5 as priority_score,
    85.0 as estimated_impact,
    45 as estimated_time,
    0.8 as difficulty_match,
    'v1.0' as algorithm_version
FROM profiles p
WHERE p.roll = 'Student'
LIMIT 5; -- 最初の5名の学生ユーザーにのみ適用

-- ===============================
-- 関数: 記事に関連するCPL問題を動的に取得
-- ===============================

CREATE OR REPLACE FUNCTION get_related_cpl_questions(
    content_id VARCHAR,
    question_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    question_id UUID,
    main_subject VARCHAR,
    sub_subject VARCHAR,
    question_text TEXT,
    difficulty_level INTEGER,
    relationship_type VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ucq.id as question_id,
        ucq.main_subject,
        ucq.sub_subject,
        ucq.question_text,
        ucq.difficulty_level,
        ltm.relationship_type
    FROM learning_test_mapping ltm
    JOIN unified_cpl_questions ucq ON ucq.id = ANY(ltm.unified_cpl_question_ids)
    WHERE ltm.learning_content_id = content_id
      AND ltm.verification_status = 'verified'
      AND ucq.verification_status = 'verified'
    ORDER BY ltm.weight_score DESC, ucq.importance_score DESC
    LIMIT question_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================
-- 関数: ユーザーの弱点に基づく記事推奨
-- ===============================

CREATE OR REPLACE FUNCTION get_recommended_articles_for_weak_areas(
    p_user_id UUID,
    recommendation_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    content_id VARCHAR,
    content_title VARCHAR,
    content_category VARCHAR,
    priority_score DECIMAL,
    accuracy_rate DECIMAL,
    recommended_reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ltm.learning_content_id as content_id,
        ltm.content_title,
        ltm.content_category,
        (100 - uwa.accuracy_rate) * ltm.weight_score as priority_score,
        uwa.accuracy_rate,
        CONCAT('正答率', uwa.accuracy_rate::TEXT, '%の', uwa.subject_category, 'の理解向上のため') as recommended_reason
    FROM user_weak_areas uwa
    JOIN learning_test_mapping ltm ON ltm.subject_area = uwa.subject_category
    WHERE uwa.user_id = p_user_id
      AND uwa.accuracy_rate < 80.0  -- 80%未満を弱点とする
      AND ltm.verification_status = 'verified'
    ORDER BY priority_score DESC
    LIMIT recommendation_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================
-- View: 学習進捗統合ビュー
-- ===============================

CREATE OR REPLACE VIEW learning_progress_overview AS
SELECT 
    p.user_id,
    ltm.learning_content_id,
    ltm.content_title,
    ltm.topic_category,
    ltm.subject_area,
    p.completed as is_content_completed,
    p.last_read_position,
    p.last_read_date,
    COALESCE(uwa.accuracy_rate, 0) as subject_accuracy_rate,
    CASE 
        WHEN p.completed AND COALESCE(uwa.accuracy_rate, 0) >= 70 THEN 'mastered'
        WHEN p.completed AND COALESCE(uwa.accuracy_rate, 0) < 70 THEN 'needs_practice'
        WHEN p.last_read_position > 0 THEN 'in_progress'
        ELSE 'not_started'
    END as learning_status,
    ltm.estimated_study_time,
    ltm.difficulty_level
FROM learning_test_mapping ltm
LEFT JOIN progress p ON p.content_id = ltm.learning_content_id
LEFT JOIN user_weak_areas uwa ON uwa.user_id = p.user_id 
    AND uwa.subject_category = ltm.subject_area
WHERE ltm.verification_status = 'verified';

COMMENT ON VIEW learning_progress_overview IS 'ユーザーの学習進捗とテスト成績を統合したビュー'; 