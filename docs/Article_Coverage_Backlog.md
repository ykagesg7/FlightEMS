# 記事単元の網羅状況とバックログ

**作成日**: 2026-04-10  
**スナップショット更新**: 2026-04-13（MCP `execute_sql` 再取得。`3.4.2`/`3.4.3` は `question_text` 条件。Post-Phase-B で PPL 3 本・`3.4.5`/`3.4.6`/`3.5.5` マッピング追補）  
**注記更新**: 2026-04-30 — 空中航法 **3.4.1〜3.4.7** の MDX 体裁・`learning_contents` メタを [09](09_CPL_Learning_Stub.md)・`20260430_learning_contents_cpl_navigation_341_347_meta.sql` に追随。**§1 の件数は 04-13 スナップショットのまま**（DB を再取得したら §5 を実行して §1§2 を更新）。
**想定読者**: コンテンツ執筆者、プロダクトオーナー、AI アシスタント  
**関連**: [08_Syllabus_Management_Guide.md](08_Syllabus_Management_Guide.md)（分類の正本）、[05_Content_Pipeline.md](05_Content_Pipeline.md)（Phase 計画）、[PPL_Master_Syllabus.md](PPL_Master_Syllabus.md)（PPL 進捗）

---

## 1. サマリー（Supabase スナップショット）

| 指標 | 値 | 備考 |
|------|-----|------|
| **verified 設問クラスタ数** | **224** | `DISTINCT (main_subject, sub_subject)`（再取得していない場合は据え置き） |
| **`learning_contents` 総行数** | **90** | 2026-04-13 MCP 再取得（[20260413_learning_contents_ppl_phase_b_three.sql](../scripts/database/20260413_learning_contents_ppl_phase_b_three.sql) 適用済み） |
| **`learning_contents`・category 内訳** | CPL学科 **49** / PPL **13** / メンタリティー **15** / 思考法 **13** | `GROUP BY category`・2026-04-13 MCP |
| **`learning_test_mapping` がある記事** | **50** | `COUNT(DISTINCT learning_content_id)`・2026-04-13 MCP（[20260413_learning_test_mapping_nav_345_355_stub.sql](../scripts/database/20260413_learning_test_mapping_nav_345_355_stub.sql) 適用済み） |
| **リポジトリ `src/content/lessons/*.mdx`** | **69** | 2026-04-13（Glob 集計） |

**正本**: 単元の木は **`unified_cpl_questions` の `(main_subject, sub_subject 全文)`**（[08](08_Syllabus_Management_Guide.md)）。本書の数値は FlightAcademy プロジェクトに対する **MCP `execute_sql`** で取得したスナップショットである。再取得する場合は §5 の SQL を使用する。

---

## 2. `learning_test_mapping` が付いている記事（`3.4.5`/`3.4.6`/`3.5.5` 追補後 **50 件**）

クイズ結果の **ReviewContentLink** がマッピング優先で参照しうる `learning_content_id`（2026-04-13 追補後・`ORDER BY learning_content_id`）:

**航空法規 3.1.x**: `3.1.1_AviationLegal0` 〜 `3.1.8_AirportOperations`（各 MDX あり）

**航空工学 3.2.x**: `3.2.1_PropellerTheory` 〜 `3.2.12_EngineSystems`、`engineering_basics`

**航空気象 3.3.x**（マッピングあり・**12/12 本**）: `3.3.1_StandardAtmosphere` 〜 `3.3.12_Turbulence` すべて。  
→ **`3.3.8`**: `高層気象/高層大気の構造と特徴`（2 問）を紐付け（[20260412_learning_test_mapping_meteo_338_3312.sql](../scripts/database/20260412_learning_test_mapping_meteo_338_3312.sql)）。  
→ **`3.3.12`**: `飛行に影響する気象障害/乱気流` + `高層気象/ジェット気流`（計 14 問）。旧スタブ SQL の `%乱流%` は **「乱気流」と表記不一致**でスキップされていた。

**空中航法 3.4.x**（マッピングあり）: `3.4.1_DeadReckoning` 〜 `3.4.7_DeadReckoningAdvanced`。**MDX は 7 本とも本文化**（`meta.series: CPL-Navigation`、`meta.order` 1〜7。2026-04-30、[09](09_CPL_Learning_Stub.md)）。設問束ねは id ごとに次のとおり。  
→ **3.4.1**: `unified_cpl_questions.sub_subject` の ILIKE（推測・偏流・針路等）。`mapping_source`: `phase_b_20260412_nav341_343`。  
→ **3.4.2**: `question_text` の `%VOR%` / `%DME%` / `%TACAN%` / `%RMI%`（`sub_subject` に VOR 語が無いため）。`mapping_source`: `phase_b_20260413_nav342_343_qtext`。意図的に広め（約 60 問）；狭める場合は §9 変更履歴の Post-Phase-B メモを参照。  
→ **3.4.3**: `question_text` の `%GPS%` / `%GNSS%` / `%衛星%`。`mapping_source`: `phase_b_20260413_nav342_343_qtext`。  
→ **3.4.5 / 3.4.6**: [20260413_learning_test_mapping_nav_345_355_stub.sql](../scripts/database/20260413_learning_test_mapping_nav_345_355_stub.sql)（`question_text` 中心。3.4.6 は **VOR を含まない** DME 系で 3.4.2 と重複を減らす）。`mapping_source`: `post_phase_b_20260413_nav_345_355`。  
→ **3.4.7**: 上記スタブ SQL の対象に含まれる場合は同 `mapping_source`。**詳細は Supabase の `learning_test_mapping` 行を正とする**。

**航空通信 3.5.x**（マッピングあり）: `3.5.1_AirTrafficServices` 〜 `3.5.5_ATCPhraseology`  
→ **3.5.5**: 上記 SQL で復唱・略号等に絞ったクラスタ＋キーワード（件数は少なめのスタブ向け）。

**ハブ・入口・PPL**: `CPL-Hub-Communication`、`CPL-Hub-Meteorology`、`CPL-Hub-Navigation`、`weather_basics`、`PPL-1-1-1_TemperatureBasics`

他の PPL 記事（`PPL-1-1-2` 以降など）にも **個別マッピングを増やす余地**がある。

---

## 3. リポジトリに **ある** MDX（`src/content/lessons`・69）

ファイル名（拡張子なし）= 既定の `learning_contents.id`。

**航空法規**: `3.1.1_AviationLegal0`, `3.1.2_AviationLegal1`, `3.1.3_AviationLegal2`, `3.1.4_AviationLegal3`, `3.1.5_AirspaceClassification`, `3.1.6_IFRMinimumAltitude`, `3.1.7_FlightRules`, `3.1.8_AirportOperations`  

**航空工学（CPL 3.2）**: `3.2.1_PropellerTheory` 〜 `3.2.6_InstrumentSystem`, `3.2.7_LiftAndDrag` 〜 `3.2.12_EngineSystems`, `engineering_basics`  

**航空気象（CPL 3.3 スタブ）**: `3.3.1_StandardAtmosphere` 〜 `3.3.12_Turbulence`  

**空中航法（CPL 3.4）**: `3.4.1_DeadReckoning` 〜 `3.4.7_DeadReckoningAdvanced`（**7 本とも本文化**・`CPL-Navigation`。KPI「19本」に数えるのは `3.4.1`〜`3.4.4` のみ — [db/CPL_KPI_and_Database_Operations.md](db/CPL_KPI_and_Database_Operations.md)）  

**航空通信（CPL 3.5）**: `3.5.1_AirTrafficServices` 〜 `3.5.5_ATCPhraseology`（Phase 1 の 3.5.1〜3.5.3 は本文化）  

**ハブ・気象入口**: `CPL-Hub-Meteorology`, `CPL-Hub-Navigation`, `CPL-Hub-Communication`, `weather_basics`  

**PPL（航空工学系・20本）**:  
`PPL-1-1-1_TemperatureBasics`, `PPL-1-1-2_AirspeedBasics`, `PPL-1-1-3_BernoulliPrinciple`, `PPL-1-1-4_DragBasics`, `PPL-1-1-5_AxesStability`, `PPL-1-1-6_StallSpin`, `PPL-1-1-7_VnDiagram`, `PPL-1-1-8_PropellerBasics`, `PPL-1-1-9_FlightPerformance`, `PPL-1-1-10_TakeoffLandingPerformance`, `PPL-1-1-11_ControlSurfaces`, `PPL-1-2-1_GyroBasics`, `PPL-1-2-2_PitotStatic`, `PPL-1-2-3_MagneticCompass`, `PPL-1-2-4_ReciprocatingEngine`, `PPL-1-2-5_CarburetorMixture`, `PPL-1-2-6_IgnitionMagneto`, `PPL-1-2-7_LubricationCooling`, `PPL-1-2-8_FuelSystemVaporLock`, `PPL-1-2-9_TScanInstrumentScan`

---

## 4. リポジトリと DB の **ずれ**（要対応）

| 事象 | 内容 |
|------|------|
| **`3.1.1_AviationLegal0`** | ~~MDX 無し~~ → **2026-04-10** にスタブ MDX を追加。DB 行は従来どおり `ON CONFLICT DO NOTHING` で整合。 |
| **粒度のある気象記事 `3.3.*`** | **2026-04-10** に `3.3.1`〜`3.3.12` スタブ MDX を追加。ハブ `CPL-Hub-Meteorology` と併用。**2026-04-12** に `3.3.8` / `3.3.12` のマッピングを [20260412_learning_test_mapping_meteo_338_3312.sql](../scripts/database/20260412_learning_test_mapping_meteo_338_3312.sql) で追補し **12/12 本**に。 |
| **航法・通信の一部 `3.4.*` / `3.5.5`** | ~~MDX のみ~~ → **2026-04-13** に `3.4.5` / `3.4.6` / `3.5.5` を [20260413_learning_test_mapping_nav_345_355_stub.sql](../scripts/database/20260413_learning_test_mapping_nav_345_355_stub.sql) で追補（スタブ記事向けの狭い束ね）。**2026-04-30** に `3.4.5`〜`3.4.7` のメタを **`CPL-Navigation`** に統一し、`learning_contents` を [20260430_learning_contents_cpl_navigation_341_347_meta.sql](../scripts/database/20260430_learning_contents_cpl_navigation_341_347_meta.sql) で MDX と同期（[09](09_CPL_Learning_Stub.md)）。 |

---

## 5. 再取得用 SQL

### 5.1 クラスタ一覧と設問数・平均重要度

```sql
SELECT main_subject, sub_subject,
       COUNT(*)::int AS question_count,
       ROUND(AVG(COALESCE(importance_score, 0))::numeric, 2) AS avg_importance
FROM unified_cpl_questions
WHERE verification_status = 'verified'
GROUP BY main_subject, sub_subject
ORDER BY main_subject, question_count DESC, sub_subject;
```

### 5.2 「マッピングに一度も載っていない」設問が残るクラスタ（優先バックログの材料）

`unified_cpl_question_ids` / `test_question_ids` のいずれにも出現しない設問 UUID を **未マッピング**とみなし、`sub_subject` ごとに件数を集計する例:

```sql
WITH mapped AS (
  SELECT DISTINCT x::text AS qid
  FROM learning_test_mapping, LATERAL unnest(unified_cpl_question_ids) AS x
  WHERE unified_cpl_question_ids IS NOT NULL
  UNION
  SELECT DISTINCT y::text AS qid
  FROM learning_test_mapping, LATERAL unnest(test_question_ids) AS y
  WHERE test_question_ids IS NOT NULL
)
SELECT u.main_subject, u.sub_subject, COUNT(*)::int AS unmapped_questions
FROM unified_cpl_questions u
LEFT JOIN mapped m ON m.qid = u.id::text
WHERE u.verification_status = 'verified'
  AND m.qid IS NULL
GROUP BY u.main_subject, u.sub_subject
ORDER BY unmapped_questions DESC;
```

> **注意**: `uuid` と `text` の比較は環境によりキャストを調整すること。

---

## 6. 未マッピング設問が多いクラスタ（スナップショット上位）

**注意**: 下表は **2026-04-10 時点**のスナップショットである。最新の優先度は **§5.2 の SQL を MCP で再実行**した結果を正とする。

2026-04-10 時点で、**未マッピング設問数が多い** `sub_subject` の例（執筆・マッピング優先の参考）:

| main_subject | sub_subject（抜粋） | unmapped_questions（例） |
|--------------|---------------------|---------------------------|
| 航空工学 | 航空機装備 | 34 |
| 航空工学 | 航空機構造 | 33 |
| 航空工学 | 性能と耐空性/飛行性能 | 22 |
| 航空工学 | 航空機の構造/荷重と強度 | 16 |
| 航空法規 | 航空法及び航空法施行規則 | 10 |
| 航空法規 | 総則/定義 | 8 |
| … | （以下、§5.2 の結果を都度参照） | … |

**解釈**: CPL 工学の「装備・構造・性能」は **Hub + 既存 3.2.x** では吸収しきれておらず、**クラスタ単位の記事追加**と **マッピング行の細分化**が有効。

---

## 7. 優先バックログ（執筆順の提案）

「単元網羅」と「クイズ連携」を同時に進めるための **推奨順**（細部の本文は後回しでよい、[スタブテンプレート](templates/CPL_Lesson_Stub_Template.mdx) 利用）。

### Tier A — データ駆動（未マッピングが多いクラスタ）

1. 航空工学: **航空機装備** / **航空機構造**（新規 MDX または既存記事のスコープ拡張 + `learning_test_mapping` 更新）
2. 航空工学: **性能と耐空性/飛行性能**（PPL `PPL-1-1-9` との役割分担を 07・08 に沿って整理し、マッピングで CPL 全問をカバー）
3. 航空法規: **航空法及び航空法施行規則**（条文束ね記事 or 既存 3.1.2〜4 の補助記事）
4. 航空法規: **総則/定義**、**計器気象状態における飛行**、**最低安全高度** など高重要サブクラスタ

### Tier B — [05](05_Content_Pipeline.md) Phase1+2：**スタブ MDX は配置済み**（本文・マッピング精緻化は継続）

- **3.3.x** — 気象粒度（`3.3.1`〜`3.3.12`）
- **3.4.x** — 航法（`3.4.1`〜`3.4.7`）
- **3.5.x** — 通信（`3.5.1`〜`3.5.5`）
- **3.2.7〜3.2.12** — 工学補強・Phase2
- **3.1.5〜3.1.8** — 法規補強・Phase2

### Tier C — PPL シラバス残り（[07](PPL_Master_Syllabus.md)）

- 航空気象・空中航法・航空通信・航空法規の **未チェック**トピックに対応する `PPL-*` 記事（工学以外の Subject 2〜5）。

### 運用メモ

- 新規 MDX 作成時は **`learning_contents`**（`id` = ファイル名 stem）と **`learning_test_mapping`**（`unified_cpl_question_ids`）を **セット**で登録（[08](08_Syllabus_Management_Guide.md)）。
- **`3.1.1_AviationLegal0`**: MDX スタブ追加済み（2026-04-10）。DB タイトルと差がある場合は `learning_contents` 側の更新方針を決める。

---

## 8. 各記事の「概略だけ先に書く」チェックリスト

詳細本文は後回しでよい。最低限、スタブ段階で次を満たすと網羅と連携が進みやすい。

1. **対象クラスタ**: `(main_subject, sub_subject)` を明記  
2. **シラバス範囲**: 国交省出題範囲の当該節を箇条書き  
3. **頻出論点**: 設問テキストから用語・パターンのリスト  
4. **問題の型**: 計算 / 条文 / 図 など型の名前だけ  
5. **クイズの絞り方**: `/test` の主科目・サブ科目のヒント  
6. **関連記事**: 同一 `main_subject` の前後リンク  
7. **DB メモ**: `learning_test_mapping` 投入予定（UUID 束）

テンプレート: [docs/templates/CPL_Lesson_Stub_Template.mdx](templates/CPL_Lesson_Stub_Template.mdx)

### 8.1 Phase1+2 スタブの一括生成と DB 投入ファイル

| 種別 | パス |
|------|------|
| 生成スクリプト | [scripts/generate-cpl-stub-lessons.mjs](../scripts/generate-cpl-stub-lessons.mjs) |
| 出力 MDX | `src/content/lessons/{id}.mdx`（`docs/06` の Phase1+2 id・**35 本**） |
| Supabase 用 SQL | [scripts/database/20260410_cpl_stub_lessons_contents_and_mapping.sql](../scripts/database/20260410_cpl_stub_lessons_contents_and_mapping.sql) |

- `3.1.1_AviationLegal0` は **マッピング行は既存想定**のため、SQL では `learning_contents` のみ対象に含め、`learning_test_mapping` は追加しない。  
- マッピングの `ILIKE` 条件はスタブ用。投入後は §5.1 / §5.2 の SQL で **件数・未マッピング**を確認し、必要なら `sub_subject` 完全一致へ差し替える。  
- UI: `/test` 上部・結果画面に **学習記事一覧（`/articles`）** への導線を追加（`LEARNING_ARTICLES_HUB_LABEL`）。
- **Supabase MCP**: `execute_sql`（`project_id` = FlightAcademy の ref）で **1 トランザクション／複数文**をそのまま流せる。長いスクリプトは `scripts/split-cpl-stub-sql-chunks.mjs write-all` で `scripts/sql-chunks-cpl-stub/chunk-*.sql` に分割し、チャンクごとに `execute_sql` するか、同じトークンで Management API `POST /v1/projects/{ref}/database/query` に送る（[scripts/run-cpl-stub-sql-supabase-api.mjs](../scripts/run-cpl-stub-sql-supabase-api.mjs)）。

---

## 9. 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-05-05 | May 計画: **3.5.4** を本文化（`src/content/lessons/3.5.4_EmergencyProcedures.mdx`）、`scripts/database/20260505_learning_contents_comm_354_meta_finalize.sql`・未マッピング監査 `20260505_audit_unmapped_sub_subject_counts.sql`・緊急束ねの再試行 `20260505_learning_test_mapping_comm_354_emergency_stub_retry.sql` を追加。§1 MCP サマリー数値は従来スナップショットのまま（再実行で更新）。|
| 2026-04-30 | 空中航法 **3.4.1〜3.4.7** の MDX 統一（`CPL-Navigation`、`order` 1〜7、リンク・アフィ枠・フィクション注記）と `learning_contents` 冪等同期 SQL [20260430_learning_contents_cpl_navigation_341_347_meta.sql](../scripts/database/20260430_learning_contents_cpl_navigation_341_347_meta.sql)。§2§3§4 の文言を更新。**§1 の MCP 件数は未再取得**（スナップショットは 04-13 のまま）。 |
| 2026-04-13 | Post-Phase-B: PPL 3 本を `learning_contents` に冪等投入（[20260413_learning_contents_ppl_phase_b_three.sql](../scripts/database/20260413_learning_contents_ppl_phase_b_three.sql)）— MCP `execute_sql` 本番適用済み。`learning_contents` **90** 行・PPL **13**。`3.4.5` / `3.4.6` / `3.5.5` の `learning_test_mapping` を [20260413_learning_test_mapping_nav_345_355_stub.sql](../scripts/database/20260413_learning_test_mapping_nav_345_355_stub.sql) で追補（`mapping_source`: `post_phase_b_20260413_nav_345_355`）— マッピング記事 **50**。§1§2 を実測に同期。**3.4.2 の狭義化**（`sub_subject` AND 等）は本日は未実施—記事スコープと未マッピング削減のトレードオフを見てから `UPDATE` または 行削除＋再 `INSERT` で実施する方針（§2 の広め束ねの注記を維持）。 |
| 2026-04-13 | `3.4.2` / `3.4.3` のマッピング条件を修正：verified では `sub_subject` に VOR/GPS 語が無く、`question_text` の `%VOR%`・`%DME%`・`%TACAN%`・`%RMI%`（3.4.2）および `%GPS%`・`%GNSS%`・`%衛星%`（3.4.3）で抽出。`mapping_source`: `phase_b_20260413_nav342_343_qtext`。[20260412_learning_test_mapping_nav_341_343.sql](../scripts/database/20260412_learning_test_mapping_nav_341_343.sql) を正本更新し Supabase MCP `execute_sql` で本番投入済み（`3.4.1`: 97 問・`3.4.2`: 60 問・`3.4.3`: 6 問）。 |
| 2026-04-12 | 空中航法 `3.4.1`〜`3.4.3` の `learning_test_mapping` 追補（[20260412_learning_test_mapping_nav_341_343.sql](../scripts/database/20260412_learning_test_mapping_nav_341_343.sql)）。メタ同期用 [20260412_learning_contents_nav_comm_phase_b_meta.sql](../scripts/database/20260412_learning_contents_nav_comm_phase_b_meta.sql)。§1§2§3§4 を更新（マッピング 47 件・MDX 69 本は SQL 適用・PPL 追加後の想定）。 |
| 2026-04-12 | `3.3.8` / `3.3.12` の `learning_test_mapping` 追補（[20260412_learning_test_mapping_meteo_338_3312.sql](../scripts/database/20260412_learning_test_mapping_meteo_338_3312.sql)）。マッピング 44 記事。§1§2§4 を更新。 |
| 2026-04-12 | MCP 再取得: `learning_contents` 87・マッピング 42 記事・MDX 66。§1§2§4 を更新。 |
| 2026-04-10 | 初版。MCP によるクラスタ数・未マッピング集計・16 記事マッピング・31 MDX 突合。06 の気象「既存」修正と連動。 |
| 2026-04-10 | Phase1+2 スタブ MDX 35 本・`20260410_cpl_stub_lessons_contents_and_mapping.sql`・テスト→記事一覧導線・本節（8.1）追記。 |
