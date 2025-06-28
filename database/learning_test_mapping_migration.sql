-- Learning-Test連携システム用データベーススキーマ
-- Phase 1: 基本連携機能実装

-- ===============================
-- 1. 学習記事とテスト問題のマッピングテーブル
-- ===============================
CREATE TABLE IF NOT EXISTS public.learning_test_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 学習記事情報
    learning_content_id VARCHAR(100) NOT NULL,
    content_title VARCHAR(255),
    content_category VARCHAR(100),
    
    -- テスト問題情報
    test_question_ids TEXT[],                   -- CPL問題ID配列
    unified_cpl_question_ids UUID[],            -- unified_cpl_questions参照
    topic_category VARCHAR(100),                -- 科目カテゴリ
    subject_area VARCHAR(100),                  -- 詳細分野
    
    -- 連携メタデータ
    relationship_type VARCHAR(20) DEFAULT 'related' CHECK (
        relationship_type IN ('direct', 'related', 'prerequisite', 'practice', 'review')
    ),
    weight_score DECIMAL(3,2) DEFAULT 1.0,     -- 関連度重み (0.0-1.0)
    difficulty_level INTEGER DEFAULT 3 CHECK (difficulty_level BETWEEN 1 AND 5),
    estimated_study_time INTEGER DEFAULT 30,    -- 推定学習時間(分)
    
    -- 品質管理
    mapping_source VARCHAR(20) DEFAULT 'manual' CHECK (
        mapping_source IN ('manual', 'auto', 'ai_generated', 'expert_reviewed')
    ),
    confidence_score DECIMAL(3,2) DEFAULT 0.8, -- 信頼度スコア
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (
        verification_status IN ('pending', 'verified', 'needs_review', 'deprecated')
    ),
    
    -- タイムスタンプ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- インデックス制約
    UNIQUE(learning_content_id, topic_category, relationship_type)
);

-- ===============================
-- 2. 学習セッション記録テーブル（拡張）
-- ===============================
CREATE TABLE IF NOT EXISTS public.learning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- セッション情報
    session_type VARCHAR(20) NOT NULL CHECK (
        session_type IN ('reading', 'testing', 'review', 'practice')
    ),
    content_id VARCHAR(100),                    -- 学習記事ID or テスト問題ID
    content_type VARCHAR(20) CHECK (
        content_type IN ('article', 'test', 'quiz', 'review')
    ),
    
    -- セッション詳細
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- パフォーマンスデータ
    completion_rate DECIMAL(5,2),              -- 完了率 (0-100%)
    accuracy_rate DECIMAL(5,2),                -- 正答率 (0-100%)
    comprehension_score DECIMAL(5,2),          -- 理解度スコア (0-100%)
    
    -- メタデータ
    session_metadata JSONB DEFAULT '{}',       -- セッション固有データ
    learning_path_id UUID,                     -- 学習パス参照
    
    -- タイムスタンプ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===============================
-- 3. 弱点分析テーブル
-- ===============================
CREATE TABLE IF NOT EXISTS public.user_weak_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- 弱点領域
    subject_category VARCHAR(100) NOT NULL,
    sub_category VARCHAR(100),
    topic_keywords TEXT[],
    
    -- 分析データ
    accuracy_rate DECIMAL(5,2) NOT NULL,       -- 正答率
    attempt_count INTEGER DEFAULT 0,           -- 挑戦回数
    last_attempt_date TIMESTAMP WITH TIME ZONE,
    improvement_trend VARCHAR(20) DEFAULT 'stable' CHECK (
        improvement_trend IN ('improving', 'stable', 'declining')
    ),
    
    -- 推奨アクション
    recommended_content_ids TEXT[],
    recommended_study_time INTEGER,             -- 推奨学習時間(分)
    priority_level INTEGER DEFAULT 3 CHECK (priority_level BETWEEN 1 AND 5),
    
    -- タイムスタンプ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- 制約
    UNIQUE(user_id, subject_category, sub_category)
);

-- ===============================
-- 4. 学習推奨エンジンテーブル
-- ===============================
CREATE TABLE IF NOT EXISTS public.learning_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- 推奨内容
    recommended_content_id VARCHAR(100) NOT NULL,
    content_type VARCHAR(20) NOT NULL CHECK (
        content_type IN ('article', 'test', 'quiz', 'review')
    ),
    recommendation_reason TEXT,
    
    -- 推奨メタデータ
    priority_score DECIMAL(5,2) DEFAULT 5.0,   -- 優先度 (1-10)
    estimated_impact DECIMAL(5,2),             -- 予想効果 (0-100%)
    estimated_time INTEGER,                    -- 推定所要時間(分)
    difficulty_match DECIMAL(3,2),             -- 難易度適合度 (0-1)
    
    -- 推奨状態
    status VARCHAR(20) DEFAULT 'active' CHECK (
        status IN ('active', 'completed', 'skipped', 'expired')
    ),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- 推奨エンジン情報
    algorithm_version VARCHAR(20) DEFAULT 'v1.0',
    confidence_level DECIMAL(3,2) DEFAULT 0.7,
    
    -- タイムスタンプ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===============================
-- インデックス作成
-- ===============================
CREATE INDEX IF NOT EXISTS idx_learning_test_mapping_content ON learning_test_mapping(learning_content_id);
CREATE INDEX IF NOT EXISTS idx_learning_test_mapping_category ON learning_test_mapping(topic_category);
CREATE INDEX IF NOT EXISTS idx_learning_test_mapping_relationship ON learning_test_mapping(relationship_type);
CREATE INDEX IF NOT EXISTS idx_learning_test_mapping_weight ON learning_test_mapping(weight_score DESC);

CREATE INDEX IF NOT EXISTS idx_learning_sessions_user ON learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_content ON learning_sessions(content_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_type ON learning_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_date ON learning_sessions(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_weak_areas_user ON user_weak_areas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_weak_areas_category ON user_weak_areas(subject_category);
CREATE INDEX IF NOT EXISTS idx_user_weak_areas_priority ON user_weak_areas(priority_level DESC);

CREATE INDEX IF NOT EXISTS idx_learning_recommendations_user ON learning_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_recommendations_status ON learning_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_learning_recommendations_priority ON learning_recommendations(priority_score DESC);

-- ===============================
-- RLSポリシー設定
-- ===============================

-- learning_test_mapping テーブル
ALTER TABLE learning_test_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "学習テストマッピング閲覧は全ユーザー" ON learning_test_mapping
    FOR SELECT USING (true);

CREATE POLICY "学習テストマッピング管理は管理者のみ" ON learning_test_mapping
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.roll IN ('Admin', 'Teacher')
        )
    );

-- learning_sessions テーブル
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "学習セッションは自分のもののみ" ON learning_sessions
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- user_weak_areas テーブル
ALTER TABLE user_weak_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "弱点分析は自分のもののみ" ON user_weak_areas
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- learning_recommendations テーブル
ALTER TABLE learning_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "学習推奨は自分のもののみ" ON learning_recommendations
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ===============================
-- 関数作成
-- ===============================

-- 学習セッション自動終了
CREATE OR REPLACE FUNCTION end_learning_session(session_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE learning_sessions
    SET 
        ended_at = now(),
        duration_seconds = EXTRACT(EPOCH FROM (now() - started_at))::INTEGER,
        updated_at = now()
    WHERE id = session_id AND ended_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 弱点分析更新
CREATE OR REPLACE FUNCTION update_user_weak_areas(
    p_user_id UUID,
    p_subject_category VARCHAR,
    p_accuracy_rate DECIMAL,
    p_sub_category VARCHAR DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO user_weak_areas (
        user_id, subject_category, sub_category, accuracy_rate, 
        attempt_count, last_attempt_date, updated_at
    )
    VALUES (
        p_user_id, p_subject_category, p_sub_category, p_accuracy_rate,
        1, now(), now()
    )
    ON CONFLICT (user_id, subject_category, sub_category)
    DO UPDATE SET
        accuracy_rate = (user_weak_areas.accuracy_rate * user_weak_areas.attempt_count + EXCLUDED.accuracy_rate) / (user_weak_areas.attempt_count + 1),
        attempt_count = user_weak_areas.attempt_count + 1,
        last_attempt_date = now(),
        improvement_trend = CASE
            WHEN EXCLUDED.accuracy_rate > user_weak_areas.accuracy_rate THEN 'improving'
            WHEN EXCLUDED.accuracy_rate < user_weak_areas.accuracy_rate THEN 'declining'
            ELSE 'stable'
        END,
        updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 自動更新トリガー
CREATE TRIGGER update_learning_test_mapping_updated_at
    BEFORE UPDATE ON learning_test_mapping
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_learning_sessions_updated_at
    BEFORE UPDATE ON learning_sessions
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_user_weak_areas_updated_at
    BEFORE UPDATE ON user_weak_areas
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_learning_recommendations_updated_at
    BEFORE UPDATE ON learning_recommendations
    FOR EACH ROW EXECUTE FUNCTION update_modified_column(); 