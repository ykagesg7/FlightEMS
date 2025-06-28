-- CPL試験データ管理・分析システム用テーブル作成スクリプト
-- 作成日: 2025年6月21日
-- Phase 6: CPL試験データ管理・分析システム

-- 試験問題メタデータテーブル
CREATE TABLE IF NOT EXISTS exam_questions_metadata (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_year integer NOT NULL,
    exam_month integer NOT NULL,
    question_number integer NOT NULL,
    subject_category varchar(50) NOT NULL, -- 航法、航空法規、気象、機体、通信、空港・管制、航空工学、飛行理論
    sub_category varchar(100),             -- 詳細分野
    difficulty_level integer CHECK (difficulty_level BETWEEN 1 AND 5),
    appearance_frequency integer DEFAULT 0, -- 過去の出題回数
    importance_score decimal(5,2),         -- 重要度スコア（出題頻度×難易度×最新性）
    source_document varchar(255),          -- 元PDFファイル名
    markdown_content text NOT NULL,        -- 変換されたMarkdown
    question_text text,                    -- 問題文
    options jsonb,                         -- 選択肢（JSON形式）
    correct_answer integer,                -- 正解番号（1-4）
    explanation text,                      -- 解説
    tags text[],                          -- タグ配列
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    
    -- 制約
    UNIQUE(exam_year, exam_month, question_number)
);

-- 出題傾向分析結果テーブル
CREATE TABLE IF NOT EXISTS exam_trend_analysis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_date date NOT NULL,
    subject_category varchar(50) NOT NULL,
    sub_category varchar(100),
    question_count integer,
    avg_difficulty decimal(3,2),
    frequency_trend varchar(20) CHECK (frequency_trend IN ('increasing', 'stable', 'decreasing')),
    importance_rank integer,
    trend_score decimal(5,2),
    yearly_data jsonb,                     -- 年度別データ（JSON形式）
    analysis_notes text,
    created_at timestamp DEFAULT now(),
    
    -- 制約
    UNIQUE(analysis_date, subject_category, sub_category)
);

-- 記事作成推奨事項テーブル
CREATE TABLE IF NOT EXISTS content_recommendations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_category varchar(50) NOT NULL,
    sub_category varchar(100),
    priority_score integer CHECK (priority_score BETWEEN 1 AND 10),
    recommended_title varchar(255),
    target_question_ids uuid[],            -- 対象問題ID配列
    coverage_gap_percentage decimal(5,2),  -- カバレッジギャップ（0-100%）
    estimated_impact_score decimal(5,2),   -- 予想効果スコア
    estimated_study_time integer,          -- 推定学習時間（分）
    target_difficulty_level integer,       -- 対象難易度レベル
    suggested_outline text[],              -- 推奨記事構成
    related_learning_contents text[],      -- 関連学習コンテンツID
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'))
);

-- 学習記事と試験問題のマッピングテーブル（既存のlearning_test_mappingを拡張）
CREATE TABLE IF NOT EXISTS learning_test_mapping_extended (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_content_id varchar NOT NULL,
    exam_question_id uuid REFERENCES exam_questions_metadata(id),
    mapping_strength decimal(3,2) DEFAULT 1.0, -- マッピング強度（0.0-1.0）
    mapping_type varchar(20) DEFAULT 'direct', -- 'direct', 'related', 'supporting'
    created_by varchar(50) DEFAULT 'system',   -- 'system', 'manual', 'ai'
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    
    -- 制約
    UNIQUE(learning_content_id, exam_question_id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_exam_questions_metadata_year_month ON exam_questions_metadata(exam_year, exam_month);
CREATE INDEX IF NOT EXISTS idx_exam_questions_metadata_subject ON exam_questions_metadata(subject_category, sub_category);
CREATE INDEX IF NOT EXISTS idx_exam_questions_metadata_difficulty ON exam_questions_metadata(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_exam_questions_metadata_importance ON exam_questions_metadata(importance_score DESC);

CREATE INDEX IF NOT EXISTS idx_exam_trend_analysis_date ON exam_trend_analysis(analysis_date DESC);
CREATE INDEX IF NOT EXISTS idx_exam_trend_analysis_subject ON exam_trend_analysis(subject_category, sub_category);

CREATE INDEX IF NOT EXISTS idx_content_recommendations_priority ON content_recommendations(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_content_recommendations_status ON content_recommendations(status);

CREATE INDEX IF NOT EXISTS idx_learning_test_mapping_content ON learning_test_mapping_extended(learning_content_id);
CREATE INDEX IF NOT EXISTS idx_learning_test_mapping_question ON learning_test_mapping_extended(exam_question_id);

-- Row Level Security (RLS) ポリシー設定

-- exam_questions_metadata テーブル
ALTER TABLE exam_questions_metadata ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーは全て読み取り可能
CREATE POLICY "exam_questions_metadata_select" ON exam_questions_metadata
    FOR SELECT
    TO authenticated
    USING (true);

-- Admin のみ挿入・更新・削除可能
CREATE POLICY "exam_questions_metadata_insert" ON exam_questions_metadata
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.roll = 'Admin'
        )
    );

CREATE POLICY "exam_questions_metadata_update" ON exam_questions_metadata
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.roll = 'Admin'
        )
    );

CREATE POLICY "exam_questions_metadata_delete" ON exam_questions_metadata
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.roll = 'Admin'
        )
    );

-- exam_trend_analysis テーブル
ALTER TABLE exam_trend_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exam_trend_analysis_select" ON exam_trend_analysis
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "exam_trend_analysis_admin_all" ON exam_trend_analysis
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.roll = 'Admin'
        )
    );

-- content_recommendations テーブル
ALTER TABLE content_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_recommendations_select" ON content_recommendations
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "content_recommendations_admin_all" ON content_recommendations
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.roll = 'Admin'
        )
    );

-- learning_test_mapping_extended テーブル
ALTER TABLE learning_test_mapping_extended ENABLE ROW LEVEL SECURITY;

CREATE POLICY "learning_test_mapping_extended_select" ON learning_test_mapping_extended
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "learning_test_mapping_extended_admin_all" ON learning_test_mapping_extended
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.roll = 'Admin'
        )
    );

-- 関数: 重要度スコア計算
CREATE OR REPLACE FUNCTION calculate_importance_score(
    frequency_score DECIMAL,
    difficulty_score DECIMAL,
    recency_score DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
    -- 重み付け: 出題頻度40% + 難易度30% + 最新性30%
    RETURN (frequency_score * 0.4 + difficulty_score * 0.3 + recency_score * 0.3);
END;
$$ LANGUAGE plpgsql;

-- 関数: 最新性スコア計算（年度が新しいほど高スコア）
CREATE OR REPLACE FUNCTION calculate_recency_score(
    exam_year INTEGER,
    current_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
) RETURNS DECIMAL AS $$
BEGIN
    -- 過去5年間を基準にスコア化（1.0-0.2）
    RETURN GREATEST(0.2, 1.0 - (current_year - exam_year) * 0.2);
END;
$$ LANGUAGE plpgsql;

-- 関数: コンテンツギャップ分析
CREATE OR REPLACE FUNCTION analyze_content_gaps()
RETURNS TABLE (
    subject_category VARCHAR,
    sub_category VARCHAR,
    total_questions INTEGER,
    covered_questions INTEGER,
    coverage_percentage DECIMAL,
    gap_priority INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH question_counts AS (
        SELECT
            eq.subject_category,
            COALESCE(eq.sub_category, 'その他') as sub_category,
            COUNT(*) as total_questions,
            COUNT(ltm.learning_content_id) as covered_questions
        FROM exam_questions_metadata eq
        LEFT JOIN learning_test_mapping_extended ltm ON eq.id = ltm.exam_question_id
        GROUP BY eq.subject_category, COALESCE(eq.sub_category, 'その他')
    )
    SELECT
        qc.subject_category,
        qc.sub_category,
        qc.total_questions,
        qc.covered_questions,
        ROUND((qc.covered_questions::DECIMAL / qc.total_questions * 100), 2) as coverage_percentage,
        -- ギャップ優先度（問題数が多く、カバレッジが低いほど高優先度）
        CASE
            WHEN qc.covered_questions::DECIMAL / qc.total_questions < 0.3 THEN 10
            WHEN qc.covered_questions::DECIMAL / qc.total_questions < 0.5 THEN 8
            WHEN qc.covered_questions::DECIMAL / qc.total_questions < 0.7 THEN 6
            WHEN qc.covered_questions::DECIMAL / qc.total_questions < 0.9 THEN 4
            ELSE 2
        END as gap_priority
    FROM question_counts qc
    ORDER BY gap_priority DESC, qc.total_questions DESC;
END;
$$ LANGUAGE plpgsql;

-- トリガー: updated_at自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_exam_questions_metadata_updated_at
    BEFORE UPDATE ON exam_questions_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_recommendations_updated_at
    BEFORE UPDATE ON content_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_test_mapping_extended_updated_at
    BEFORE UPDATE ON learning_test_mapping_extended
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 初期データ挿入（科目カテゴリ用のサンプル分析データ）
INSERT INTO exam_trend_analysis (analysis_date, subject_category, question_count, avg_difficulty, frequency_trend, importance_rank, trend_score, analysis_notes)
VALUES
    ('2025-06-21', '航法', 0, 0.0, 'stable', 1, 0.0, '初期設定 - データ投入待ち'),
    ('2025-06-21', '航空法規', 0, 0.0, 'stable', 2, 0.0, '初期設定 - データ投入待ち'),
    ('2025-06-21', '気象', 0, 0.0, 'stable', 3, 0.0, '初期設定 - データ投入待ち'),
    ('2025-06-21', '機体', 0, 0.0, 'stable', 4, 0.0, '初期設定 - データ投入待ち'),
    ('2025-06-21', '通信', 0, 0.0, 'stable', 5, 0.0, '初期設定 - データ投入待ち'),
    ('2025-06-21', '空港・管制', 0, 0.0, 'stable', 6, 0.0, '初期設定 - データ投入待ち'),
    ('2025-06-21', '航空工学', 0, 0.0, 'stable', 7, 0.0, '初期設定 - データ投入待ち'),
    ('2025-06-21', '飛行理論', 0, 0.0, 'stable', 8, 0.0, '初期設定 - データ投入待ち')
ON CONFLICT (analysis_date, subject_category, sub_category) DO NOTHING;

-- 権限付与
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

COMMENT ON TABLE exam_questions_metadata IS 'CPL試験問題のメタデータ管理テーブル';
COMMENT ON TABLE exam_trend_analysis IS '出題傾向分析結果テーブル';
COMMENT ON TABLE content_recommendations IS '記事作成推奨事項テーブル';
COMMENT ON TABLE learning_test_mapping_extended IS '学習記事と試験問題の拡張マッピングテーブル';

COMMENT ON FUNCTION calculate_importance_score IS '重要度スコア計算関数（出題頻度×難易度×最新性）';
COMMENT ON FUNCTION calculate_recency_score IS '最新性スコア計算関数（年度による重み付け）';
COMMENT ON FUNCTION analyze_content_gaps IS 'コンテンツギャップ分析関数'; 