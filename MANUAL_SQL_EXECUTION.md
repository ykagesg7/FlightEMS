# 手動でのSupabaseデータ登録手順

## 概要
RLS (Row Level Security) ポリシーにより、スクリプトからの自動挿入ができないため、Supabase SQL Editorで手動でSQLを実行する必要があります。

## 手順

### 1. Supabaseダッシュボードにアクセス
1. ブラウザで [https://app.supabase.io](https://app.supabase.io) にアクセス
2. FlightAcademyプロジェクト (`fstynltdfdetpyvbrswr`) を選択

### 2. SQL Editorを開く
1. 左側のメニューから「SQL Editor」を選択
2. 「New Query」ボタンをクリック

### 3. 1.10記事登録用SQLの実行
以下のSQLをコピーして貼り付け、「Run」ボタンをクリックしてください：

```sql
-- 1.10_GiveAndTake2記事をlearning_contentsテーブルに登録
INSERT INTO learning_contents (
  id, title, category, description, 
  order_index, parent_id, content_type, 
  is_published, is_freemium,
  created_at, updated_at
) VALUES (
  '1.10_GiveAndTake2', 
  '【GIVE&TAKE】その２、清正公の熊本よかとこラジオ～テイカー撃退の法～', 
  'メンタリティー', 
  'テイカーの特徴と対処法について学ぶ',
  10, 
  NULL, 
  'mdx',
  true, 
  true,
  NOW(), 
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  parent_id = EXCLUDED.parent_id,
  content_type = EXCLUDED.content_type,
  is_published = EXCLUDED.is_published,
  is_freemium = EXCLUDED.is_freemium,
  updated_at = NOW()
RETURNING *;
```

### 4. 実行結果の確認
SQL実行後、以下のような結果が表示されれば成功です：
```json
{
  "id": "1.10_GiveAndTake2",
  "title": "【GIVE&TAKE】その２、清正公の熊本よかとこラジオ～テイカー撃退の法～",
  "category": "メンタリティー",
  "description": "テイカーの特徴と対処法について学ぶ",
  "order_index": 10,
  "parent_id": null,
  "content_type": "mdx",
  "is_published": true,
  "is_freemium": true,
  "created_at": "2025-01-26T...",
  "updated_at": "2025-01-26T..."
}
```

### 5. 登録確認
以下のSQLで正常に登録されているか確認できます：

```sql
-- GIVE&TAKE記事の一覧を確認
SELECT id, title, order_index, is_published, is_freemium, created_at
FROM learning_contents 
WHERE title LIKE '%GIVE&TAKE%' 
ORDER BY order_index;
```

## 注意事項
- SQLを実行する際は、構文エラーがないよう注意してください
- 既に同じIDのレコードが存在する場合は、UPDATEされます
- `order_index: 10` に設定しているため、1.9記事 (order_index: 9) の次に表示されます

## エラーが発生した場合
- 構文エラー: SQLの書式を確認してください
- 権限エラー: プロジェクトの管理者権限があることを確認してください
- 制約エラー: 既存データとの整合性を確認してください

## 完了後の確認
SQL実行が完了したら、以下のコマンドで登録結果を確認できます：

```bash
node check-learning-contents.js
``` 