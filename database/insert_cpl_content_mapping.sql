-- CPL航空法記事と関連テストのマッピングデータを挿入

-- learning_test_mappingテーブルにデータ挿入
INSERT INTO learning_test_mapping (content_id, content_title, test_id, test_category, subject_area, relationship_type, weight_score, created_at) VALUES
-- Mission 0: 完全攻略ブリーフィング
('3.0_AviationLegal0', 'CPL航空法 Mission 0: 完全攻略ブリーフィング', 'cpl_aviation_law_basic', 'CPL航空法', '航空法基礎', 'prerequisite', 0.9, NOW()),
('3.0_AviationLegal0', 'CPL航空法 Mission 0: 完全攻略ブリーフィング', 'cpl_aviation_law_advanced', 'CPL航空法', '航空法総合', 'related', 0.7, NOW()),

-- Mission 1-1: 技能証明制度の完全理解
('3.1_AviationLegal1', 'CPL航空法 Mission 1-1: 技能証明制度の完全理解', 'cpl_skill_certification', 'CPL航空法', '技能証明', 'direct', 1.0, NOW()),
('3.1_AviationLegal1', 'CPL航空法 Mission 1-1: 技能証明制度の完全理解', 'cpl_aviation_law_basic', 'CPL航空法', '航空法基礎', 'practice', 0.8, NOW()),

-- Mission 1-2: 航空身体検査証明の要件
('3.2_AviationLegal2', 'CPL航空法 Mission 1-2: 航空身体検査証明の要件', 'cpl_medical_certification', 'CPL航空法', '身体検査証明', 'direct', 1.0, NOW()),
('3.2_AviationLegal2', 'CPL航空法 Mission 1-2: 航空身体検査証明の要件', 'cpl_aviation_law_basic', 'CPL航空法', '航空法基礎', 'practice', 0.8, NOW());

-- user_weak_areasテーブルに初期化データを挿入（全ユーザー対象の弱点領域分析用）
-- 注意: 実際のプロダクションでは特定のユーザーIDを使用
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM profiles LIMIT 10
    LOOP
        INSERT INTO user_weak_areas (user_id, subject_area, difficulty_level, error_count, improvement_score, last_test_date, needs_review, created_at) VALUES
        (user_record.id, '技能証明', 'basic', 0, 1.0, NULL, false, NOW()),
        (user_record.id, '身体検査証明', 'basic', 0, 1.0, NULL, false, NOW()),
        (user_record.id, '航空法基礎', 'basic', 0, 1.0, NULL, false, NOW()),
        (user_record.id, '航空法総合', 'intermediate', 0, 1.0, NULL, false, NOW())
        ON CONFLICT (user_id, subject_area, difficulty_level) DO NOTHING;
    END LOOP;
END
$$;

-- CPL試験問題のメタデータを追加
INSERT INTO cpl_exam_questions (question_id, exam_date, subject_area, difficulty_level, correct_rate, question_type, related_content_ids, created_at) VALUES
('q_skill_cert_001', '2024-11-01', '技能証明', 'basic', 0.75, 'multiple_choice', ARRAY['3.1_AviationLegal1'], NOW()),
('q_skill_cert_002', '2024-11-01', '技能証明', 'intermediate', 0.65, 'multiple_choice', ARRAY['3.1_AviationLegal1'], NOW()),
('q_medical_cert_001', '2024-11-01', '身体検査証明', 'basic', 0.80, 'multiple_choice', ARRAY['3.2_AviationLegal2'], NOW()),
('q_medical_cert_002', '2024-11-01', '身体検査証明', 'intermediate', 0.70, 'multiple_choice', ARRAY['3.2_AviationLegal2'], NOW()),
('q_aviation_law_001', '2024-11-01', '航空法基礎', 'basic', 0.85, 'multiple_choice', ARRAY['3.0_AviationLegal0'], NOW()),
('q_aviation_law_002', '2024-11-01', '航空法総合', 'advanced', 0.55, 'multiple_choice', ARRAY['3.0_AviationLegal0', '3.1_AviationLegal1', '3.2_AviationLegal2'], NOW())
ON CONFLICT (question_id) DO NOTHING;

-- 出題傾向分析データを追加
INSERT INTO exam_trend_analysis (exam_period, subject_area, frequency_score, difficulty_trend, success_rate_trend, recommended_study_hours, created_at) VALUES
('2024-Q4', '技能証明', 0.85, 'stable', 'improving', 15, NOW()),
('2024-Q4', '身体検査証明', 0.70, 'stable', 'stable', 10, NOW()),
('2024-Q4', '航空法基礎', 0.95, 'increasing', 'stable', 20, NOW()),
('2024-Q4', '航空法総合', 0.60, 'increasing', 'declining', 25, NOW())
ON CONFLICT (exam_period, subject_area) DO UPDATE SET
frequency_score = EXCLUDED.frequency_score,
difficulty_trend = EXCLUDED.difficulty_trend,
success_rate_trend = EXCLUDED.success_rate_trend,
recommended_study_hours = EXCLUDED.recommended_study_hours,
updated_at = NOW();

-- コンテンツ推奨事項を追加
INSERT INTO content_recommendations (content_type, subject_area, priority_level, recommended_format, estimated_creation_time, target_difficulty, rationale, created_at) VALUES
('article', '耐空証明', 'high', 'detailed_explanation', 240, 'intermediate', '耐空証明制度の理解が不足している受験者が多い', NOW()),
('quiz', '技能証明', 'medium', 'practice_questions', 120, 'basic', '基礎問題での得点向上が期待できる', NOW()),
('article', '飛行規則', 'high', 'detailed_explanation', 300, 'advanced', '飛行規則の詳細な理解が必要', NOW()),
('quiz', '身体検査証明', 'medium', 'practice_questions', 90, 'intermediate', '実践的な問題演習が効果的', NOW())
ON CONFLICT (content_type, subject_area, target_difficulty) DO UPDATE SET
priority_level = EXCLUDED.priority_level,
rationale = EXCLUDED.rationale,
updated_at = NOW();

COMMIT; 