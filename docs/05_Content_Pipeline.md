# CPL学科試験問題解説記事作成ロードマップ

**作成日**: 2025年1月16日
**最終更新**: 2026年5月12日（**W23 実行分**：[法規 3.1.1〜3.1.3 導線](June_2026_Content_Sprint.md)、`3.2.9` リンク、マッピング SQL 草案、B-4 追補）
**バージョン**: v1.4.3

## 📖 このドキュメントを読むべき人

- ✅ **AIアシスタント**: MDX記事の作成計画やガイドラインを確認したい場合
- ✅ **コンテンツ作成者**: 学習記事やブログ記事を作成する場合
- ✅ **プロジェクトマネージャー**: 記事作成の進捗を確認したい場合

**推奨読み順**: [docs/README.md](README.md) → [Project_Overview.md](Project_Overview.md) → このドキュメント

**関連（記事パイプライン）**: [PPL_Master_Syllabus.md](PPL_Master_Syllabus.md)（PPLシラバス）、[08_Syllabus_Management_Guide.md](08_Syllabus_Management_Guide.md)（命名・DB）、[10_航空工学_学科試験攻略ブログ_ロードマップ.md](10_航空工学_学科試験攻略ブログ_ロードマップ.md)（航空工学詳細）、[Docs_Consistency_Decisions.md](Docs_Consistency_Decisions.md)（4文書の役割）

---

## 📋 概要

事業用操縦士（CPL）学科試験問題からリバースエンジニアリングし、実践的な解説記事を体系的に作成する計画。データベースの`unified_cpl_questions`テーブルを活用し、出題頻度と重要度に基づいて優先順位を決定する。

### CPL 記事から PPL 記事へのリンク（執筆方針）

[00_Flight_Academy_Strategy.md](00_Flight_Academy_Strategy.md) §4 に従う。

- **CPL 記事**は CPL 出題範囲にフォーカスし、PPL と重なる基礎は**短い要約**にとどめ、**対応する PPL 記事（`/articles/...`）へのリンク**で復習動線を用意する。
- **共通の定義・法規の更新**は原則 **PPL 記事を正本**とし、CPL 側はリンク先の更新に追随する。
- 学習者向けに **「基礎を復習（PPL）」** などの Callout で任意リンクであることを明示するとよい（詳細は `.cursor/rules/mdx-article-guide.mdc`）。

---

## 📊 データ分析結果

### データベース統計

- **航空気象「大気の物理」**: 39問、平均重要度5.77、平均頻度0.26
- **航空工学「航空力学」**: 35問、平均重要度5.60、平均頻度0.20
- **航空法規「航空法及び航空法施行規則」**: 53問、平均重要度5.17、平均頻度0.06
- **航空通信「航空交通業務」**: 54問、平均重要度5.11、平均頻度0.04
- **空中航法「航法」**: 57問、平均重要度5.00、平均頻度0.00

### 重要度スコア8.0の高頻出問題トピック

- **航空工学**: 縦安定性、抗力、揚力、プロペラ効果、ピトー静圧系統、必要馬力と利用馬力
- **航空気象**: ショワルター指数、低気圧、前線（温暖・寒冷）、気団、大気組成、偏西風、標準大気、露点温度、水蒸気
- **航空法規**: クラスC空域、計器飛行方式の最低高度
- **航空通信**: 航空情報業務、管制圏の飛行

---

## 🎯 Phase 1: 高頻出問題記事（優先度最高）

### 目標

- 重要度スコア8.0以上、または出題頻度が高いトピックを優先的に記事化
- ユーザーの試験対策に直結する高価値コンテンツを提供
- 学習-テスト連携を強化

### KPI「19本」の正本（[01](01_Current_Status_and_Roadmap.md)・[00](00_Flight_Academy_Strategy.md) と同期）

[01](01_Current_Status_and_Roadmap.md) の **5/19・10/19** は Phase B/C 当初の**中間目安**、**19/19** は Phase 1 **完了**の定義。数えるのは次の **19 執筆単位**（`learning_contents.id`）の **本文化** 件数のみ。**MDX ファイル総数や下記「拡張・気象」枠は含めない**。

| 内訳 | 件数 | ID（概要） |
|------|------|------------|
| 航空法規 | 6 | `3.1.1`〜`3.1.6` |
| 航空工学 | 6 | `3.2.1`〜`3.2.6` |
| 航空通信 | 3 | `3.5.1`〜`3.5.3` |
| 空中航法 | 4 | `3.4.1`〜`3.4.4`（**Phase 1 の KPI に数えるのはこの 4 本のみ**） |

> **注（2026-04-30）**: **`3.4.5`〜`3.4.7`** は KPI 19 本には含めないが、**MDX は本文化済み**（`meta.series: CPL-Navigation`、`order` 5〜7）。`learning_contents` の title/description と `order_index`（380〜386）は [20260430_learning_contents_cpl_navigation_341_347_meta.sql](../scripts/database/20260430_learning_contents_cpl_navigation_341_347_meta.sql) で MDX と同期。執筆・リンク・アフィ枠の約束事は [09_CPL_Learning_Stub.md](09_CPL_Learning_Stub.md)。

**進捗表（本文化・マッピング・更新日）の単一ソース**: [db/CPL_KPI_and_Database_Operations.md](db/CPL_KPI_and_Database_Operations.md)

### 記事リスト（拡張・並行バックログ）

以下は **KPI 19 本に加えて** [14](Article_Coverage_Backlog.md)・Phase 2 と並行して追う単元である（スタブ配置や本文化の進捗は 14 と MDX を正とする）。

#### 航空気象（ハブ＋`3.3.*` 本文化済み）

> **整合（2026-05-05）**: `3.3.1`〜`3.3.12` は **`src/content/lessons` に長文化 MDX が揃っている**（旧「スタブのみ」記述は廃止）。`learning_test_mapping` は **12/12 本**（初回クラスタは [20260412 SQL](../scripts/database/20260412_learning_test_mapping_meteo_338_3312.sql)）。**Phase B**: `3.3.10`〜`3.3.12` の `learning_contents` / `mapping.content_title` は [20260505_learning_contents_phase2_eight_meta.sql](../scripts/database/20260505_learning_contents_phase2_eight_meta.sql) で MDX `meta` に同期済み。入口は `weather_basics` と `CPL-Hub-Meteorology`。数値の正本は [Article_Coverage_Backlog.md](Article_Coverage_Backlog.md)。

1. ✅ 3.3.1_StandardAtmosphere - 標準大気と大気構造
2. ✅ 3.3.2_CloudsAndPrecipitation - 雲と降水のメカニズム
3. ✅ 3.3.3_FrontsAndWeatherSystems - 前線と気象システム
4. ✅ 3.3.4_LowPressureSystems - 低気圧システムと発達過程
5. ✅ 3.3.5_AtmosphericStability - 大気の安定性とショワルター指数
6. ✅ 3.3.6_AtmosphericComposition - 大気組成と水蒸気の物理
7. ✅ 3.3.7_WesterliesAndWind - 偏西風と大気循環
8. ✅ 3.3.8_ICAOStandardAtmosphere - ICAO標準大気の詳細
9. ✅ 3.3.9_WeatherHazards - 航空気象の危険現象

#### 航空工学（KPI 内 6 本＋拡張）

> **KPI 19 本に含まれるのは `3.2.1`〜`3.2.6` のみ**（[トラッカー](db/CPL_KPI_and_Database_Operations.md)）。`3.2.7`〜は Phase 2 または装備・構造クラスタ拡張。

> **詳細**: 航空工学の執筆計画・中・小分類マッピング・推奨執筆順は [10_航空工学_学科試験攻略ブログ_ロードマップ.md](10_航空工学_学科試験攻略ブログ_ロードマップ.md) を参照（4ChoiceQuiz AD問題データベース準拠）。

**KPI 内（本文化済み）**

1. ✅ 3.2.1_PropellerTheory - プロペラ理論
2. ✅ 3.2.2_WingTheory - 翼理論
3. ✅ 3.2.3_StabilityControl - 安定性と操縦性
4. ✅ 3.2.4_HydraulicElectrical - 油圧・電気系統
5. ✅ 3.2.5_EngineTheory - エンジン理論
6. ✅ 3.2.6_InstrumentSystem - 計器システム

**拡張（スタブ〜本文化は 14・10 で追跡）**

7. 3.2.7_LiftAndDrag - 揚力と抗力の詳細
8. 3.2.8_PowerAndPerformance - 必要馬力と利用馬力
9. 3.2.9_PitotStaticSystem - ピトー静圧系統の詳細

#### 航空法規（KPI 内 6 本）

> **`3.1.1_AviationLegal0.mdx` はリポジトリに存在**（[14](Article_Coverage_Backlog.md) と Supabase を正とする）。

1. ✅ 3.1.1_AviationLegal0 - ルールの階層・入口
2. ✅ 3.1.2_AviationLegal1 - 技能証明
3. ✅ 3.1.3_AviationLegal2 - 身体検査
4. ✅ 3.1.4_AviationLegal3 - 耐空証明
5. ✅ 3.1.5_AirspaceClassification - 空域分類とクラスC空域
6. ✅ 3.1.6_IFRMinimumAltitude - 計器飛行方式の最低高度

#### 航空通信（KPI 内 3 本・本文化済み）

1. 3.5.1_AirTrafficServices - 航空交通業務の基礎
2. 3.5.2_AeronauticalInformation - 航空情報業務
3. 3.5.3_RadioCommunication - 無線通信の基本手順

**シリーズ拡張（KPI 外・同一 `CPL-Communication`）**: **3.5.4** / **3.5.5** は Phase 2 で本文化（下記 Phase 2「航空通信」リスト参照）。

#### 空中航法（KPI 内 4 本・本文化済み）

1. ✅ 3.4.1_DeadReckoning — 推測航法（DR）の基礎（公開タイトルは MDX `meta.title` を正とする）
2. ✅ 3.4.2_VORNavigation — VOR 航法
3. ✅ 3.4.3_GPSNavigation — GNSS／GPS 航法の基礎
4. ✅ 3.4.4_FlightPlanning — 飛行計画と航法計算

**シリーズ拡張（KPI 外・同一 `CPL-Navigation`）**: `3.4.5`〜`3.4.7` は [09](09_CPL_Learning_Stub.md)・上記 SQL を参照。

### Phase 1 実装計画

- **期間**: 2025年1月-3月（3ヶ月）
- **目標記事数**: 19記事（新規）
- **優先順位**: 重要度8.0 + 高頻出トピック

---

## 📅 Phase 2: 中頻出問題記事（優先度中）

### 目標

- 重要度スコア7.0-7.9、または中程度の出題頻度のトピックを記事化
- Phase 1でカバーできなかった重要トピックを補完
- 体系的な学習を支援

### 記事リスト（予定15記事）

#### 航空気象
> **注（2026-05-05）**: 以下 3 本は **本文化・体裁監査済み**（Phase 2 リスト上の単元）。`learning_contents` 同期は [20260505_learning_contents_phase2_eight_meta.sql](../scripts/database/20260505_learning_contents_phase2_eight_meta.sql)。
- ✅ 3.3.10_CloudTypes - 雲の種類と特徴
- ✅ 3.3.11_VisibilityAndFog - 視程と霧
- ✅ 3.3.12_Turbulence - 乱気流の種類と対策

#### 航空工学
> **注（2026-05-05）**: 以下 3 本は **本文化・体裁監査済み**。`learning_contents` 同期は上記 Phase B SQL。
- ✅ 3.2.10_WeightAndBalance - 重量と重心
- ✅ 3.2.11_StallAndSpin - 失速とスピン
- ✅ 3.2.12_EngineSystems - エンジン系統の詳細

#### 航空法規
> **注（2026-05-05）**: 以下 2 本は **本文化・体裁監査済み**。`description` は MDX `meta.excerpt` に合わせて同期（同上 SQL）。
- ✅ 3.1.7_FlightRules - 運航規則の詳細
- ✅ 3.1.8_AirportOperations - 空港運用規則

#### 航空通信

- ✅ **3.5.4_EmergencyProcedures** — 緊急時の通信手順（**2026-05** 本文化・`CPL-Communication`）

- ✅ **3.5.5_ATCPhraseology** — 管制用語とフレーズロジー（**2026-05** 本文化・`CPL-Communication`）

#### 空中航法

> **注（2026-04-30）**: 以下 3 本は **MDX 本文化済み**（Phase 2 計画リスト上の単元だが実装先行。マッピング・精緻化は [14](Article_Coverage_Backlog.md)）。

- ✅ 3.4.5_NDBNavigation — NDB航法
- ✅ 3.4.6_DMENavigation — DME航法
- ✅ 3.4.7_DeadReckoningAdvanced — 推測航法の応用

### Phase 2 実装計画

- **期間**: 2025年4月-6月（3ヶ月）
- **目標記事数**: 15記事
- **優先順位**: 重要度7.0-7.9 + 中頻出トピック

### Phase 2 運用: 週次着手記録（[00](00_Flight_Academy_Strategy.md) 柱1と整合）

Phase 2 計画リスト上の **新規本文化** が一段落したフェーズでは、**深文化（体裁・出典・リンク）**、**`learning_test_mapping` 追補**、**`learning_contents` メタ同期**を 1 週あたりの「着手単位」として数える。毎週（日曜〆または金曜〆で統一）、下表に 1 行追記する。

**Phase 2 暫定 KPI（試行レンジ）**: 平常週は **着手単位 2〜4** を目安にする。**例**: 「深文化 or PPL復習リンク」**2 記事まで** と「**マッピング追補 1 クラスタ**（または `learning_contents` メタ同期 **1〜2 ID**）」のどちらかに偏らないよう、[14](Article_Coverage_Backlog.md) の上位未マッピングと [01](01_Current_Status_and_Roadmap.md) の B / Phase C を見て調整。**遅れた週**は **0 でよいが行は空白にしない**。週次「着手単位」の正本は本表。ロードマップの KPI は [01](01_Current_Status_and_Roadmap.md)（週次詳細は **[05](05_Content_Pipeline.md) を参照**）。

| 週（ISO） | 着手本数（目安） | メモ（何を着手したか） |
|-----------|------------------|------------------------|
| **2026-W18**（〜2026-05-06） | **0**（新規 MDX 本文化なし） | Phase 2 リスト上の単元は上記「記事リスト（予定15記事）」節どおり済。**次の深化候補（優先順）**: (1) [14](Article_Coverage_Backlog.md) に沿った **未マッピング影響大クラスタ** の追補 SQL、(2) **拡張単元** `3.2.7`〜`3.2.9`（揚力・抗力／馬力／ピトー静圧）の体裁・出典監査（詳細は [10](10_航空工学_学科試験攻略ブログ_ロードマップ.md)）、(3) Phase 1 チェックリストの「品質チェックとレビュー（記事間リンク、`mapping_source`）」。 |
| **2026-W19**（〜2026-05-13） | **3** | CPL→PPL 復習 **Callout 3 記事**（`3.2.10` 重量・重心、`3.2.12` エンジン系統、`3.4.4` 飛行計画）。§5 監査 MCP 先行のため **新規 SQL 適用なし**。 |
| **2026-W20**（〜2026-05-20） | **4** | ① **[May 後半ブロック A](May_2026_Late_Content_Sprint.md) 完了** — [`3.2.7_LiftAndDrag`](../src/content/lessons/3.2.7_LiftAndDrag.mdx) 深文化、[PPL `1-1-3`/`1-1-4`](../src/content/lessons/PPL-1-1-3_BernoulliPrinciple.mdx) 「CPLへの扉」、[14 §1](Article_Coverage_Backlog.md) MCP 備考・未マッピング表確認。② **W20 用 Gemini 素案**は実装済みにつき削除（本文はコミット履歴参照）。|
| **2026-W21**（〜2026-05-27） | **4** | ① **[May ブロック B — 完了](May_2026_Late_Content_Sprint.md)** — [`3.2.8_PowerAndPerformance`](../src/content/lessons/3.2.8_PowerAndPerformance.mdx) 深文化（$HP_R$/$HP_A$・Vx/Vy 等）、[`PPL-1-1-9`](../src/content/lessons/PPL-1-1-9_FlightPerformance.mdx) 「CPL への扉」。**W21 Gemini 素案**は実装済みにつき削除（本文はコミット履歴参照）。② **[06 §1.2](06_Long_Term_Execution.md)** に沿ったユニットテスト追補など（方針どおり継続）。 |
| **2026-W22**（〜2026-06-03） | **3**（目安） | ① **[May ブロック C](May_2026_Late_Content_Sprint.md)** — **`3.2.9_PitotStaticSystem` 深文化**＋**`PPL-1-2-2_PitotStatic`** 橋渡し。**素案**: [content_outlines/W22_2026/README.md](content_outlines/W22_2026/README.md)。※余力で法規 `3.1.1`〜`3.1.3`。**② 月末ゲート**: `npm run test:coverage` → `FlightAcademyTsx/src/` の Statements 実効 を [Phase_C §4](Phase_C_Quality_Preparation.md)・[01 更新履歴](01_Current_Status_and_Roadmap.md) に転記。**Lighthouse/A11y** は自動検出のメモのみ（UI 変更なし）。 |
| **2026-W23**（〜2026-06-10） | **4** | ① 法規 **`3.1.1_AviationLegal0`〜`3.1.3`** — シリーズ **Callout** ・`3.1.1` の tags から「スタブ」除去。② 工学 **`3.2.9`** に **`3.2.7`**／**`3.2.8`** の関連リンク追記。③ **マッピング**: **[`20260512_learning_test_mapping_legal_sokusoku_mokuteki.sql`](../scripts/database/20260512_learning_test_mapping_legal_sokusoku_mokuteki.sql)** — 航空法規 **`総則/目的`**（verified **14** 問）→`3.1.1`。**MCP 本番適用済み**（[14 §9](Article_Coverage_Backlog.md) 記録）。④ **B-4**: **`pressureAltitudeIsa.test.ts`** 拡張。 |
| **2026-W24**（〜2026-06-17） | **3** | ① **Tier A マッピング**: 空力の基礎理論 3 クラスタ → **`3.2.7_LiftAndDrag`**（[`20260606_learning_test_mapping_aero_lift_drag_clusters.sql`](../scripts/database/20260606_learning_test_mapping_aero_lift_drag_clusters.sql)）— MCP 本番適用済み。② **PPL Callout**: `3.2.7` に PPL-1-1-3/4 復習リンク。③ **Lane A**: Quiz Hub UI（PR-Q2〜Q3）。 |
| **2026-W25**（〜2026-06-24） | **2** | ① **マッピング 1 サイクル**: MCP 再集計 — verified 未マッピング **47→36**、mapping **74 行 / 64 記事**（2026-06-06）→ [14](Article_Coverage_Backlog.md) ヘッダ。② **B-4**: `testHubFilters.test.ts`（14 ケース）、`testQuizFetch` / `testFilterOptionUtils` 抽出。③ **Lane A**: 学習ループ PR-Q4。 |
| **2026-W26**（〜2026-07-01） | **2** | ① **六月末ゲート**: `src` Statements **18.07%** → [Phase_C §4](Phase_C_Quality_Preparation.md)。② A11y メモ [`accessibility_audit_memo_2026-06-06.md`](../artifacts/accessibility_audit_memo_2026-06-06.md)。③ **Lane A**: E2E 拡張・docs 追補（PR-Q5）。GA4 ファネル再取得は投入 4 週後。 |

---

## 📚 Phase 3: 低頻出問題・体系的な網羅（優先度低）

### 目標

- 重要度スコア5.0-6.9、または低頻出だが体系的に必要なトピックを記事化
- 全出題範囲の網羅的なカバー
- 基礎知識の補完

### 記事リスト（予定20記事）

#### 全科目
- 各科目の基礎理論
- 計算問題の解法パターン
- 用語集・定義集

### Phase 3 実装計画

- **期間**: 2025年7月-12月（6ヶ月）
- **目標記事数**: 20記事
- **優先順位**: 体系的網羅

---

## 🔄 Phase 4: 記事の品質向上・更新（継続的）

### 目標

- 既存記事の内容更新・改善
- 新規問題の追加に対応
- ユーザーフィードバックに基づく改善

### 実施内容

- 記事内容の定期レビュー
- 問題データの更新に伴う記事更新
- 解説の精度向上
- 図解・表の追加

### Phase 4 実装計画

- **期間**: 継続的
- **頻度**: 月次レビュー、四半期更新

---

## 🔧 記事作成ワークフロー

### 1. 問題データの抽出

- Supabaseから`unified_cpl_questions`テーブルをクエリ
- `main_subject`と`sub_subject`でフィルタリング
- `importance_score`と`appearance_frequency`で優先順位付け

### 2. 記事構成の設計

- 学習目標の設定
- 出題傾向分析の追加
- 問題例の選定（最低3問、推奨5-10問）
- 解説の詳細化

### 3. MDXファイルの作成

- 既存記事テンプレートに準拠
- フロントマターの設定（title, date, author, tags, series, order）
- 本文の執筆（Markdown + JSX）

### 4. データベース登録

- `learning_contents`テーブルへの登録
- `learning_test_mapping`テーブルへの関連付け
- シリーズ情報の設定

### 5. 品質チェック

- 記事内容の正確性確認
- 問題との関連性確認
- 学習-テスト連携の動作確認

---

## ✅ 記事品質基準

### 必須要素

- [ ] 学習目標が明確に記載されている
- [ ] 出題傾向分析が含まれている
- [ ] 実際の試験問題が3問以上引用されている
- [ ] 各問題に詳細な解説がある
- [ ] 試験対策のポイントがまとめられている
- [ ] 関連テストへのリンクがある
- [ ] 参考書籍が記載されている
- [ ] シリーズ情報（series, order）が設定されている

### 品質指標

- **文字数**: 基本記事3,000-5,000文字、詳細記事5,000-8,000文字
- **問題引用数**: 最低3問、推奨5-10問
- **図表**: 計算問題には図解、概念説明には表を活用

---

## 📈 進捗管理

### 進捗トラッキング

- 記事リストのチェックボックスで進捗管理
- 各Phaseの完了率を追跡
- 月次進捗レポートを作成

### 優先順位マトリックス

- 重要度 × 出題頻度で優先順位を決定
- ユーザーの正答率データも考慮
- 定期的に見直し

---

## 🗄️ データベース連携

### learning_contentsテーブル

- 記事のメタデータを管理
- カテゴリ、サブカテゴリ、order_indexを設定

### learning_test_mappingテーブル

- 記事と問題の関連付け
- `v_mapped_questions`ビューで関連問題を取得
- **連携の正（自然キー・列の揃え方・SQL テンプレ）**: [08_Syllabus_Management_Guide.md](08_Syllabus_Management_Guide.md) の「問題–記事連携契約（`learning_test_mapping`）」を参照

### unified_cpl_questionsテーブル

- 問題データのソース
- 出題頻度、重要度の分析に使用
- **`applicable_exams`**: PPL/CPL など出題レベル別フィルタ（マイグレーション `scripts/database/20260324_add_unified_cpl_applicable_exams.sql`）

### PPL 基礎記事（CPL 問題データ駆動）

- **分類ツリーの正本**: 単元・ロードマップの木構造は **CPL クラスタ**、すなわち `unified_cpl_questions` の **`(main_subject, sub_subject 全文)`** とする。PPL は同一ノード名のうち **`applicable_exams` に `PPL` を含む設問**として部分集合を切り出すだけに留める（別ツリーを正にしない）。詳細は [08_Syllabus_Management_Guide.md](08_Syllabus_Management_Guide.md)「分類ツリー：CPL クラスタを正とする」。
- **方針**: `unified_cpl_questions` のうち **PPL 相当**と判断した設問（`applicable_exams` に `PPL` を含める）を束ね、**サブ科目（トピック）単位**で MDX 基礎記事を整備する。CPL 受験者も同じ問題・記事で土台を固められる。
- **07 との関係**: [PPL_Master_Syllabus.md](PPL_Master_Syllabus.md) に既に同トピックの `PPL-*` 記事がある場合は **新規 CPL 専用 ID で重複執筆しない**。既存記事を正本とし、`learning_test_mapping` のみ追加・更新する。
- **粒度**: 原則 **1 トピック 1 記事**（1 問 1 記事は避ける）。
- **手順の例**: [docs/db/CPL_KPI_and_Database_Operations.md](db/CPL_KPI_and_Database_Operations.md)（`applicable_exams` パイロット節・航空工学・空力の基礎理論）

---

## 📁 出力ドキュメント

### 生成するファイル

1. ✅ `docs/05_Content_Pipeline.md` - 本ドキュメント（全体計画）
2. ✅ `docs/db/CPL_KPI_and_Database_Operations.md` - Phase 1 KPI（19本）進捗の正本
3. ✅ `docs/db/article_registration_queries.sql` - データベース登録用SQL
4. ✅ `docs/db/article_priority_matrix.md` - 優先順位マトリックス
5. ✅ `docs/db/article_progress_tracker.md` - 進捗トラッカー

---

## ✅ 実装タスク

### Phase 1準備タスク

- [x] Supabaseから各トピックの問題を抽出し、重要度・頻度で分析
- [x] 問題をトピックごとにグループ化し、記事化可能なトピックを特定
- [x] 各記事のメタデータ（ID、タイトル、説明、order_index）を生成
- [x] Phase 1記事リストをMarkdown形式で出力
- [x] データベース登録用SQLを生成
- [x] 優先順位マトリックスを作成
- [x] 進捗トラッカーを作成
- [x] 記事作成ロードマップドキュメントを作成

### Phase 1実装タスク（次のステップ）

- [x] KPI 19 本の MDX 配置（`src/content/lessons` に全 ID あり — [トラッカー](db/CPL_KPI_and_Database_Operations.md)）
- [x] KPI 19 本の **本文化**（**19/19** — [トラッカー](db/CPL_KPI_and_Database_Operations.md)）
- [x] `learning_test_mapping` の **初期欠損埋め**（`3.4.1`〜`3.4.3` および Post-Phase-B の追補は [14](Article_Coverage_Backlog.md)・2026-04-13 MCP 実測。**狭義化・追加クラスタは継続**）
- [ ] 品質チェックとレビュー（記事間リンク、`mapping_source` 精緻化）

---

## 📚 参考資料

- `docs/10_航空工学_学科試験攻略ブログ_ロードマップ.md` - 航空工学の詳細ロードマップ（4ChoiceQuiz連携）
- `docs/db/CPL_KPI_and_Database_Operations.md` - **Phase 1 KPI（19本）進捗の正本**
- `docs/db/article_registration_queries.sql` - データベース登録用SQL
- `docs/db/article_priority_matrix.md` - 優先順位マトリックス
- `docs/db/article_progress_tracker.md` - 進捗トラッカー
- `docs/02_System_Spec.md` - データベース設計仕様
- `docs/04_Operations_Guide.md` - 記事公開手順

---

## 🔄 更新履歴

| 日付 | 更新内容 | 更新者 |
|------|----------|--------|
| 2026-05-12 | **W23 実績**を週次行に反映（法規 3.1.1〜3.1.3 導線、`3.2.9` クロスリンク、[`20260512_learning_test_mapping_legal_sokusoku_mokuteki.sql`](../scripts/database/20260512_learning_test_mapping_legal_sokusoku_mokuteki.sql)、`pressureAltitudeIsa` テスト）。W26 セルの文言整理。バージョン v1.4.3。 | — |
| 2026-05-12 | Phase 2 **週次着手記録**: **2026-W23〜W26** を追加（六月の実行メモ・目安着手は [June_2026_Implementation_Plan.md](June_2026_Implementation_Plan.md)／[June_2026_Content_Sprint.md](June_2026_Content_Sprint.md) と整合。**週末に実績で着手本数・メモを上書き**）。バージョン v1.4.2。 | — |
| 2026-05-09 | Phase 2 **週次着手記録**を更新：**W21** を May [ブロック B](May_2026_Late_Content_Sprint.md) 実装済みと整合（`3.2.8`＋`PPL-1-1-9`）。**W21 Gemini フォルダ撤去**。**W22** はブロック **C**（`3.2.9`＋`PPL-1-2-2`）＋月末ゲート。素案 [content_outlines/W22_2026/README.md](content_outlines/W22_2026/README.md)。バージョン v1.4.1。 | — |
| 2026-05-08 | Phase 2 **週次着手記録**を更新：**W20** は May [ブロック A](May_2026_Late_Content_Sprint.md)（`3.2.7`＋PPL 橋渡し）実装済みと整合。**W21** は **ブロック B**（`3.2.8`＋`PPL-1-1-9`）と [06 §1.2](06_Long_Term_Execution.md) テスト追補の併記。W20 Gemini 素案ファイルは削除済み。**W21 素案**は content_outlines/W21_2026（**2026-05-09 削除**）。 | — |
| 2026-05-06 | Phase 2 **週次着手記録**を追加（2026-W18）、次の深化候補（14・10・品質レビュー）を明記。バージョン v1.4.0 | — |
| 2026-04-30 | 空中航法 `3.4.5`〜`3.4.7` の本文化を反映、KPI 表に注記、Phase 1 チェックリストを **19/19・マッピング初期投入済み** に更新 | — |
| 2025-01-16 | 初版作成、Phase 1準備タスク完了 | System |

---

**次のステップ**: Phase 1 KPI は完走済み（[トラッカー](db/CPL_KPI_and_Database_Operations.md)）。**Phase 2** の残単元・マッピング精緻化・品質レビューは [14](Article_Coverage_Backlog.md) と [00](00_Flight_Academy_Strategy.md) 柱 1 に従う。

