-- FlightAcademy 統合データベーススキーマ
-- 最終更新: 2025年8月17日
-- バージョン: v2.0

-- ===============================
-- 拡張機能のセットアップ
-- ===============================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===============================
-- 1. 基本テーブル（認証・プロファイル）
-- ===============================

-- プロフィールテーブル
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  roll TEXT DEFAULT 'Student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 学習進捗テーブル
CREATE TABLE IF NOT EXISTS public.progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  last_read_position INTEGER DEFAULT 0,
  last_read_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, content_id)
);

-- ===============================
-- 2. 学習コンテンツ管理
-- ===============================

-- 学習コンテンツテーブル
CREATE TABLE IF NOT EXISTS public.learning_contents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  sub_category TEXT,  -- タグ機能用
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  parent_id TEXT REFERENCES learning_contents(id),
  content_type TEXT NOT NULL DEFAULT 'article',
  is_published BOOLEAN DEFAULT true,
  is_freemium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===============================
-- 3. クイズ・テストシステム
-- ===============================

-- 問題カテゴリテーブル
CREATE TABLE IF NOT EXISTS public.question_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- カードデッキテーブル
CREATE TABLE IF NOT EXISTS public.card_decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.question_categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 問題テーブル
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES public.card_decks(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options TEXT[] NOT NULL,
    correct_option_index SMALLINT NOT NULL CHECK (correct_option_index >= 0 AND correct_option_index <= 3),
    explanation TEXT,
    explanation_image_url TEXT,
    difficulty_level TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 統一CPL問題テーブル
CREATE TABLE IF NOT EXISTS public.unified_cpl_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    main_subject VARCHAR(100) NOT NULL,
    sub_subject VARCHAR(100),
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer VARCHAR(10) NOT NULL,
    explanation TEXT,
    difficulty_level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===============================
-- 4. 学習記録・進捗管理
-- ===============================

-- 学習記録テーブル
CREATE TABLE IF NOT EXISTS public.learning_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    attempt_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time_ms INTEGER,
    marked_status TEXT CHECK (marked_status IN ('checked', 'unknown')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 学習セッション記録テーブル
CREATE TABLE IF NOT EXISTS public.learning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- セッション情報
    session_type VARCHAR(20) NOT NULL CHECK (
        session_type IN ('reading', 'testing', 'review', 'practice')
    ),
    content_id VARCHAR(100),
    content_type VARCHAR(20) CHECK (
        content_type IN ('article', 'test', 'quiz', 'review')
    ),

    -- セッション詳細
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    duration_minutes INTEGER GENERATED ALWAYS AS (ROUND(duration_seconds / 60.0)) STORED,

    -- パフォーマンスデータ
    completion_rate DECIMAL(5,2),
    accuracy_rate DECIMAL(5,2),
    comprehension_score DECIMAL(5,2),
    engagement_score DECIMAL(5,2) DEFAULT 0.0,

    -- メタデータ
    session_metadata JSONB DEFAULT '{}',
    learning_path_id UUID,

    -- タイムスタンプ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ユーザー学習プロファイルテーブル
CREATE TABLE IF NOT EXISTS public.user_learning_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- 学習プロファイル
    learning_style VARCHAR(50) DEFAULT 'visual',
    preferred_difficulty VARCHAR(20) DEFAULT 'medium',
    study_time_preference INTEGER DEFAULT 30,

    -- 学習統計
    total_study_time INTEGER DEFAULT 0,
    articles_completed INTEGER DEFAULT 0,
    tests_completed INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0.0,

    -- 学習目標
    target_exam_date DATE,
    target_score INTEGER DEFAULT 80,
    weekly_study_goal INTEGER DEFAULT 300,

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
-- 5. SRS（間隔反復学習）システム
-- ===============================

-- ユーザー問題SRS状態テーブル
CREATE TABLE IF NOT EXISTS public.user_question_srs_status (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    next_review_date TIMESTAMP WITH TIME ZONE,
    interval_days INTEGER DEFAULT 1,
    ease_factor REAL DEFAULT 2.5,
    repetitions INTEGER DEFAULT 0,
    last_attempt_record_id UUID REFERENCES public.learning_records(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, question_id)
);

-- 統一CPL問題SRS状態テーブル
CREATE TABLE IF NOT EXISTS public.user_unified_srs_status (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    unified_question_id UUID NOT NULL REFERENCES public.unified_cpl_questions(id) ON DELETE CASCADE,
    next_review_date TIMESTAMP WITH TIME ZONE,
    interval_days INTEGER DEFAULT 1,
    ease_factor REAL DEFAULT 2.5,
    repetitions INTEGER DEFAULT 0,
    last_attempt_date TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY (user_id, unified_question_id)
);

-- ===============================
-- 6. 学習・テスト連携システム
-- ===============================

-- 学習テストマッピングテーブル
CREATE TABLE IF NOT EXISTS public.learning_test_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 学習記事情報
    learning_content_id VARCHAR(100) NOT NULL,
    content_title VARCHAR(255),
    content_category VARCHAR(100),

    -- テスト問題情報
    test_question_ids TEXT[],
    unified_cpl_question_ids UUID[],
    topic_category VARCHAR(100),
    subject_area VARCHAR(100),

    -- 連携メタデータ
    relationship_type VARCHAR(20) DEFAULT 'related' CHECK (
        relationship_type IN ('direct', 'related', 'prerequisite', 'practice', 'review')
    ),
    weight_score DECIMAL(3,2) DEFAULT 1.0,
    difficulty_level INTEGER DEFAULT 3 CHECK (difficulty_level BETWEEN 1 AND 5),
    estimated_study_time INTEGER DEFAULT 30,

    -- 品質管理
    mapping_source VARCHAR(20) DEFAULT 'manual' CHECK (
        mapping_source IN ('manual', 'auto', 'ai_generated', 'expert_reviewed')
    ),
    confidence_score DECIMAL(3,2) DEFAULT 0.8,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (
        verification_status IN ('pending', 'verified', 'needs_review', 'deprecated')
    ),

    -- タイムスタンプ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

    -- インデックス制約
    UNIQUE(learning_content_id, topic_category, relationship_type)
);

-- 弱点分析テーブル
CREATE TABLE IF NOT EXISTS public.user_weak_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- 弱点領域
    subject_category VARCHAR(100) NOT NULL,
    sub_category VARCHAR(100),
    topic_keywords TEXT[],

    -- 分析データ
    accuracy_rate DECIMAL(5,2) NOT NULL,
    attempt_count INTEGER DEFAULT 0,
    last_attempt_date TIMESTAMP WITH TIME ZONE,
    improvement_trend VARCHAR(20) DEFAULT 'stable' CHECK (
        improvement_trend IN ('improving', 'stable', 'declining')
    ),

    -- 優先度
    priority_level INTEGER DEFAULT 5 CHECK (priority_level BETWEEN 1 AND 10),

    -- タイムスタンプ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

    -- 制約
    UNIQUE(user_id, subject_category)
);

-- ===============================
-- 7. テスト結果管理
-- ===============================

-- クイズセッションテーブル
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_type VARCHAR(20) NOT NULL CHECK (
        session_type IN ('practice', 'exam', 'review')
    ),
    subject VARCHAR(100),
    sub_subject VARCHAR(100),
    question_count INTEGER NOT NULL,
    correct_count INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ユーザーテスト結果テーブル
CREATE TABLE IF NOT EXISTS public.user_test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
    question_id UUID,
    unified_question_id UUID REFERENCES public.unified_cpl_questions(id),
    learning_content_id VARCHAR(100),
    selected_answer VARCHAR(10),
    is_correct BOOLEAN NOT NULL,
    response_time_ms INTEGER,
    session_type VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===============================
-- 8. ソーシャル機能
-- ===============================

-- 学習コンテンツ閲覧記録テーブル
CREATE TABLE IF NOT EXISTS public.learning_content_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(content_id, session_id)
);

-- 学習コンテンツいいねテーブル
CREATE TABLE IF NOT EXISTS public.learning_content_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_user_like UNIQUE(content_id, user_id),
  CONSTRAINT unique_session_like UNIQUE(content_id, session_id)
);

-- 学習コンテンツコメントテーブル
CREATE TABLE IF NOT EXISTS public.learning_content_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===============================
-- 9. ビュー・インデックス
-- ===============================

-- マッピング問題ビュー
CREATE OR REPLACE VIEW public.v_mapped_questions AS
SELECT
    ltm.learning_content_id,
    ltm.content_title,
    ltm.topic_category,
    ltm.subject_area,
    ucq.id as question_id,
    ucq.question_text,
    ucq.options,
    ucq.correct_answer,
    ucq.explanation,
    ucq.difficulty_level
FROM learning_test_mapping ltm
JOIN unnest(ltm.unified_cpl_question_ids) WITH ORDINALITY AS qid(question_id, ord) ON true
JOIN unified_cpl_questions ucq ON ucq.id = qid.question_id
WHERE ltm.verification_status = 'verified';

-- セキュリティ: ビューは呼び出し元権限で実行（RLSを尊重）
ALTER VIEW public.v_mapped_questions SET (security_invoker = on);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_learning_contents_category ON learning_contents(category);
CREATE INDEX IF NOT EXISTS idx_learning_contents_sub_category ON learning_contents(sub_category);
CREATE INDEX IF NOT EXISTS idx_learning_contents_published ON learning_contents(is_published);
CREATE INDEX IF NOT EXISTS idx_learning_test_mapping_content_id ON learning_test_mapping(learning_content_id);
CREATE INDEX IF NOT EXISTS idx_learning_test_mapping_topic ON learning_test_mapping(topic_category);
CREATE INDEX IF NOT EXISTS idx_user_unified_srs_next_review ON user_unified_srs_status(next_review_date);
CREATE INDEX IF NOT EXISTS idx_user_test_results_user_id ON user_test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_content_views_content_id ON learning_content_views(content_id);
CREATE INDEX IF NOT EXISTS idx_learning_content_likes_content_id ON learning_content_likes(content_id);

-- ===============================
-- 10. RLSポリシー設定
-- ===============================

-- 基本テーブルのRLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_contents ENABLE ROW LEVEL SECURITY;

-- プロフィールポリシー
CREATE POLICY "プロフィールの閲覧は自分のみ" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "プロフィールの更新は自分のみ" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "プロフィールの作成は認証済みユーザーのみ" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 進捗ポリシー
CREATE POLICY "進捗の閲覧は自分のみ" ON public.progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "進捗の更新は自分のみ" ON public.progress
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "進捗の作成は自分のみ" ON public.progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "進捗の削除は自分のみ" ON public.progress
  FOR DELETE USING (auth.uid() = user_id);

-- 学習コンテンツポリシー
CREATE POLICY "学習コンテンツ閲覧許可" ON learning_contents
  FOR SELECT USING (true);
CREATE POLICY "学習コンテンツ管理許可（教師）" ON learning_contents
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE roll = 'Teacher'
    )
  );

-- ソーシャル機能ポリシー
ALTER TABLE public.learning_content_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_content_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_content_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "閲覧記録一覧は全ユーザーが閲覧可能" ON public.learning_content_views
  FOR SELECT USING (true);
CREATE POLICY "閲覧記録は全ユーザーが追加可能" ON public.learning_content_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "いいね一覧は全ユーザーが閲覧可能" ON public.learning_content_likes
  FOR SELECT USING (true);
CREATE POLICY "いいねは全ユーザーが追加可能" ON public.learning_content_likes
  FOR INSERT WITH CHECK (true);
CREATE POLICY "いいねはログインユーザーが自分のもののみ削除可能" ON public.learning_content_likes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "コメント一覧は全ユーザーが閲覧可能" ON public.learning_content_comments
  FOR SELECT USING (true);
CREATE POLICY "コメントは認証済みユーザーのみ投稿可能" ON public.learning_content_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "コメントは自分のもののみ更新可能" ON public.learning_content_comments
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "コメントは自分のもののみ削除可能" ON public.learning_content_comments
  FOR DELETE USING (auth.uid() = user_id);

-- ===============================
-- 11. トリガー・関数
-- ===============================

-- プロフィール作成トリガー
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, full_name, avatar_url, roll)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'roll', 'Student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 更新日時自動更新関数
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー設定
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 更新日時トリガー
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER update_learning_content_comments_updated_at
    BEFORE UPDATE ON public.learning_content_comments
    FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER update_user_learning_profiles_updated_at
    BEFORE UPDATE ON public.user_learning_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- ===============================
-- 12. 初期データ投入
-- ===============================

-- 既存ユーザーの学習プロファイル作成
INSERT INTO user_learning_profiles (user_id)
SELECT id FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM user_learning_profiles
    WHERE user_learning_profiles.user_id = auth.users.id
)
ON CONFLICT (user_id) DO NOTHING;

-- システム定義カテゴリの作成
INSERT INTO question_categories (name, user_id) VALUES
('航法', NULL),
('航空法規', NULL),
('気象', NULL),
('機体', NULL),
('通信', NULL)
ON CONFLICT (name) DO NOTHING;
