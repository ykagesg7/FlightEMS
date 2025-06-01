-- 4択問題システム用データベースマイグレーション
-- FlightAcademy - Quiz System Implementation
-- 実行日: 2025-06-01

-- ===============================
-- 拡張機能の確認
-- ===============================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===============================
-- 1. 問題カテゴリテーブル
-- ===============================
CREATE TABLE IF NOT EXISTS public.question_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- NULLの場合はシステム定義
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===============================
-- 2. カードデッキテーブル
-- ===============================
CREATE TABLE IF NOT EXISTS public.card_decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.question_categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===============================
-- 3. 問題テーブル
-- ===============================
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES public.card_decks(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options TEXT[] NOT NULL, -- 4つの選択肢の配列
    correct_option_index SMALLINT NOT NULL CHECK (correct_option_index >= 0 AND correct_option_index <= 3),
    explanation TEXT,
    explanation_image_url TEXT,
    difficulty_level TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===============================
-- 4. 学習記録テーブル
-- ===============================
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

-- ===============================
-- 5. SRS状態管理テーブル
-- ===============================
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

-- ===============================
-- インデックスの作成
-- ===============================
CREATE INDEX IF NOT EXISTS idx_card_decks_user_id ON public.card_decks(user_id);
CREATE INDEX IF NOT EXISTS idx_card_decks_category_id ON public.card_decks(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_deck_id ON public.questions(deck_id);
CREATE INDEX IF NOT EXISTS idx_learning_records_user_id ON public.learning_records(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_records_question_id ON public.learning_records(question_id);
CREATE INDEX IF NOT EXISTS idx_learning_records_attempt_date ON public.learning_records(attempt_date);
CREATE INDEX IF NOT EXISTS idx_srs_next_review_date ON public.user_question_srs_status(next_review_date);
CREATE INDEX IF NOT EXISTS idx_srs_user_id ON public.user_question_srs_status(user_id);

-- ===============================
-- RLSポリシーの設定
-- ===============================

-- question_categories テーブルのRLS
ALTER TABLE public.question_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "全ユーザーがカテゴリを閲覧可能" ON public.question_categories
    FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "管理者がカテゴリを管理" ON public.question_categories
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roll = 'Admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roll = 'Admin'));

CREATE POLICY IF NOT EXISTS "ユーザーが自分のカテゴリを作成" ON public.question_categories
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roll = 'Admin'));

CREATE POLICY IF NOT EXISTS "ユーザーが自分のカテゴリを更新" ON public.question_categories
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roll = 'Admin'))
    WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roll = 'Admin'));

-- card_decks テーブルのRLS
ALTER TABLE public.card_decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "全ユーザーがデッキを閲覧可能" ON public.card_decks
    FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "ユーザーが自分のデッキを管理" ON public.card_decks
    FOR ALL TO authenticated
    USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roll = 'Admin'))
    WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roll = 'Admin'));

-- questions テーブルのRLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "全ユーザーが問題を閲覧可能" ON public.questions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "デッキ所有者が問題を管理" ON public.questions
    FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM card_decks cd WHERE cd.id = deck_id AND cd.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roll = 'Admin')
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM card_decks cd WHERE cd.id = deck_id AND cd.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roll = 'Admin')
    );

-- learning_records テーブルのRLS
ALTER TABLE public.learning_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "ユーザーが自分の学習記録を閲覧" ON public.learning_records
    FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "ユーザーが自分の学習記録を作成" ON public.learning_records
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "管理者が全学習記録を閲覧" ON public.learning_records
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roll IN ('Admin', 'Teacher')));

-- user_question_srs_status テーブルのRLS
ALTER TABLE public.user_question_srs_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "ユーザーが自分のSRS状態を管理" ON public.user_question_srs_status
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "管理者が全SRS状態を閲覧" ON public.user_question_srs_status
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND roll IN ('Admin', 'Teacher')));

-- ===============================
-- 初期データの挿入
-- ===============================

-- 基本カテゴリの挿入
INSERT INTO public.question_categories (name, user_id) VALUES
    ('航法', NULL),
    ('航空法規', NULL),
    ('気象', NULL),
    ('機体', NULL),
    ('通信', NULL),
    ('空港・管制', NULL),
    ('航空工学', NULL),
    ('飛行理論', NULL)
ON CONFLICT (name) DO NOTHING;

-- ===============================
-- 更新日時自動更新のトリガー
-- ===============================

-- 更新日時自動更新関数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 各テーブルにトリガーを設定
DROP TRIGGER IF EXISTS update_question_categories_updated_at ON public.question_categories;
CREATE TRIGGER update_question_categories_updated_at
    BEFORE UPDATE ON public.question_categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_card_decks_updated_at ON public.card_decks;
CREATE TRIGGER update_card_decks_updated_at
    BEFORE UPDATE ON public.card_decks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_questions_updated_at ON public.questions;
CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON public.questions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_srs_status_updated_at ON public.user_question_srs_status;
CREATE TRIGGER update_srs_status_updated_at
    BEFORE UPDATE ON public.user_question_srs_status
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===============================
-- マイグレーション完了ログ
-- ===============================
INSERT INTO public.profiles (id, username, email, full_name, roll, created_at, updated_at)
SELECT 
    '00000000-0000-0000-0000-000000000001'::uuid,
    'system_migration',
    'system@flightacademy.com',
    'Quiz System Migration',
    'Admin',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE username = 'system_migration'
);

-- マイグレーション実行記録
COMMENT ON TABLE public.question_categories IS '4択問題システム - カテゴリ管理テーブル (v1.0 - 2024-01-30)';
COMMENT ON TABLE public.card_decks IS '4択問題システム - デッキ管理テーブル (v1.0 - 2024-01-30)';
COMMENT ON TABLE public.questions IS '4択問題システム - 問題テーブル (v1.0 - 2024-01-30)';
COMMENT ON TABLE public.learning_records IS '4択問題システム - 学習記録テーブル (v1.0 - 2024-01-30)';
COMMENT ON TABLE public.user_question_srs_status IS '4択問題システム - SRS状態管理テーブル (v1.0 - 2024-01-30)'; 