# applicable_exams パイロット（航空工学・空力の基礎理論）

**目的**: `unified_cpl_questions.applicable_exams` と `learning_test_mapping` の連携を本番で一度通す。

## マイグレーション

- 正本: [scripts/database/20260324_add_unified_cpl_applicable_exams.sql](../../scripts/database/20260324_add_unified_cpl_applicable_exams.sql)
- Supabase では MCP `apply_migration` または SQL Editor で実行。

## 別環境への適用（Supabase MCP で実行する場合）

**結論**: Cursor の **my_supabase_project** MCP から実行できます。対象は **`project_id` で選んだプロジェクト**だけが変わり、手順と SQL の正本は **常に `scripts/database/`** のままです。

| MCP ツール | 使い分け |
|------------|----------|
| **`list_projects`** | ステージング等の **Project ref（`project_id`）** を取得する |
| **`apply_migration`** | **DDL**（`ALTER TABLE`・`CREATE INDEX`・`CHECK` など）。マイグレーション履歴に残る。`name` は snake_case（例: `add_unified_cpl_applicable_exams`）、`query` に正本ファイルの本文 |
| **`execute_sql`** | **DML・データバッチ**（`UPDATE` / `INSERT` / `BEGIN`…`COMMIT` を含むスクリプト）。`20260324_pilot_…` や `20260325_batch_…` はこちらが適切 |

**実行順（空の DB／列がまだ無い場合）**

1. [20260324_add_unified_cpl_applicable_exams.sql](../../scripts/database/20260324_add_unified_cpl_applicable_exams.sql) → **`apply_migration`**（既に列がある環境ではスキップ可）
2. [20260324_pilot_ppl_tag_aviation_eng.sql](../../scripts/database/20260324_pilot_ppl_tag_aviation_eng.sql) → **`execute_sql`**
3. [20260325_batch_ppl_engineering_series_and_mapping.sql](../../scripts/database/20260325_batch_ppl_engineering_series_and_mapping.sql) → **`execute_sql`**（先頭に航空力学の PPL 付与が含まれるため、**3 を実行する場合は** [20260325_batch_ppl_aviation_mechanics.sql](../../scripts/database/20260325_batch_ppl_aviation_mechanics.sql) は不要）
4. [20260326_batch_ppl_law_navigation_comm_weather.sql](../../scripts/database/20260326_batch_ppl_law_navigation_comm_weather.sql) → **`execute_sql`**（**航空法規・空中航法・航空通信**の PPL 付与＋**航空気象**の拡張。`/test` の PPL モードで主科目5種を選べるようにする）

**前提・制限**

- MCP に紐づく **Supabase アカウント**が、その別環境プロジェクトに対する **権限**を持っていること（組織・プロジェクトが別アカウントだけの場合は、SQL Editor 手動またはそのアカウント用 MCP 設定が必要）。
- 拡張バッチは **`learning_test_mapping` に対象 `learning_content_id` の行があること**を前提に `UPDATE` する。行が無い環境では 0 行更新になる。必要なら既存の学習系マイグレーションでテーブル・行を先に用意する。
- ツール説明どおり **DDL は `execute_sql` ではなく `apply_migration`** を推奨（違反すると運用で履歴が分かりにくくなる）。

適用後は下記 **監査クエリ** を、**同じ `project_id`** で `execute_sql` し、件数を記録する。

## パイロットデータ（本番投入済みの例）

- **SQL ファイル**: [scripts/database/20260324_pilot_ppl_tag_aviation_eng.sql](../../scripts/database/20260324_pilot_ppl_tag_aviation_eng.sql)
- **内容**:
  1. `main_subject = '航空工学'` かつ `sub_subject LIKE '%空力の基礎理論%'` の verified 問題 **25 件** に `applicable_exams = {PPL,CPL}` を設定。
  2. `learning_contents.id = PPL-1-1-1_TemperatureBasics` と上記 25 問を `learning_test_mapping` で紐付け（`unified_cpl_question_ids` と `test_question_ids` の両方を設定）。

**再実行**: マッピング INSERT は `NOT EXISTS (learning_content_id = 'PPL-1-1-1_TemperatureBasics')` で二重挿入を防止。

## アプリでの確認

1. `/test` で **出題レベル「PPL 基礎のみ」**、科目「航空工学」、サブ科目に空力系を選び出題する。
2. 結果画面で **関連記事** に `PPL-1-1-1_TemperatureBasics` が出ること（`ReviewContentLink` が `unified_cpl_question_ids` を参照）。

## 拡張バッチ（2026-03-25）

| ファイル | 内容 |
|----------|------|
| [20260325_batch_ppl_aviation_mechanics.sql](../../scripts/database/20260325_batch_ppl_aviation_mechanics.sql) | `sub_subject = '航空力学'` の verified のみ PPL 付与（単体実行可） |
| [20260325_batch_ppl_engineering_series_and_mapping.sql](../../scripts/database/20260325_batch_ppl_engineering_series_and_mapping.sql) | 上記力学バッチに相当する UPDATE を含む。**工学サブトピック（プロペラ・翼・安定性・油圧/電気・エンジン/推進・計器系）** と **気象「大気の基礎/温度」** に PPL 付与。`learning_test_mapping` の `3.2.x`・`engineering_basics`・`weather_basics`・`3.1.x`（法規は ID 四分割・PPL タグなし）を一括更新 |

本番反映は MCP `execute_sql` または SQL Editor で上記ファイルを実行。適用後は下記 **監査クエリ** で件数を記録する。

## 拡張バッチ（2026-03-26）— 法規・航法・通信・気象

| ファイル | 含める `sub_subject` の方針（要約） | 除外・注意 |
|----------|--------------------------------------|------------|
| [20260326_batch_ppl_law_navigation_comm_weather.sql](../../scripts/database/20260326_batch_ppl_law_navigation_comm_weather.sql) | **航空法規**: 総則・登録・従事者・`航空機の運航/*`・`航空機の安全性/*`（`航空路、空港等…` は除外） | 空港・保安無線施設の細目は PPL バッチ外 |
| 同上 | **空中航法**: 人間要因・`航法に関する一般知識%`・環境・基礎心理学・空間識・`航法の実施/針路の決定`・`機位の確認` | `航法計画書の作成%`・その他 `航法の実施` の IFR/CPL 寄りは除外 |
| 同上 | **航空通信**: 交通業務・概論・管制一般・飛行計画・捜索救難・航空情報・飛行場管制・緊急機管制 | `レーダー管制%` は除外 |
| 同上 | **航空気象**: 大気基礎・物理・風・通報・実況天気図・前線・気団・高気圧/低気圧・雲霧・障害・熱帯 | 既に PPL の行は `NOT (applicable_exams @> PPL)` でスキップ |

**レビュー**: 誤分類が疑われるサブ科目は本 SQL から外し、別バッチで調整すること。

## 監査クエリ（付与前後の記録用）

MCP `execute_sql` または SQL Editor で実行。

```sql
-- verified の PPL 含有件数
SELECT
  COUNT(*) FILTER (WHERE applicable_exams @> ARRAY['PPL']::text[]) AS with_ppl,
  COUNT(*) AS total_verified
FROM unified_cpl_questions
WHERE verification_status = 'verified';

-- マッピング行ごとの unified_cpl_question_ids 件数
SELECT learning_content_id, cardinality(unified_cpl_question_ids) AS n
FROM learning_test_mapping
ORDER BY learning_content_id;

-- PPL 付き verified の主科目別内訳（UI の科目リストと対応）
SELECT main_subject, COUNT(*) AS ppl_verified
FROM unified_cpl_questions
WHERE verification_status = 'verified'
  AND applicable_exams @> ARRAY['PPL']::text[]
GROUP BY main_subject
ORDER BY main_subject;
```

**運用上の注意**: 法規 3.1.x のマッピングは **航空法規 verified を ID 順で 4 分割**した近似である。記事内容と厳密に対応させる場合は手動で `unified_cpl_question_ids` を差し替えること。

## 拡張時の指針

- 新規トピックでは **07 と記事 ID が被らないか** を確認し、[06_記事作成ロードマップ.md](../06_記事作成ロードマップ.md) の PPL 基礎（CPL 駆動）節に従う。
- `topic_category` は `useTestResultTracker` の弱点推奨と整合する必要がある（現状は `main_subject - sub_subject` 形式が保存されるため、科目名のみの行は **問題 ID オーバーラップ** 推奨を優先）。
