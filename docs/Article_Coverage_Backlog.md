# 記事単元の網羅状況とバックログ

**作成日**: 2026-04-10  
**スナップショット更新**: 2026-06-25（リポジトリ MDX **87**・**PPL 37**。DB マッピング指標は **2026-06-06** MCP のまま）  
**MCP 再取得（マッピング）**: 2026-06-06 — verified 未マッピング **36**・`learning_test_mapping` **74 行 / 64 記事**（W24 空力基礎 3 クラスタ → `3.2.7` 追補）
**前回スナップショット**: 2026-04-13（MCP `execute_sql` 再取得。`3.4.2`/`3.4.3` は `question_text` 条件。Post-Phase-B で PPL 3 本・`3.4.5`/`3.4.6`/`3.5.5` マッピング追補）
**計画監査ターン**: **2026-05-06** — MCP `execute_sql` で §1 と同種の集計を再実行。**値は 2026-05-06 §5.2 メモ記録時と一致**: verified クラスタ **224**・`learning_contents` **90**・`learning_test_mapping` DISTINCT **50** / 総行 **58**・verified 未マッピング設問 **69**。同日に **追加 SQL は適用しておらず**、[14 §5](Article_Coverage_Backlog.md) の正本のみ整合確認。  
**§5.2 メモ更新**: **2026-05-06** — 次段クラスタ（荷重と強度・機体の構造・燃料供給系統・総則/定義・雑音と空電）を `engineering_basics` / `3.1.1` に束ね、[20260506_learning_test_mapping_unmapped_tier2.sql](../scripts/database/20260506_learning_test_mapping_unmapped_tier2.sql) を本番適用（MCP `execute_sql`）。verified で **§5.2 経路に載らない設問は 69 件**、`learning_test_mapping` **行数 58**（**DISTINCT `learning_content_id` は 50 のまま**・同一記事に複数 `topic_category`）。  
**§5.2 メモ（前回）**: **2026-05-05** — 未マッピング上位クラスタを `engineering_basics`・`3.1.1` に束ね、[20260505_learning_test_mapping_unmapped_top_clusters.sql](../scripts/database/20260505_learning_test_mapping_unmapped_top_clusters.sql) を本番適用（当時 verified 未マッピング **123 件**・マッピング行 **53**）。

**登録ログ（未再集計）**: **2026-06-24〜25** — PPL Subject **2（航空気象）** Phase 1 **`PPL-2-1-2`・`PPL-2-1-3`** を `learning_contents` に追加（`sub_category`: **航空気象**、`order_index`: **202〜203**、`is_published`: true）。冪等 SQL: [`20260624_learning_contents_ppl_subject2_202.sql`](../scripts/database/20260624_learning_contents_ppl_subject2_202.sql)、[`20260625_learning_contents_ppl_subject2_203.sql`](../scripts/database/20260625_learning_contents_ppl_subject2_203.sql)（MCP `execute_sql` 済）。**2026-06-24** — **`PPL-2-1-1`**（`order_index` **201**）は [`20260624_learning_contents_ppl_subject2_201.sql`](../scripts/database/20260624_learning_contents_ppl_subject2_201.sql)。**2026-05-12** — PPL Master Subject **5（航空法規）** の本文化済み **4 件** を `learning_contents` に追加（`sub_category`: **航空法規**、`order_index`: **501〜504**、`is_published`: true）。冪等 SQL: [`20260512_learning_contents_ppl_aviation_law_four.sql`](../scripts/database/20260512_learning_contents_ppl_aviation_law_four.sql)。**同一日追補（未再集計）**: **`PPL-5-3-1`〜`PPL-5-3-3`**（技能証・身体検査・航空英語、`order_index` **505〜507**）を [`20260512_learning_contents_ppl_subject5_505_507.sql`](../scripts/database/20260512_learning_contents_ppl_subject5_505_507.sql) で MCP `execute_sql` 済み。**続けて同一日追補**: **`PPL-5-4-1`〜`PPL-5-4-7`**（空域〜最低高度入門、`order_index` **508〜514**）を [`20260512_learning_contents_ppl_subject5_508_514.sql`](../scripts/database/20260512_learning_contents_ppl_subject5_508_514.sql) で MCP `execute_sql` 済み。**§1 の `learning_contents` 総行数 90／PPL 13 はスナップショット由来のため未更新**（再取得は §5）。

**注記更新**: 2026-04-30 — 空中航法 **3.4.1〜3.4.7** の MDX 体裁・`learning_contents` メタを [09](09_CPL_Learning_Stub.md)・`20260430_learning_contents_cpl_navigation_341_347_meta.sql` に追随。**§1 の `learning_contents` 件数等は 04-13 スナップショットのまま**（行数・未マッピングは上記 2026-05-05 メモを参照。DB を全面的に再取得する場合は §5 を実行）。
**想定読者**: コンテンツ執筆者、プロダクトオーナー、AI アシスタント  
**関連**: [08_Syllabus_Management_Guide.md](08_Syllabus_Management_Guide.md)（分類の正本）、[05_Content_Pipeline.md](05_Content_Pipeline.md)（Phase 計画）、[PPL_Master_Syllabus.md](PPL_Master_Syllabus.md)（PPL 進捗）

---

## 1. サマリー（Supabase スナップショット）

| 指標 | 値 | 備考 |
|------|-----|------|
| **verified 設問クラスタ数** | **224** | `DISTINCT (main_subject, sub_subject)`（再取得していない場合は据え置き） |
| **`learning_contents` 総行数** | **107**（見込み） | 2026-04-13 MCP スナップショット **90**。**2026-06-24〜25** Subject 2 **+3**（201〜203）。**2026-05-12** は **+4** + **+3** + **+7**（法規）。**再取得未取得の場合は 90 と併記**。 |
| **`learning_contents`・category 内訳** | CPL学科 **49** / PPL **37**（見込み：工学 **20** + 法規 **14** + 気象 **3**） / メンタリティー **15** / 思考法 **13** | PPL 法規 **`order_index` 501〜514**（2026-05-12）。Subject 2 気象 **`order_index` 201〜203**（2026-06-24〜25）— [PPL_Subject2 構造案](content_outlines/PPL_Subject2_Aviation_Meteorology_Structure.md) |
| **`learning_test_mapping` がある記事** | **64** | `COUNT(DISTINCT learning_content_id)`・2026-06-06 |
| **`learning_test_mapping` 行数** | **74** | 2026-06-06 MCP（W24 [`20260606_learning_test_mapping_aero_lift_drag_clusters.sql`](../scripts/database/20260606_learning_test_mapping_aero_lift_drag_clusters.sql) 適用後） |
| **verified 未マッピング設問** | **36** | 2026-06-06 §5.2 クエリ（W24 前 **47**） |
| **リポジトリ `src/content/lessons/*.mdx`** | **87** | 2026-06-25（PPL **37** / CPL 3.x **44** / その他 **6**） |

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

**航空気象（CPL 3.3 本文化）**: `3.3.1_StandardAtmosphere` 〜 `3.3.12_Turbulence`  

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
| **粒度のある気象記事 `3.3.*`** | **`3.3.1`〜`3.3.12`** は **MDX 長文で揃っている**（ハブ `CPL-Hub-Meteorology` と併用）。`learning_test_mapping` は **12/12 本**（[20260412 SQL](../scripts/database/20260412_learning_test_mapping_meteo_338_3312.sql)）。Phase B で `3.3.10`〜`3.3.12` の `learning_contents` を [20260505_learning_contents_phase2_eight_meta.sql](../scripts/database/20260505_learning_contents_phase2_eight_meta.sql) で MDX に同期。 |
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

**注意**: 下表の **件数**は **2026-05-06** に §5.2 と同じ MCP クエリで再取得した値（tier2 追補適用後）。履歴比較には 05-05 行も参照。

2026-05-06 時点で、**未マッピング設問数が多い** `sub_subject` の例:

| main_subject | sub_subject（抜粋） | unmapped_questions |
|--------------|---------------------|-------------------:|
| 航空法規 | 総則/目的 | 6 |
| 航空工学 | 航法計器/無線航法計器 | 5 |
| 航空工学 | 航法計器/磁方位計器 | 5 |
| 航空工学 | 空力の基礎理論/力学の基礎 | 5 |
| 航空法規 | 登録/変更登録 | 4 |
| 航空工学 | 着氷/着氷の防止の概要 | 4 |
| 航空法規 | 航空従事者/業務範囲 | 4 |
| 航空工学 | 空力の基礎理論/対気速度 | 3 |
| 航空法規 | 航空従事者/航空身体検査証明 | 3 |
| 航空工学 | 空力の基礎理論/操縦性 | 3 |

**2026-05-05 以前に上位だったが 2026-05-06 に束ね済み**（再取得で上位表から消滅）: 航空機の構造/荷重と強度、航空機の構造/機体の構造、燃料供給系統/燃料供給系統、総則/定義、無線通信/雑音と空電（[`20260506_learning_test_mapping_unmapped_tier2.sql`](../scripts/database/20260506_learning_test_mapping_unmapped_tier2.sql)）。

**2026-04-10 の参考行**（当時上位だったが 2026-05-05 に束ね済み）: 航空機装備 **34**、航空機構造 **33**、航空法及び航空法施行規則 **10** — [20260505_learning_test_mapping_unmapped_top_clusters.sql](../scripts/database/20260505_learning_test_mapping_unmapped_top_clusters.sql)。

**解釈**: CPL 工学の「装備・構造・燃料」はまだ **`engineering_basics`** だけでは弱い。**クラスタ単位の記事追加**と **マッピング行の細分化**が有効（**tier2 で 5 クラスタ分を追加束ね済み**—残 69 件は新たな **Tier 3** で継続）。

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

- **Subject 2 航空気象（最優先・2026-07）**: [PPL_Subject2 構造案](content_outlines/PPL_Subject2_Aviation_Meteorology_Structure.md) Phase 1 **12 本**。Gemini 索引: [PPL_Meteorology_2026](content_outlines/PPL_Meteorology_2026/README.md)。
- 空中航法・航空通信の **未チェック**トピックに対応する `PPL-*` 記事（工学・気象以外の Subject 3〜4）。

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
| 2026-06-06 | **2026-W24/W25 スナップショット**: 空力基礎 3 クラスタ → **`3.2.7_LiftAndDrag`**（[`20260606_learning_test_mapping_aero_lift_drag_clusters.sql`](../scripts/database/20260606_learning_test_mapping_aero_lift_drag_clusters.sql)）MCP 適用。verified 未マッピング **47→36**、mapping **73→74 行** / **64 記事**（§1 ヘッダ・2026-06-06 MCP）。 |
| 2026-05-12 | **2026-W23**: 航空法規 **`総則/目的`**（verified **14** 問、`unified_cpl_question_ids`）を **`3.1.1_AviationLegal0`** に束ねる行を追加（[`20260512_learning_test_mapping_legal_sokusoku_mokuteki.sql`](../scripts/database/20260512_learning_test_mapping_legal_sokusoku_mokuteki.sql)）— MCP `execute_sql` 本番適用済み。`mapping_source`: `w23_20260512_legal_sokusoku_mokuteki`。**§1 のサマリー表**や verified 未マッピング件数は、この投入後も **別途 §5 と同種の再集計が必要**（六月のマッピング 1 サイクルで更新予定）。 |
| 2026-05-06 | **§5.2 次段**: 荷重と強度・機体の構造・燃料供給・総則/定義・雑音と空電を `engineering_basics` / `3.1.1` に束ね（[`20260506_learning_test_mapping_unmapped_tier2.sql`](../scripts/database/20260506_learning_test_mapping_unmapped_tier2.sql)）— MCP `execute_sql` 本番適用済み。verified 未マッピング **69 件**・マッピング行 **58**（§1・§6・ヘッダ §5.2 メモ）。 |
| 2026-05-05 | **Phase B**: 気象 3.3.10〜12・工学 3.2.10〜12・法規 3.1.7〜8 の `learning_contents` / `learning_test_mapping.content_title` を MDX `meta` に同期（[`20260505_learning_contents_phase2_eight_meta.sql`](../scripts/database/20260505_learning_contents_phase2_eight_meta.sql)）。§5.2 上位 3 クラスタ（航空機装備・航空機構造・施行規則）を `engineering_basics` / `3.1.1` に束ね（[`20260505_learning_test_mapping_unmapped_top_clusters.sql`](../scripts/database/20260505_learning_test_mapping_unmapped_top_clusters.sql））。verified 未マッピング設問 **123 件**・マッピング行 **53**（§1・§6 更新）。 |
| 2026-05-07 | 航空通信 **3.5.1〜3.5.5** の `learning_contents` タイトル・説明文を MDX 本文化版に全集約。また `learning_test_mapping.content_title` を同タイトルに同期。[`20260507_learning_contents_comm_351_355_meta_sync.sql`](../scripts/database/20260507_learning_contents_comm_351_355_meta_sync.sql) を Supabase `execute_sql` で本番適用済み。§1 MCP サマリー数値は未再取得。|
| 2026-05-06 | **3.5.5_ATCPhraseology** をスタブから本文化（`CPL-Communication`・`order` 5）。`learning_contents` 冪等同期: [`20260506_learning_contents_comm_355_meta_finalize.sql`](../scripts/database/20260506_learning_contents_comm_355_meta_finalize.sql)。§1 MCP サマリー数値は従来スナップショットのまま（再実行で更新）。|
| 2026-05-05 | May 計画: **3.5.4** を本文化（`src/content/lessons/3.5.4_EmergencyProcedures.mdx`）、`scripts/database/20260505_learning_contents_comm_354_meta_finalize.sql`・未マッピング監査 `20260505_audit_unmapped_sub_subject_counts.sql`・緊急束ねの再試行 `20260505_learning_test_mapping_comm_354_emergency_stub_retry.sql` を追加。§1 MCP サマリー数値は従来スナップショットのまま（再実行で更新）。|
| 2026-04-30 | 空中航法 **3.4.1〜3.4.7** の MDX 統一（`CPL-Navigation`、`order` 1〜7、リンク・アフィ枠・フィクション注記）と `learning_contents` 冪等同期 SQL [20260430_learning_contents_cpl_navigation_341_347_meta.sql](../scripts/database/20260430_learning_contents_cpl_navigation_341_347_meta.sql)。§2§3§4 の文言を更新。**§1 の MCP 件数は未再取得**（スナップショットは 04-13 のまま）。 |
| 2026-04-13 | Post-Phase-B: PPL 3 本を `learning_contents` に冪等投入（[20260413_learning_contents_ppl_phase_b_three.sql](../scripts/database/20260413_learning_contents_ppl_phase_b_three.sql)）— MCP `execute_sql` 本番適用済み。`learning_contents` **90** 行・PPL **13**。`3.4.5` / `3.4.6` / `3.5.5` の `learning_test_mapping` を [20260413_learning_test_mapping_nav_345_355_stub.sql](../scripts/database/20260413_learning_test_mapping_nav_345_355_stub.sql) で追補（`mapping_source`: `post_phase_b_20260413_nav_345_355`）— マッピング記事 **50**。§1§2 を実測に同期。**3.4.2 の狭義化**（`sub_subject` AND 等）は本日は未実施—記事スコープと未マッピング削減のトレードオフを見てから `UPDATE` または 行削除＋再 `INSERT` で実施する方針（§2 の広め束ねの注記を維持）。 |
| 2026-04-13 | `3.4.2` / `3.4.3` のマッピング条件を修正：verified では `sub_subject` に VOR/GPS 語が無く、`question_text` の `%VOR%`・`%DME%`・`%TACAN%`・`%RMI%`（3.4.2）および `%GPS%`・`%GNSS%`・`%衛星%`（3.4.3）で抽出。`mapping_source`: `phase_b_20260413_nav342_343_qtext`。[20260412_learning_test_mapping_nav_341_343.sql](../scripts/database/20260412_learning_test_mapping_nav_341_343.sql) を正本更新し Supabase MCP `execute_sql` で本番投入済み（`3.4.1`: 97 問・`3.4.2`: 60 問・`3.4.3`: 6 問）。 |
| 2026-04-12 | 空中航法 `3.4.1`〜`3.4.3` の `learning_test_mapping` 追補（[20260412_learning_test_mapping_nav_341_343.sql](../scripts/database/20260412_learning_test_mapping_nav_341_343.sql)）。メタ同期用 [20260412_learning_contents_nav_comm_phase_b_meta.sql](../scripts/database/20260412_learning_contents_nav_comm_phase_b_meta.sql)。§1§2§3§4 を更新（マッピング 47 件・MDX 69 本は SQL 適用・PPL 追加後の想定）。 |
| 2026-04-12 | `3.3.8` / `3.3.12` の `learning_test_mapping` 追補（[20260412_learning_test_mapping_meteo_338_3312.sql](../scripts/database/20260412_learning_test_mapping_meteo_338_3312.sql)）。マッピング 44 記事。§1§2§4 を更新。 |
| 2026-04-12 | MCP 再取得: `learning_contents` 87・マッピング 42 記事・MDX 66。§1§2§4 を更新。 |
| 2026-04-10 | 初版。MCP によるクラスタ数・未マッピング集計・16 記事マッピング・31 MDX 突合。06 の気象「既存」修正と連動。 |
| 2026-04-10 | Phase1+2 スタブ MDX 35 本・`20260410_cpl_stub_lessons_contents_and_mapping.sql`・テスト→記事一覧導線・本節（8.1）追記。 |
