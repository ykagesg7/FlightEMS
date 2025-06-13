-- 記事のソーシャル機能用テーブル作成マイグレーション
-- learning_content_likes と learning_content_comments テーブルを追加

-- 学習コンテンツのいいね機能テーブル
CREATE TABLE IF NOT EXISTS public.learning_content_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(content_id, user_id) -- 同じユーザーが同じコンテンツに複数回いいねできないように
);

-- 学習コンテンツのコメント機能テーブル
CREATE TABLE IF NOT EXISTS public.learning_content_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLSポリシーの設定

-- learning_content_likes テーブルの保護を有効化
ALTER TABLE public.learning_content_likes ENABLE ROW LEVEL SECURITY;

-- learning_content_comments テーブルの保護を有効化
ALTER TABLE public.learning_content_comments ENABLE ROW LEVEL SECURITY;

-- learning_content_likes テーブルのポリシー
-- 1. 全ユーザーがいいね一覧を閲覧可能
CREATE POLICY "いいね一覧は全ユーザーが閲覧可能" ON public.learning_content_likes
  FOR SELECT USING (true);

-- 2. 認証済みユーザーは自分のいいねのみ追加可能
CREATE POLICY "いいねは認証済みユーザーのみ追加可能" ON public.learning_content_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. 認証済みユーザーは自分のいいねのみ削除可能
CREATE POLICY "いいねは自分のもののみ削除可能" ON public.learning_content_likes
  FOR DELETE USING (auth.uid() = user_id);

-- learning_content_comments テーブルのポリシー
-- 1. 全ユーザーがコメント一覧を閲覧可能
CREATE POLICY "コメント一覧は全ユーザーが閲覧可能" ON public.learning_content_comments
  FOR SELECT USING (true);

-- 2. 認証済みユーザーはコメントを投稿可能
CREATE POLICY "コメントは認証済みユーザーのみ投稿可能" ON public.learning_content_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. 認証済みユーザーは自分のコメントのみ更新可能
CREATE POLICY "コメントは自分のもののみ更新可能" ON public.learning_content_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. 認証済みユーザーは自分のコメントのみ削除可能
CREATE POLICY "コメントは自分のもののみ削除可能" ON public.learning_content_comments
  FOR DELETE USING (auth.uid() = user_id);

-- コメントの更新日時を自動的に更新するトリガー
DROP TRIGGER IF EXISTS update_learning_content_comments_updated_at ON public.learning_content_comments;
CREATE TRIGGER update_learning_content_comments_updated_at
  BEFORE UPDATE ON public.learning_content_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- インデックスの作成（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_learning_content_likes_content_id ON public.learning_content_likes(content_id);
CREATE INDEX IF NOT EXISTS idx_learning_content_likes_user_id ON public.learning_content_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_content_comments_content_id ON public.learning_content_comments(content_id);
CREATE INDEX IF NOT EXISTS idx_learning_content_comments_user_id ON public.learning_content_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_content_comments_created_at ON public.learning_content_comments(created_at); 