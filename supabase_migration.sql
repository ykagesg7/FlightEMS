-- 既存のテーブルをバックアップ
CREATE TABLE IF NOT EXISTS learning_contents_backup AS
SELECT * FROM learning_contents;

-- 既存のテーブルの依存関係を確認
-- 関連する外部キー制約を一時的に削除
ALTER TABLE IF EXISTS learning_progress
  DROP CONSTRAINT IF EXISTS learning_progress_content_id_fkey;

-- 既存のテーブルを削除
DROP TABLE learning_contents;

-- 新しいテーブル構造でテーブルを再作成（IDをTEXT型に変更）
CREATE TABLE learning_contents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  parent_id TEXT REFERENCES learning_contents(id),
  content_type TEXT NOT NULL DEFAULT 'text',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- バックアップからデータを復元（必要に応じて型変換）
INSERT INTO learning_contents (
  id, title, category, description, 
  order_index, parent_id, content_type, 
  created_at, updated_at
)
SELECT 
  id::TEXT, title, category, description, 
  order_index, parent_id::TEXT, content_type, 
  created_at, updated_at
FROM learning_contents_backup;

-- 外部キー制約を再設定
ALTER TABLE learning_progress
  ADD CONSTRAINT learning_progress_content_id_fkey
  FOREIGN KEY (content_id) REFERENCES learning_contents(id);

-- RLSポリシーを設定
ALTER TABLE learning_contents ENABLE ROW LEVEL SECURITY;

-- すべてのユーザーがコンテンツを閲覧できるポリシー
CREATE POLICY "学習コンテンツ閲覧許可" ON learning_contents
  FOR SELECT USING (true);

-- 教師ロールのユーザーがコンテンツを管理できるポリシー
CREATE POLICY "学習コンテンツ管理許可（教師）" ON learning_contents
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE roll = 'Teacher'
    )
  );

-- 不要になったバックアップテーブルを削除（オプション）
-- DROP TABLE learning_contents_backup; 