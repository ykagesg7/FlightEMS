-- Learning System 修正用SQL
-- 2025年1月27日

-- ===============================
-- 1. learning_sessionsテーブル修正
-- ===============================

-- duration_minutesカラムを追加（既存のduration_secondsから計算）
ALTER TABLE learning_sessions 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER 
GENERATED ALWAYS AS (ROUND(duration_seconds / 60.0)) STORED;

-- engagement_scoreカラムを追加（comprehension_scoreのエイリアス用）
ALTER TABLE learning_sessions 
ADD COLUMN IF NOT EXISTS engagement_score DECIMAL(5,2) 
DEFAULT 0.0;

-- ===============================
-- 2. user_learning_profilesテーブル作成
-- ===============================

CREATE TABLE IF NOT EXISTS public.user_learning_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- 学習プロファイル
    learning_style VARCHAR(50) DEFAULT 'visual',
    preferred_difficulty VARCHAR(20) DEFAULT 'medium',
    study_time_preference INTEGER DEFAULT 30, -- 分
    
    -- 学習統計
    total_study_time INTEGER DEFAULT 0,      -- 総学習時間(分)
    articles_completed INTEGER DEFAULT 0,    -- 完了記事数
    tests_completed INTEGER DEFAULT 0,       -- 完了テスト数
    average_score DECIMAL(5,2) DEFAULT 0.0,  -- 平均スコア
    
    -- 学習目標
    target_exam_date DATE,
    target_score INTEGER DEFAULT 80,
    weekly_study_goal INTEGER DEFAULT 300,   -- 週間学習目標(分)
    
    -- システム設定
    notifications_enabled BOOLEAN DEFAULT true,
    email_reminders BOOLEAN DEFAULT true,
    difficulty_auto_adjust BOOLEAN DEFAULT true,
    
    -- タイムスタンプ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- 制約
    UNIQUE(user_id)
);

-- ===============================
-- 3. インデックス作成
-- ===============================

CREATE INDEX IF NOT EXISTS idx_user_learning_profiles_user 
ON user_learning_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_learning_sessions_duration_minutes 
ON learning_sessions(duration_minutes);

-- ===============================
-- 4. RLSポリシー設定
-- ===============================

ALTER TABLE user_learning_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "学習プロファイルは自分のもののみ" ON user_learning_profiles
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ===============================
-- 5. 更新トリガー
-- ===============================

CREATE TRIGGER update_user_learning_profiles_updated_at
    BEFORE UPDATE ON user_learning_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- ===============================
-- 6. 初期データ投入
-- ===============================

-- 既存ユーザーの学習プロファイル作成
INSERT INTO user_learning_profiles (user_id)
SELECT id FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM user_learning_profiles 
    WHERE user_learning_profiles.user_id = auth.users.id
)
ON CONFLICT (user_id) DO NOTHING; 