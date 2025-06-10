# ロジカルプレゼンテーション記事のSupabase登録ガイド

## 概要
2.3_LogicalPresentation1.mdxと2.4_LogicalPresentation2.mdxをSupabaseのlearning_contentsテーブルに登録するための手動実行ガイドです。

## 現在の状況
- 2.2_ConcreteAbstract（思考法カテゴリ）のorder_index: 2
- 新しい記事は order_index 3, 4 として配置
- カテゴリ: 思考法

## 手順

### 1. Supabaseダッシュボードにアクセス
1. ブラウザで [https://app.supabase.io](https://app.supabase.io) にアクセス
2. FlightAcademyプロジェクト (`fstynltdfdetpyvbrswr`) を選択

### 2. SQL Editorを開く
1. 左側のメニューから「SQL Editor」を選択
2. 「New Query」ボタンをクリック

### 3. ロジカルプレゼンテーション記事登録用SQLの実行

以下のSQLをコピーして貼り付け、「Run」ボタンをクリックしてください：

```sql
-- 2.3_LogicalPresentation1と2.4_LogicalPresentation2記事をlearning_contentsテーブルに登録

-- 2.3_LogicalPresentation1記事の登録
INSERT INTO learning_contents (
  id, title, category, description, 
  order_index, parent_id, content_type, 
  is_published, is_freemium,
  created_at, updated_at
) VALUES (
  '2.3_LogicalPresentation1', 
  '【ロジカル思考術】その１、天気図を「読む」な！「語れ」！！', 
  '思考法', 
  'So what?とWhy so?の基本的な考え方を浪速のゾウさんが解説',
  3, 
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
  updated_at = NOW();

-- 2.4_LogicalPresentation2記事の登録
INSERT INTO learning_contents (
  id, title, category, description, 
  order_index, parent_id, content_type, 
  is_published, is_freemium,
  created_at, updated_at
) VALUES (
  '2.4_LogicalPresentation2', 
  '【ロジカル思考術】その２、「だから何？」でブリーフィングを制す！', 
  '思考法', 
  '縦の論理の構築方法と具体⇔抽象の往復思考について',
  4, 
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
  updated_at = NOW();

-- 登録結果の確認
SELECT id, title, category, order_index, created_at 
FROM learning_contents 
WHERE category = '思考法' 
ORDER BY order_index;
```

### 4. 実行確認
SQLの実行が完了したら、結果セクションに以下のような表示が出ることを確認してください：

```
id                           title                                                  category  order_index  created_at
2.1_Thinking                【悩みと考える】たったこれだけの違いで、人生って結構変わる話。  思考法      1           ...
2.2_ConcreteAbstract        【具体と抽象】記憶のモヤモヤ、ワシがバッサリ斬ったるわ！     思考法      2           ...
2.3_LogicalPresentation1    【ロジカル思考術】その１、天気図を「読む」な！「語れ」！！   思考法      3           ...
2.4_LogicalPresentation2    【ロジカル思考術】その２、「だから何？」でブリーフィングを制す！ 思考法      4           ...
```

### 5. フロントエンドでの確認
1. アプリケーションのLearningページにアクセス
2. 思考法カテゴリを確認
3. 2.2記事の次に2.3、2.4記事が表示されることを確認

## 記事の詳細情報

### 2.3_LogicalPresentation1
- **タイトル**: 【ロジカル思考術】その１、天気図を「読む」な！「語れ」！！
- **カテゴリ**: 思考法
- **order_index**: 3
- **内容**: 浪速のゾウさんによるSo what?とWhy so?の基本的な考え方の解説

### 2.4_LogicalPresentation2
- **タイトル**: 【ロジカル思考術】その２、「だから何？」でブリーフィングを制す！
- **カテゴリ**: 思考法
- **order_index**: 4
- **内容**: 縦の論理の構築方法と具体⇔抽象の往復思考についての詳細解説

## 注意事項
- ON CONFLICT句により、既に存在する場合は更新されます
- created_atは初回のみ設定され、更新時はupdated_atのみ更新されます
- is_published = true により、記事は即座に公開状態になります
- is_freemium = true により、フリーミアムユーザーも閲覧可能です

## トラブルシューティング
- エラーが発生した場合は、SQLの構文を再確認してください
- 権限エラーが発生した場合は、プロジェクトの管理者権限を確認してください
- データが表示されない場合は、アプリケーションのキャッシュをクリアしてみてください 