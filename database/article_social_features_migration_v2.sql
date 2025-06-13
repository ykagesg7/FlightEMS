-- 記事のソーシャル機能用テーブル作成マイグレーション v2
-- 匿名ユーザー対応と閲覧数専用テーブルを追加

-- 学習コンテンツの閲覧記録テーブル（匿名ユーザー対応）
CREATE TABLE IF NOT EXISTS public.learning_content_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULLの場合は匿名ユーザー
  session_id TEXT, -- 匿名ユーザーのセッション識別用
  ip_address INET, -- IPアドレス（重複防止用）
  user_agent TEXT, -- ユーザーエージェント
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- 同一セッション・同一コンテンツの重複防止
  UNIQUE(content_id, session_id)
);

-- 学習コンテンツのいいね機能テーブル（匿名ユーザー対応）
CREATE TABLE IF NOT EXISTS public.learning_content_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULLの場合は匿名ユーザー
  session_id TEXT, -- 匿名ユーザーのセッション識別用
  ip_address INET, -- IPアドレス
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- ログインユーザーまたは匿名ユーザーの重複防止
  CONSTRAINT unique_user_like UNIQUE(content_id, user_id),
  CONSTRAINT unique_session_like UNIQUE(content_id, session_id)
);

-- 学習コンテンツのコメント機能テーブル（ログインユーザーのみ）
CREATE TABLE IF NOT EXISTS public.learning_content_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- コメントはログイン必須
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLSポリシーの設定

-- learning_content_views テーブルの保護を有効化
ALTER TABLE public.learning_content_views ENABLE ROW LEVEL SECURITY;

-- learning_content_likes テーブルの保護を有効化
ALTER TABLE public.learning_content_likes ENABLE ROW LEVEL SECURITY;

-- learning_content_comments テーブルの保護を有効化
ALTER TABLE public.learning_content_comments ENABLE ROW LEVEL SECURITY;

-- learning_content_views テーブルのポリシー
-- 1. 全ユーザーが閲覧記録一覧を閲覧可能
CREATE POLICY "閲覧記録一覧は全ユーザーが閲覧可能" ON public.learning_content_views
  FOR SELECT USING (true);

-- 2. 全ユーザーが閲覧記録を追加可能（匿名含む）
CREATE POLICY "閲覧記録は全ユーザーが追加可能" ON public.learning_content_views
  FOR INSERT WITH CHECK (true);

-- learning_content_likes テーブルのポリシー
-- 1. 全ユーザーがいいね一覧を閲覧可能
CREATE POLICY "いいね一覧は全ユーザーが閲覧可能" ON public.learning_content_likes
  FOR SELECT USING (true);

-- 2. 全ユーザーがいいねを追加可能（匿名含む）
CREATE POLICY "いいねは全ユーザーが追加可能" ON public.learning_content_likes
  FOR INSERT WITH CHECK (true);

-- 3. ログインユーザーは自分のいいねのみ削除可能
CREATE POLICY "いいねはログインユーザーが自分のもののみ削除可能" ON public.learning_content_likes
  FOR DELETE USING (auth.uid() = user_id);

-- 4. 匿名ユーザーは同一セッションのいいねのみ削除可能（セッション管理用）
CREATE POLICY "匿名いいねは同一セッションのみ削除可能" ON public.learning_content_likes
  FOR DELETE USING (auth.uid() IS NULL AND session_id IS NOT NULL);

-- learning_content_comments テーブルのポリシー
-- 1. 全ユーザーがコメント一覧を閲覧可能
CREATE POLICY "コメント一覧は全ユーザーが閲覧可能" ON public.learning_content_comments
  FOR SELECT USING (true);

-- 2. 認証済みユーザーのみコメントを投稿可能
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
CREATE INDEX IF NOT EXISTS idx_learning_content_views_content_id ON public.learning_content_views(content_id);
CREATE INDEX IF NOT EXISTS idx_learning_content_views_session_id ON public.learning_content_views(session_id);
CREATE INDEX IF NOT EXISTS idx_learning_content_views_created_at ON public.learning_content_views(created_at);

CREATE INDEX IF NOT EXISTS idx_learning_content_likes_content_id ON public.learning_content_likes(content_id);
CREATE INDEX IF NOT EXISTS idx_learning_content_likes_user_id ON public.learning_content_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_content_likes_session_id ON public.learning_content_likes(session_id);

CREATE INDEX IF NOT EXISTS idx_learning_content_comments_content_id ON public.learning_content_comments(content_id);
CREATE INDEX IF NOT EXISTS idx_learning_content_comments_user_id ON public.learning_content_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_content_comments_created_at ON public.learning_content_comments(created_at);

-- 統計取得用のビュー（パフォーマンス向上）
CREATE OR REPLACE VIEW public.learning_content_stats AS
SELECT 
  content_id,
  COUNT(DISTINCT CASE WHEN lcv.id IS NOT NULL THEN 
    COALESCE(lcv.user_id::text, lcv.session_id) 
  END) as views_count,
  COUNT(DISTINCT CASE WHEN lcl.id IS NOT NULL THEN 
    COALESCE(lcl.user_id::text, lcl.session_id) 
  END) as likes_count,
  COUNT(DISTINCT lcc.id) as comments_count
FROM (
  SELECT DISTINCT content_id 
  FROM learning_content_views 
  UNION 
  SELECT DISTINCT content_id 
  FROM learning_content_likes 
  UNION 
  SELECT DISTINCT content_id 
  FROM learning_content_comments
) AS all_content
LEFT JOIN learning_content_views lcv ON all_content.content_id = lcv.content_id
LEFT JOIN learning_content_likes lcl ON all_content.content_id = lcl.content_id
LEFT JOIN learning_content_comments lcc ON all_content.content_id = lcc.content_id
GROUP BY content_id; 