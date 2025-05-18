-- FlightAcademy用のスキーマ定義とRLSポリシー設定

-- 拡張機能のセットアップ
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- RLSポリシーの設定

-- テーブルの保護を有効化
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- profiles テーブルのポリシー
-- 1. 認証済みユーザーは自分のプロフィールのみ閲覧可能
CREATE POLICY "プロフィールの閲覧は自分のみ" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- 2. 認証済みユーザーは自分のプロフィールのみ更新可能
CREATE POLICY "プロフィールの更新は自分のみ" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 3. 新規ユーザーはプロフィールを作成可能
CREATE POLICY "プロフィールの作成は認証済みユーザーのみ" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- progress テーブルのポリシー
-- 1. 認証済みユーザーは自分の進捗のみ閲覧可能
CREATE POLICY "進捗の閲覧は自分のみ" ON public.progress
  FOR SELECT USING (auth.uid() = user_id);

-- 2. 認証済みユーザーは自分の進捗のみ更新可能
CREATE POLICY "進捗の更新は自分のみ" ON public.progress
  FOR UPDATE USING (auth.uid() = user_id);

-- 3. 認証済みユーザーは自分の進捗のみ作成可能
CREATE POLICY "進捗の作成は自分のみ" ON public.progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. 認証済みユーザーは自分の進捗のみ削除可能
CREATE POLICY "進捗の削除は自分のみ" ON public.progress
  FOR DELETE USING (auth.uid() = user_id);

-- プロフィール作成トリガー
-- ユーザー登録時に自動的にプロフィールを作成
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

-- トリガーを設定
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- プロフィールの更新日時を自動的に更新するトリガー
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- プロフィールの更新日時トリガー
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- 進捗の更新日時トリガー
DROP TRIGGER IF EXISTS update_progress_updated_at ON public.progress;
CREATE TRIGGER update_progress_updated_at
  BEFORE UPDATE ON public.progress
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_column(); 