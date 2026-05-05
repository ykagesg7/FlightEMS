---
name: learning-contents-registration
description: >-
  Registers or updates PPL/CPL lesson rows in Supabase learning_contents after MDX changes.
  Use when syncing src/content/lessons to the database, learning_contents upsert,
  CPL meta SQL scripts, or register_ppl_article.mjs. Triggers: 記事登録, learning_contents, Supabase insert lesson.
disable-model-invocation: false
---

# learning_contents 登録スキル

`learning_contents` テーブルへ PPL/CPL レッスンを登録・更新するときの手順。

## 前提

- MDX のメタデータは [`.cursor/rules/mdx-article-guide.mdc`](../../../.cursor/rules/mdx-article-guide.mdc) に準拠すること。
- **Supabase MCP** が使える場合は **Settings → MCP** のサーバー名（例: `plugin-supabase-supabase`）で実行すること。

## Supabase MCP（execute_sql）

1. `project_id`: `fstynltdfdetpyvbrswr`（FlightAcademy project）
2. `query`: INSERT … ON CONFLICT DO UPDATE 形式の SQL

### 例（upsert）

```sql
INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES ('PPL-1-1-9_FlightPerformance', '【航空工学】余剰馬力の美学...', 'PPL', '航空工学', '...', 9, NULL, 'text', true, NOW())
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, sub_category = EXCLUDED.sub_category, description = EXCLUDED.description, order_index = EXCLUDED.order_index, content_type = EXCLUDED.content_type, is_published = EXCLUDED.is_published, updated_at = EXCLUDED.updated_at;
```

## フォールバック: Node スクリプト

MCP が無い場合:

```bash
node scripts/database/register_ppl_article.mjs PPL-1-1-9_FlightPerformance
```

`.env.local` に `SUPABASE_SERVICE_ROLE_KEY` が必要（anon では書けない）。

## フォールバック: SQL ファイル

Dashboard の SQL Editor で `scripts/database/*.sql` を実行。

## CPL メタ同期（冪等スクリプト）

- **航空工学 3.2.1–3.2.4**: `scripts/database/20260412_learning_contents_cpl_engineering_321_324_meta.sql`（`order_index` 340–343）
- **航空工学 3.2.5–3.2.12**: `scripts/database/20260412_learning_contents_cpl_engineering_325_332_meta.sql`（`order_index` 344–351）
- **空中航法 3.4.1–3.4.7**: `scripts/database/20260430_learning_contents_cpl_navigation_341_347_meta.sql`（`order_index` 380–386）

執筆・体裁の全体像: [`docs/09_CPL_Learning_Stub.md`](../../../docs/09_CPL_Learning_Stub.md)

## learning_contents スキーマ（要約）

| Column | PPL | CPL |
|--------|-----|-----|
| id | ファイル名（例: `PPL-1-1-9_FlightPerformance`） | ファイル名 |
| category | `PPL` | **`CPL学科`**（`PrevNextNav` と一致させる） |
| sub_category | 航空工学 等 | 科目名 |
| content_type | `text` | `text` |
| is_published | `true` | `true` |
