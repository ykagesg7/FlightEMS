# リリース前チェック（MCP / 手動）

本番またはステージングに出す前に、以下を **状況に応じて** 実施する。Cursor の MCP サーバー名はプロジェクト設定に合わせて読み替える。

## 1. Supabase（`my_supabase_project`）

| 手順 | 内容 |
|------|------|
| `list_migrations` | リモートのマイグレーション一覧を取得し、リポジトリの `scripts/database/` 正本・ローカル `supabase/migrations` と齟齬がないか確認する |
| `execute_sql` | 下記メトリクスを記録し、前回比で意図しない減少がないか見る。別環境へデータを流す場合も **`project_id` をその環境に切り替え**て、[docs/db/APPLICABLE_EXAMS_PILOT.md](../db/APPLICABLE_EXAMS_PILOT.md) の「別環境への適用（Supabase MCP）」に従い `apply_migration` / `execute_sql` で `scripts/database/` 正本を実行できる |

**推奨メトリクス SQL**（[docs/db/APPLICABLE_EXAMS_PILOT.md](../db/APPLICABLE_EXAMS_PILOT.md) と同様）:

```sql
SELECT
  COUNT(*) FILTER (WHERE applicable_exams @> ARRAY['PPL']::text[]) AS with_ppl,
  COUNT(*) AS total_verified
FROM unified_cpl_questions
WHERE verification_status = 'verified';

SELECT learning_content_id, cardinality(unified_cpl_question_ids) AS n
FROM learning_test_mapping
ORDER BY learning_content_id;
```

## 2. Vercel（`vercel`）

| 手順 | 内容 |
|------|------|
| `list_projects` | 対象プロジェクト（例: `flight-lms`）の ID を確認する |
| `get_runtime_logs` / `get_deployment_build_logs` | 直近デプロイで API やビルドに異常がないか確認する |

## 3. GitHub（`github`）

| 手順 | 内容 |
|------|------|
| `git remote -v` | `owner/repo` を確定する（MCP の `search_repositories` が使えない環境がある） |
| `list_issues` / `list_pull_requests` | 未解決のブロッカーがないか確認する |

## 4. アプリ（ローカルまたはプレビュー URL）

| 手順 | 内容 |
|------|------|
| `npm run test:run` | ユニット／コンポーネントテスト |
| `npm run test:e2e` | Playwright（`build` + `preview`、PPL `/test` と CPL スタブ記事の回帰） |
| `npm run lint` / `npm run build` | 静的解析と本番ビルド |

## 5. ブラウザ MCP（任意）

`playwright` または `chrome-devtools` で、変更した画面のネットワークエラーやコンソールエラーを確認する。

---

**記録**: リリースごとに日付・実行者・メトリクススナップショットを Notion やチケットに残すと追跡しやすい。
