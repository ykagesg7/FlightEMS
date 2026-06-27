# Flight Academy 開発ロードマップ

**最終更新**: 2026年6月30日  
**バージョン**: Roadmap v4.0.33（PPL 進捗 41/150・Subject 2 Phase 1 7/12・ブロックA完結）

---

## このドキュメントの目的

本書は Flight Academy の **実行計画** を定義する。
戦略の根拠は [00_Flight_Academy_Strategy.md](00_Flight_Academy_Strategy.md) を参照。

**推奨読み順**: [docs/README.md](README.md) → [00_Flight_Academy_Strategy.md](00_Flight_Academy_Strategy.md) → [Product_North_Star_and_GTM.md](Product_North_Star_and_GTM.md) → **このドキュメント**

### プロダクト指標（ALPM）とエンジニアリング KPI

- **プロダクト北極星**: **ALPM**（Active Learning Path Milestone）— 週次の学習パス上マイルストーン達成。定義・計測契約（要決定）の**正本**は [Product_North_Star_and_GTM.md](Product_North_Star_and_GTM.md) §1。
- **エンジニアリング KPI**: Phase・カバレッジ・コンテンツ本数・マッピング等の**数値表と実行状態**は**引き続き本書（01）を正**とする。ALPM のダッシュボード化や GA4 イベント名は [02_System_Spec.md](02_System_Spec.md) に実装段階で追記する。

### 2026年5月期スプリント（May 実施計画の記録）

- **Phase 2 寄り本文化（通信）**: [3.5.4_EmergencyProcedures](../src/content/lessons/3.5.4_EmergencyProcedures.mdx) は `CPL-Communication`（order 4）、[3.5.5_ATCPhraseology](../src/content/lessons/3.5.5_ATCPhraseology.mdx) は同シリーズ **order 5** として本文化（**2026-05-06**）。`learning_contents` 冪等は [`20260505_learning_contents_comm_354_meta_finalize.sql`](../scripts/database/20260505_learning_contents_comm_354_meta_finalize.sql) / [`20260506_learning_contents_comm_355_meta_finalize.sql`](../scripts/database/20260506_learning_contents_comm_355_meta_finalize.sql)。
- **`learning_test_mapping` サイクル（第1弾／第2弾相当）**: 未マッピング集計の監査のみ [`20260505_audit_unmapped_sub_subject_counts.sql`](../scripts/database/20260505_audit_unmapped_sub_subject_counts.sql)。新環境向けスタブ既定の再適用 [`20260505_learning_test_mapping_comm_354_emergency_stub_retry.sql`](../scripts/database/20260505_learning_test_mapping_comm_354_emergency_stub_retry.sql)。
- **B-4（カバレッジ）**: KPI は Phase C **15%** 主目標（詳細は技術的負債表・更新履歴）。**追補**: [`useArticleProgress.hook.test.tsx`](../src/__tests__/hooks/useArticleProgress.hook.test.tsx)（ログイン進捗・`refreshProgress`）、[`mdxContentParsing.ts`](../src/utils/mdxContentParsing.ts) は [`mdxToSupabase.ts`](../src/utils/mdxToSupabase.ts) から読み込み共有、[`mdxContentParsing.test.ts`](../src/__tests__/utils/mdxContentParsing.test.ts)、[`structuredData.test.ts`](../src/__tests__/utils/structuredData.test.ts)、[`swimNotamGeometry.test.ts`](../src/__tests__/api/swimNotamGeometry.test.ts)（[`api/lib/swimNotamGeometry.ts`](../api/lib/swimNotamGeometry.ts)）、[`aviationWeatherApiCore.test.ts`](../src/__tests__/api/aviationWeatherApiCore.test.ts)、[`openskyStatesCore.test.ts`](../src/__tests__/api/openskyStatesCore.test.ts)、[`weatherApiCore.test.ts`](../src/__tests__/api/weatherApiCore.test.ts)、[`planDocument.test.ts`](../src/__tests__/utils/planDocument.test.ts)、既存 [`taskGenerator.test.ts`](../src/__tests__/utils/taskGenerator.test.ts）。**実測**（`coverage-final.json`・パス **`FlightAcademyTsx/src/`** のみ）は **約 13.99%**（`api/` は集計外。詳細は技術的負債表）。
- **B-5（GA4）**: **2026-05-06** — GA4 リアルタイム（**FlightAcademy**）でアクティブユーザーを確認。[04_Operations_Guide.md](04_Operations_Guide.md)「Post-Phase-B 本番確認ログ」に記入済み。**Phase B-5（本番での計測受信）は満たす**。
- **PPL（二次・リンク穴）**: [3.2.11_StallAndSpin](../src/content/lessons/3.2.11_StallAndSpin.mdx) と [3.3.1](../src/content/lessons/3.3.1_StandardAtmosphere.mdx)。**計画ターン追加**: [`3.2.10_WeightAndBalance`](../src/content/lessons/3.2.10_WeightAndBalance.mdx)、[`3.2.12_EngineSystems`](../src/content/lessons/3.2.12_EngineSystems.mdx)、[`3.4.4_FlightPlanning`](../src/content/lessons/3.4.4_FlightPlanning.mdx) に PPL 復習 Callout。[3.3.11_VisibilityAndFog](../src/content/lessons/3.3.11_VisibilityAndFog.mdx) は学習目標リストの体裁を調整。
- **Phase C 準備**: [Phase_C_Quality_Preparation.md](Phase_C_Quality_Preparation.md)（Light house / A11y / カバレッジ運用のみ。**アーティファクト**: [`artifacts/accessibility_audit_memo_2026-05-06.md`](../artifacts/accessibility_audit_memo_2026-05-06.md)）。月末カバレッジ記録表（**約 13.99%**、`FlightAcademyTsx/src/` のみ）。**KPI**: `src` 実効 Statements の主目標を **Phase C で 15%**（ストレッチ 18%）に再定義。
- **§5.2 マッピング追補（tier2）**: **2026-05-06** — 荷重と強度・機体の構造・燃料供給・総則/定義・雑音と空電を `engineering_basics` / `3.1.1` に束ね（[`20260506_learning_test_mapping_unmapped_tier2.sql`](../scripts/database/20260506_learning_test_mapping_unmapped_tier2.sql) 本番 `execute_sql` 済み）。verified 未マッピング **69 件**・マッピング行 **58**（[14](Article_Coverage_Backlog.md)）。**同日**: MCP で §1 指標を再検証し数値は一致（新規 SQL なし）。
- **CPL 週次パイプライン**: [05_Content_Pipeline.md](05_Content_Pipeline.md) に Phase 2 **週次着手記録**（**2026-W18〜W22**）と暫定 KPI（着手単位レンジ）。
- **5月後半（W20〜W22）拡充の実行メモ**: [May_2026_Late_Content_Sprint.md](May_2026_Late_Content_Sprint.md)。**W20（ブロック A）**・**W21（ブロック B）実装済**（[`3.2.7`](../src/content/lessons/3.2.7_LiftAndDrag.mdx)、[`PPL-1-1-3`](../src/content/lessons/PPL-1-1-3_BernoulliPrinciple.mdx)、[`PPL-1-1-4`](../src/content/lessons/PPL-1-1-4_DragBasics.mdx)、[`3.2.8`](../src/content/lessons/3.2.8_PowerAndPerformance.mdx)、[`PPL-1-1-9`](../src/content/lessons/PPL-1-1-9_FlightPerformance.mdx)）。§6 参照。**W22 実行素案**: [content_outlines/W22_2026/README.md](content_outlines/W22_2026/README.md)。W20/W21 Gemini ワークファイルは削除済み（コミット履歴）。執筆前ブリーフの一覧は [content_outlines/May_2026_Late_PPL_CPL_Outlines.md](content_outlines/May_2026_Late_PPL_CPL_Outlines.md)。Gemini の下限ルールは [templates/External_LLM_Article_Brief.md](templates/External_LLM_Article_Brief.md)。
- **型チェック**: `tsc -b` 全件クリーンは別 initiative — 方針を [06](06_Long_Term_Execution.md) §1.4 に記載。

### 2026年6月期スプリント

- **正本**: [**June_2026_Implementation_Plan.md**](June_2026_Implementation_Plan.md)（DONE 条件・W23〜W26・CPL/PPL/B-4／Phase C 準備の境界）。
- **週次記録**: [05_Content_Pipeline.md](05_Content_Pipeline.md) の Phase 2 **週次着手記録表**へ毎週追記。**W23〜W26 完了**（[June_2026_Content_Sprint.md](June_2026_Content_Sprint.md) §6）。

### 2026年7月期（Phase C 後半 — 短期実行）

六月スプリント（W23〜W26）完了後の **7〜8月フォーカス**。[June_2026_Implementation_Plan.md](June_2026_Implementation_Plan.md) の DONE 条件を踏まえ、**UI 無承認変更なし**のまま次を週次で追う。

| 優先 | タスク | 詳細 | 目安 |
|------|--------|------|------|
| **1** | **C-6 CPL Phase 2・マッピング** | [14 §6–§7](Article_Coverage_Backlog.md) Tier A/B。MCP 再集計 **月 1 回**。verified 未マッピング **36 件**から段階削減（ゼロ必須ではない） | 週 2〜4 着手単位 |
| **2** | **C-7 PPL Subject 2 気象** | [PPL_Subject2 構造案](content_outlines/PPL_Subject2_Aviation_Meteorology_Structure.md) Phase 1 **12 本**。Gemini 下書き → MDX 取り込み → `learning_contents` | ブロック A **2 本/週**目安 |
| **3** | CPL↔PPL Callout | 気象 Phase 1 **7 本**（`3.3.1/2/5/6/8/10/11`）を **PPL-2-* へ差し替え済**（2026-06-27）。残: `3.3.3/4/12`（PPL-2-2/2-3 執筆後）、法規 `3.1.x` ← `PPL-5-*` | Phase 1 ✅ |
| **4** | B-4 テスト | `src` 実効 **15%** 主目標（6月実測 **18.07%** 達成済 — 維持・ストレッチ 18%） | 月次記録 |
| **5** | Phase C プロダクト | C-1〜C-5 は **承認後のみ**コード着手。未承認時は A11y/Lighthouse **監査メモ**のみ | 随時 |

**PPL KPI**: Phase C 合算 **25/150** — **達成済**。Subject 2 Phase 1 **7/12 本**（累計 MDX **41/150**、**ブロックA 7/7 完結**）。

---

## 現状評価（2026年4月12日時点）

### 完了済み機能


| Phase                     | 内容                                         | 状態  |
| ------------------------- | ------------------------------------------ | --- |
| Phase 1: Brand Foundation | MarketingLayout/AppLayout、ブランドカラー          | 完了  |
| Phase 2: Gamification     | 統合ランクシステム、XP、ミッション、ストリーク                   | 完了  |
| Phase 3: Engagement       | Gallery（イベント管理・いいね）、ランク連動 Shop（UI は後に非表示化） | 完了  |
| Phase 4.5-4.7             | デュアルテーマ、リポジトリ整理、MarketingLayout統合          | 完了  |
| PPL ランクシステム               | PPL中間ランク統合、ppl_rank_definitions テーブル       | 完了  |
| CI/CD                     | GitHub Actions（test.yml、verify-build.yml）  | 完了  |
| Flight Planning 拡張        | エクスポート/インポート、燃料計算、A4印刷                     | 完了  |
| 記事システム                    | MDX、進捗管理、シリーズメタ（推奨順）、KaTeX                 | 完了  |


### 未完了 / レガシー扱いの機能


| 項目                                | 状態                                                                                                                                                              | 分類                                                                                   |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **CPL 記事（Phase 1: 06 の深文化 19 本）** | **本文化 19/19**（2026-04-12）— 正本: [db/CPL_KPI_and_Database_Operations.md](db/CPL_KPI_and_Database_Operations.md)。補助: [14](Article_Coverage_Backlog.md)（マッピング記事は Post-Phase-B 追補後 **50 記事**・MCP 実測 2026-04-13） | **Phase 1 本文化は完走** — 以降は Phase 2・マッピング精緻化（[05](05_Content_Pipeline.md)・[00](00_Flight_Academy_Strategy.md) 柱1） |
| **PPL 記事**                        | **41/150（27.3%）** — MDX 実数（工学 20 + 法規 14 + 気象 **7**）。Subject 2 Phase 1 **7/12**（[`PPL-2-1-1`](../src/content/lessons/PPL-2-1-1_AtmosphereAndIsaBasics.mdx)〜`PPL-2-1-7`、`learning_contents` **201〜207**） | **継続（C-7）** — Phase C KPI **25/150 達成済**。2026年末 50% は**二次 KPI** |
| Phase 4: 体験搭乗                     | **削除済**（2026-04-12）                                                                                                                                            | **レガシー撤去** — ルート・UI から除去。戦略ロードマップ外                                        |
| Phase 5: 目標設定・弱点分析                | 未実装                                                                                                                                                             | Phase D 以降                                                                           |
| Phase 6: ランキング機能                  | 未実装                                                                                                                                                             | Phase D                                                                              |
| Phase 6: PWA 最適化                  | 未実装                                                                                                                                                             | Phase C                                                                              |
| Shop / アプリ内ギャラリー               | **ルート削除済**（2026-04-12）                                                                                                                                       | **レガシー撤去**。戦略ロードマップ外                                                                   |
| パイロット紹介                           | コメントアウト                                                                                                                                                         | **レガシー**。戦略ロードマップ外                                                                   |


### 技術的負債


| 項目                | 現状                                                                                                            | 目標                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| テストカバレッジ          | **最新実測**（`npm run test:coverage` 直後、v8 `coverage-final.json`）: パスに **`FlightAcademyTsx/src/`** を含むファイルのみ（**`.vercel` は自動的に除外**）を集計すると **Statements 約 13.99%**。**2026-05-06** — `api/lib` の検証分岐（`openskyStatesCore`、`aviationWeatherApiCore`、`createDevMockFilteredWeather`）を Vitest（`src/__tests__/api/*`）で追加。**`api/` は `src` 外のため src 実効 % は据え置き**。前回ロードマップ記載 **約 11.89%（2026-05-06）** からの上昇は既存 B-4 追補によるもの。**B-4** で `useArticleProgress` フック、[`mdxContentParsing`](../src/utils/mdxContentParsing.ts)、構造化データ、[`planDocument`](../src/utils/planDocument.ts)、[`swimNotamGeometry`](../api/lib/swimNotamGeometry.ts) 等へテスト拡張。レポート先頭の **All files** は依存混入のため **単一指標にしない**（[06](06_Long_Term_Execution.md)）。**Functions** の **Funcs 約 19.31%（2026-04-13）**・**global `functions` 閾値 19%** は従来どおり。**ロードマップ上の主目標**: **Phase C で `src` 実効 15%**（ストレッチ 18%・任意）。Phase B での **一発 30% は不採用**。`vitest.config.ts` の **statements 等の低い thresholds は CI 安定用として据え置き**（数値が安定するまで引き上げない） | **Phase C 末 15%**（主目標）・**Phase D 末 50%**（北極星。[00](00_Flight_Academy_Strategy.md) と整合）          |
| エラー監視             | Sentry 導入済み（DSN設定で有効化）                                                                                        | ✅ Phase A で導入済み               |
| アクセス解析            | **GA4 本番受信確認済**（2026-05-06）：リアルタイムで計測 ID `G-22VFYSM69J`・プロパティ FlightAcademy を確認。[04](04_Operations_Guide.md)「Post-Phase-B 本番確認ログ」表が正 | 継続監視・変数変更時は Redeploy＋ログ追記 |
| パフォーマンス監視         | なし                                                                                                            | Lighthouse CI — Phase C       |
| Supabase クライアント管理 | **`@supabase/supabase-js` の 2 本目クライアントを廃止**しブラウザは `createBrowserClient` 単一シングルトンに寄せた（2026-04-12）                                                                  | ✅ Phase B で対応（継続監視）                 |
| アクセシビリティ          | 未対応                                                                                                           | WCAG 2.1 Level A — Phase C    |


---

## Phase A: 基盤安定化（2026年3月 — 1ヶ月）

**目的**: コアビジネスロジックの品質保証と運用基盤の確立

### タスク


| #   | タスク                   | 詳細                                                                                                                                                          | 優先度 | 状態   |
| --- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ---- |
| A-1 | コアロジックのテスト追加          | `useGamification`, `usePPLRanks` のユニットテスト（`useArticleProgress`, `useLearningProgress` は Phase B へ移動）                                                        | 最高  | ✅ 完了 |
| A-2 | ユーティリティのテスト追加         | `airspace.ts`, `streak.ts` のユニットテスト（`planDocument.ts`, `offset.ts` は型定義のみで対象外）                                                                              | 最高  | ✅ 完了 |
| A-3 | エラー監視の導入              | Sentry（`@sentry/react` + `@sentry/vite-plugin`）導入済み。DSN設定で有効化                                                                                               | 高   | ✅ 完了 |
| A-4 | ドキュメント整理              | 戦略 v1.2・本ロードマップ v4.0 への整合                                                                                                                                   | 高   | ✅ 完了 |
| A-5 | 外部依存機能の整理             | **レガシー削除済**（2026-04-12）: `/shop`・`/gallery`・`/experience` ルート、ミッション「体験搭乗」タブ、About コメントアウト塊。戦略上の正本は [00](00_Flight_Academy_Strategy.md) §6 | 中   | ✅ 完了 |
| A-6 | **CPL 記事**着手 + PPL 継続 | CPL Phase 1 から **1〜3本** 執筆（`learning_contents`・`learning_test_mapping` 連携）。PPL はリンク先として必要なら随時                                                               | 高   | 継続   |


### KPI（Phase A 完了基準）

- テストカバレッジ: [vitest.config.ts](../vitest.config.ts) の閾値を満たす（`npm run test:coverage` で確認）
- エラー監視サービスが稼働中（DSN 設定）
- 戦略・ロードマップの CPL 主軸整合
- CPL 記事: Phase 1 について **着手本数を記録**（目安 1〜3/19）

---

## Phase B: コンテンツ加速（2026年4月-5月 — 2ヶ月）

**目的**: **CPL 記事**制作パイプラインの確立と品質の底上げ

### タスク


| #       | タスク                  | 詳細                                                                                                                      | 優先度 |
| ------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------- | --- |
| B-1     | **CPL 記事**制作パイプライン確立 | [05](05_Content_Pipeline.md)・[08](08_Syllabus_Management_Guide.md) に沿う。テンプレート・AI アシスト。**月5本の主軸は CPL**                         | 最高  |
| B-2     | **CPL Phase 1** 推進   | 高頻出 19 本のうち、**可能な限り多く**を執筆。PPL へのリンク方針は [00](00_Flight_Academy_Strategy.md) §4                                          | 最高  |
| B-3     | PPL 記事（二次）           | Master Syllabus に沿い、**CPL 記事からリンクする前提**で不足トピックを優先                                                                       | 中   |
| B-4     | フック・ユーティリティのテスト拡充    | **継続** — [`useLearningProgress`](../src/hooks/useLearningProgress.ts)・[`useGamification`](../src/hooks/useGamification.ts) の `completeMissionByAction`・[`dashboard`](../src/utils/dashboard.ts) のユニットテストを追加（2026-05-06）。`supabase.ts` はモック境界で優先      | 高   |
| B-5     | **GA4（アクセス解析）**     | **✅ 本番受信確認済**（2026-05-06・リアルタイム）— 実装は `VITE_GA_MEASUREMENT_ID`・`injectGoogleTagPlugin`・`GoogleAnalyticsTracker`。[04](04_Operations_Guide.md) Post-Phase-B 表に記録      | 中   |
| B-6     | Supabase クライアント一元化   | **✅ シングルトン実装済** — **`src/utils/supabase.ts` のみで `createBrowserClient`**。`src/` 直下に第 2 経路なし（**2026-05-06 静的確認**）。GoTrue 「複数インスタンス」はコード上インシデント想定しない                                                                                                           | 中   |
| B-7（任意） | 持続可能性メモ              | たたき台: [Sustainability_API_Memo.md](Sustainability_API_Memo.md)（[00 §3.1](00_Flight_Academy_Strategy.md) 参照。Notion 等の運用と二重管理にならないよう差分時に更新）           | 低   |


### KPI（Phase B 完了基準）

- **CPL 記事 Phase 1**: **本文化 19/19 達成済**（2026-04-12。計画当初の中間目安 **5/19 以上**は上回って完走。正本 [db/CPL_KPI_and_Database_Operations.md](db/CPL_KPI_and_Database_Operations.md)）
- PPL 記事: **20/150 以上**（2026-04-12 時点で二次 KPI を満たし継続。未達の場合は CPL 優先の理由を記録）
- テストカバレッジ: **`src` 実効 Statements** の主目標は **Phase C（2026-06〜07）で 15% 以上**（ストレッチ **18%**・任意）。Phase B 終盤は B-4 で段階拡充。**最新実測** **`約 13.99%`**（`coverage-final.json`・パス **`FlightAcademyTsx/src/`** のみ。技術的負債表・[Phase_C_Quality_Preparation.md](Phase_C_Quality_Preparation.md) 参照）
- **GA4**: クライアント・ビルド注入は**実装済**。**本番受信は 2026-05-06 に GA4 リアルタイムで確認**（[04](04_Operations_Guide.md) Post-Phase-B 表）。今後 `VITE_GA_MEASUREMENT_ID` を変えた場合は再デプロイ後にログを追記する
- **執筆ペース**: Phase 1 完走に伴い、**Phase 2 / マッピング**の週次「着手単位」は [05_Content_Pipeline.md](05_Content_Pipeline.md) の **Phase 2 運用・暫定 KPI（試行レンジ）** を正本とする

---

## 2026年4月末チェックポイント（実行メモ）

- **Sentry**: Vercel 本番に `VITE_SENTRY_DSN` を設定し、イベント受信を確認済み（2026-04-12）
- **GA4**: 本番 URL は **https://flight-lms.vercel.app/**。**2026-05-06** — [リアルタイム](https://support.google.com/analytics/answer/9271392)で受信を確認済み（詳細は [04](04_Operations_Guide.md) Post-Phase-B 表）。以降、環境変数を変えたら **再デプロイ**＋同表へ追記。MCP／Playwright で `gtag/js` が取れても **GA の UI が空のとき**は [04_Operations_Guide.md](04_Operations_Guide.md)「GA4」のトラブルシュートを参照
- **learning_test_mapping**: スナップショット正本は [14](Article_Coverage_Backlog.md)。MCP `execute_sql` で再集計し、§5 SQL に基づき未マッピングが多いクラスタから拡張
- **CPL 深文化**: [05](05_Content_Pipeline.md) Phase 1 のうち、週次で**着手本数**を記録（リポジトリの MDX 本数だけでは Phase 1 進捗を表さない）

### 5月〜7月の橋渡し（Phase B 後半〜 Phase C）

- **テストカバレッジ**の数値目標は **Phase C で 15%**（ストレッチ 18%）へ再定義済み（KPI 節・更新履歴）。`npm run test:coverage` の **src 実効**は技術的負債表で月次確認し、[vitest.config.ts](../vitest.config.ts) の閾値は当面据え置き（CI 下限）
- Phase C のブランド・SEO は [00](00_Flight_Academy_Strategy.md) の公開判断と連動させる

### 将来保留バックログ（Phase タスク外・着手時に再評価）

優先度の都合で **いま着手しない**が、忘れないよう正本としてここに置く。詳細手順は着手時に調査する。

| 項目 | 目的・範囲 | 備考 |
|:-----|:-----------|:-----|
| **GA4 Data API / 公式 MCP** | アクセス統計・ユーザーエンゲージメントの **週次レポート**、または Cursor 上での対話分析 | 計測が安定し GA に行が溜まってから。GCP・ADC・権限の運用コストあり。[公式 MCP 導入](https://developers.google.com/analytics/devguides/MCP?hl=ja)、設定は [Cursor_MCP_Setup.md](Cursor_MCP_Setup.md)。**タグの代替にはならない**（[04](04_Operations_Guide.md)「Data API / 公式 MCP」）。 |
| **Planning: イタリア AIP 相当** | 空港・空域・NAVAID 等の **イタリア域**を地図の参照レイヤーとして追加 | データソース・ライセンス・既存の日本域／SWIM 等との役割分担は着手時に調査。仕様の一文は [02_System_Spec.md](02_System_Spec.md) Flight Planning。 |

---

## Phase C: ユーザー獲得準備（2026年6月-7月 — 2ヶ月）

**目的**: Flight Academy として正式公開し、ユーザー獲得の準備を整える

### タスク


| #       | タスク                | 詳細                                          | 優先度 |
| ------- | ------------------ | ------------------------------------------- | --- |
| C-1     | ブランド移行             | Flight Academy ロゴ、ブランドカラー、Home/About ページの刷新 | 高   |
| C-2     | SEO 最適化            | OGP 最適化、構造化データ検証、サイトマップ                     | 高   |
| C-3     | PWA 基盤             | Service Worker 導入、オフライン対応、インストール可能化         | 中   |
| C-4     | アクセシビリティ対応         | 主要ページの WCAG 2.1 Level A 対応                  | 中   |
| C-5     | Lighthouse CI 導入   | パフォーマンス回帰防止の自動チェック                          | 中   |
| C-6     | **CPL Phase 2・マッピング** | Phase 1 **19/19 完了済**（2026-04-12）。**[05](05_Content_Pipeline.md) Phase 2** の着手本数・[14](Article_Coverage_Backlog.md) の未マッピング削減を週次で追う | 高   |
| C-7     | PPL 記事継続           | 二次。CPL リンク網の穴を優先                            | 中   |
| C-8（任意） | 公開用ポリシーのたたき台       | 収益化を見据えた Terms / プライバシーポリシー案（実装・公開は所管確認後）   | 低   |


### KPI（Phase C 完了基準）

- Flight Academy として公開（ブランド移行完了）
- Lighthouse Performance スコア 90 以上
- **CPL**: Phase 1 は完了。**Phase 2 執筆**または **`learning_test_mapping` 拡充**のいずれかを前向きに進捗（数値正本は [05](05_Content_Pipeline.md)・[14](Article_Coverage_Backlog.md)・次回レビューで定量化）
- PPL 記事: **25/150 以上**（二次）
- PWA としてインストール可能
- テストカバレッジ: **`src` 実効 Statements 15% 以上**（ストレッチ 18%・任意。集計手順は技術的負債表）

---

## CPL 記事と価値命題（[00](00_Flight_Academy_Strategy.md) との単一ソース）

事業用操縦士**学科試験**向けの自学効率化は、[00_Flight_Academy_Strategy.md](00_Flight_Academy_Strategy.md) の **Tier 1a・価値命題** および **§3（持続可能性）** で定義したプロダクト価値の中心である。

- **CPL 記事 Phase 1（19 本）** は **本文化 19/19 完了**（2026-04-12）。以降の主軸は **Phase 2 拡張**と**マッピング精緻化**（旧「案A/案B」は廃止）。
- **PPL 記事**は別記事として維持し、CPL 記事から**リンクで基礎復習**できるようにする（詳細は [00 §4](00_Flight_Academy_Strategy.md)）。
- **クイズ**: **PPL のみ / CPL 範囲**の選択は維持する（[00](00_Flight_Academy_Strategy.md) 柱2）。

---

## Phase D: 成長（2026年8月-12月 — 5ヶ月）

**目的**: CPL 記事の質的拡充、PPL の二次拡充、ユーザーベースの確立

### タスク


| #   | タスク                     | 詳細                                       | 優先度 |
| --- | ----------------------- | ---------------------------------------- | --- |
| D-1 | **CPL Phase 1 完了 + 拡張** | 19 本完走後は Phase 2 または科目別拡張に着手             | 最高  |
| D-2 | テストカバレッジ 50% 達成         | コンポーネントテスト、統合テストの追加                      | 高   |
| D-3 | **cohort 週次バッジ**（非公開榜） | **pilot 本番稼働**（2026-06-21）— 試験月 cohort・週次ミッション・TOP3・in-app/Brevo 通知。SQL: [`20260620`](../scripts/database/20260620_cohort_weekly_missions.sql) / [`20260621`](../scripts/database/20260621_cohort_rpc_hardening.sql) | 高   |
| D-4 | PPL 記事 50% 目標（二次）       | 75/150。CPL 進捗とトレードオフになる場合は 03 を次回レビューで更新 | 高   |
| D-5 | ユーザーフィードバック収集           | フィードバックフォーム、使用状況分析                       | 中   |
| D-6 | LMS 目標設定機能              | GoalSetting.tsx の実装                      | 低   |


### KPI（Phase D 完了基準）

- **CPL 記事: Phase 1（19/19）完了**
- PPL 記事: **50%（75/150）** 到達を目標（二次）
- テストカバレッジ **50%**（北極星。中間で **40%** 等に言い換える場合は本書・[00](00_Flight_Academy_Strategy.md) で整合）
- cohort 週次ミッション・TOP3 バッジが pilot cohort で稼働 — **2026-06-21 本番確認済**（cron HTTP 200・Auth SMTP・週次メール pilot）
- 月間アクティブユーザー数を計測可能な状態

---

## Phase E: 拡張（2027年〜）

**目的**: 自前で完結する機能拡張とコンテンツ完遂（外部パートナー交渉は戦略対象外）

### タスク（優先順位は状況に応じて判断）


| #   | タスク                | 詳細                          |
| --- | ------------------ | --------------------------- |
| E-1 | LMS 弱点分析機能         | クイズ結果から苦手カテゴリを特定し推奨記事をレコメンド |
| E-2 | PWA 最適化            | オフライン学習、プッシュ通知              |
| E-3 | PPL 記事 100% 完了     | 全 150 記事の完成                 |
| E-4 | CPL 記事の Phase 2 以降 | シラバスに従い拡張                   |


---

## 成功指標サマリー


| Phase | 期間         | **CPL 記事（Phase 1）** | PPL 記事（二次）   | テストカバレッジ | その他                       |
| ----- | ---------- | ------------------- | ------------ | -------- | ------------------------- |
| **A** | 2026年3月    | 着手 1〜3/19           | 17/150 維持・微増 | 閾値達成     | エラー監視稼働                   |
| **B** | 2026年4-5月  | **Phase 1: 19/19 完了**（2026-04-12） | 20/150 以上    | **15% は Phase C 目標**。B-4 で実測記録・段階拡充   | GA4 本番受信確認済（2026-05-06・[04](04_Operations_Guide.md)） |
| **C** | 2026年6-7月  | **Phase 2 / マッピング**前進（数値は [05](05_Content_Pipeline.md)・[14](Article_Coverage_Backlog.md)） | 25/150 以上    | **`src` 実効 15%+**（ストレッチ 18%）     | ブランド移行、PWA、Lighthouse 90+ |
| **D** | 2026年8-12月 | **Phase 2 拡充・品質**（Phase 1 完了後） | 75/150 目標    | 50%      | cohort pilot 本番（D-3）・ランキング                     |
| **E** | 2027年〜     | 拡張継続                | 150 本目標      | 50%+     | LMS 弱点分析等                 |


---

## 旧ロードマップとの対応関係

本ロードマップは以下の旧計画を整理・統合したものである:


| 旧 Phase                                  | 状態                          | 新ロードマップでの扱い                                |
| ---------------------------------------- | --------------------------- | ------------------------------------------ |
| Phase 1-3（Brand/Gamification/Engagement） | 完了                          | 完了済みとして記録                                  |
| Phase 4（Real Experience）                 | 未完了                         | **レガシー**（リダイレクト・非表示）。パートナー待ちではない           |
| Phase 4.5-4.7（Design System）             | 完了                          | 完了済みとして記録                                  |
| Phase 5（Advanced LMS）                    | 60%                         | Phase A-D に分散統合                            |
| Phase 6（Content & Analytics）             | 未着手                         | Phase B-D に分散統合                            |
| 05_Content_Pipeline Phase 1（CPL 19記事）          | **Phase 1 本文化 19/19 完了**（2026-04-12） | **Phase 2 以降**は [05](05_Content_Pipeline.md) の執筆単位と [14](Article_Coverage_Backlog.md) マッピング |
| PPL_Master_Syllabus                   | 進行中                         | **継続（二次 KPI）**。CPL リンク先として整備               |


---

## リスクと軽減策


| リスク              | 影響              | 軽減策                                                                      |
| ---------------- | --------------- | ------------------------------------------------------------------------ |
| コンテンツ制作ペースが上がらない | CPL Phase 2 やマッピングが停滞  | AI アシスト、品質基準の段階化（基本版 → 後で品質向上）。Phase 1 は完走済みのため週次レビューで次の数値目標を固定 |
| ソロ開発の限界          | 全方位で進捗が遅い       | 優先順位を厳格に守る（**CPL 記事** > PPL 二次 > テスト > 安定化 > 新機能）                        |
| ユーザーが集まらない       | フィードバックループが回らない | SEO、SNS 発信、フライトシムコミュニティへの露出                                              |
| 技術的負債の累積         | リグレッション、開発速度低下  | Phase A でテスト基盤を確立、**Phase C で 15%**、長期では Phase D で 50% 目標（[06](06_Long_Term_Execution.md)）                                       |
| Supabase 無料枠の超過  | サービス停止リスク       | ユーザー増加時にプラン変更を検討                                                         |
| 外部 API 従量・商用条件   | 個人運営の採算悪化       | B-7 メモ、ログイン後限定・キャッシュ・上限設計（[00 §9](00_Flight_Academy_Strategy.md) 判断基準 4） |


---

## 更新履歴


| 日付         | 更新内容                                                                                                                                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-30 | **v4.0.33 / PPL Subject 2 ブロックA 完結**: MDX [`PPL-2-1-7`](../src/content/lessons/PPL-2-1-7_FogTypesAndFormation.mdx)（視程・2大本質・5霧）。累計 **41/150**、Phase 1 **7/12**。`learning_contents` **207** + mapping **11 問**（MCP `execute_sql`）。[`3.3.11`](../src/content/lessons/3.3.11_VisibilityAndFog.mdx) Callout 更新。[PPL_Master_Syllabus](PPL_Master_Syllabus.md) v1.9 · [14](Article_Coverage_Backlog.md) 登録ログ。 |
| 2026-06-29 | **v4.0.32 / PPL Subject 2 Phase 1 +1 本**: MDX [`PPL-2-1-6`](../src/content/lessons/PPL-2-1-6_CloudTypesAndFormation.mdx)（10種雲形・Cu→CB・Embedded CB）。累計 **40/150**、Phase 1 **6/12**。`learning_contents` **206** + mapping **14 問**（MCP `execute_sql`）。[`3.3.2`](../src/content/lessons/3.3.2_CloudsAndPrecipitation.mdx)・[`3.3.10`](../src/content/lessons/3.3.10_CloudTypes.mdx) Callout 更新。[PPL_Master_Syllabus](PPL_Master_Syllabus.md) v1.8 · [14](Article_Coverage_Backlog.md) 登録ログ。 |
| 2026-06-28 | **v4.0.31 / PPL Subject 2 Phase 1 +1 本**: MDX [`PPL-2-1-5`](../src/content/lessons/PPL-2-1-5_AtmosphericStabilityBasics.mdx)（DALR/SALR/ELR・安定度判定）。累計 **39/150**、Phase 1 **5/12**。`learning_contents` **205** + mapping **19 問**（MCP `execute_sql`）。[`3.3.5`](../src/content/lessons/3.3.5_AtmosphericStability.mdx) Callout 更新。[PPL_Master_Syllabus](PPL_Master_Syllabus.md) v1.7 · [14](Article_Coverage_Backlog.md) 登録ログ。 |
| 2026-06-27 | **v4.0.30 / PPL Subject 2 Phase 1 +1 本**: MDX [`PPL-2-1-4`](../src/content/lessons/PPL-2-1-4_MoistureHumidityDewpoint.mdx)（潜熱・露点・Spread）。累計 **38/150**、Phase 1 **4/12**。`learning_contents` **204**（MCP `execute_sql`）。[PPL_Master_Syllabus](PPL_Master_Syllabus.md) v1.6 · [14](Article_Coverage_Backlog.md) 登録ログ。 |
| 2026-06-25 | **v4.0.29 / PPL Subject 2 Phase 1 着手**: MDX **+2**（[`PPL-2-1-2`](../src/content/lessons/PPL-2-1-2_TemperatureLapseAndInversion.mdx)・[`PPL-2-1-3`](../src/content/lessons/PPL-2-1-3_PressureAltimeterSettings.mdx)）。累計 **37/150**、Phase 1 **3/12**。`learning_contents` **202〜203**（MCP `execute_sql`）。[PPL_Master_Syllabus](PPL_Master_Syllabus.md) v1.5 · [14](Article_Coverage_Backlog.md) 登録ログ。 |
| 2026-06-24 | **v4.0.28 / PPL 進捗同期・Subject 2 気象構造化**: MDX **35/150**（工学 20 + 法規 14 + 気象 1）。[PPL_Master_Syllabus](PPL_Master_Syllabus.md) v1.4、[PPL_Subject2 構造案](content_outlines/PPL_Subject2_Aviation_Meteorology_Structure.md)、[Gemini 索引](content_outlines/PPL_Meteorology_2026/README.md)。**§2026年7月期**短期プラン（C-6 マッピング + C-7 気象 Phase 1）を追加。 |
| 2026-06-24 | **v4.0.27 / 航空機レイヤーを airplanes.live へ移行**: OpenSky が **クラウド IP 遮断**・CORS 制限で Vercel から利用不可（恒常的 502/504）と確定。**airplanes.live**（ADSBExchange v2 互換・CORS `*`）への **ブラウザ直 fetch** に変更しサーバプロキシ廃止。point+radius（最大 250NM）・3 分 poll・Stale・ポップアップ維持。`src/services/openskyTraffic.ts`・`src/utils/openskyTraffic.ts`。[02](02_System_Spec.md) · [03](03_Development_Guide.md) · [04](04_Operations_Guide.md)。 |
| 2026-06-23 | **v4.0.26 / OpenSky 航空機レイヤー 本番安定化**: Planning 地図 **航空機（参考・OpenSky）** — OAuth2 プロキシ（`api/_lib/openskyOAuthToken.ts`・`openskyStatesCore.ts`）、3 分 poll・BBOX 0.5° 量子化・Stale merge（`liveTrafficLayerState.ts`）、Vercel upstream **fetch-only**（502/504 回避）、ポップアップ維持（`openskyTrafficPopup.ts`）。Vercel env: `OPENSKY_CLIENT_ID` / `OPENSKY_CLIENT_SECRET` 追加、未使用 `NEXT_PUBLIC_SUPABASE_*`・`POSTGRES_*` 削除。テスト: `openskyOAuthToken` / `openskyStatesCore` / `liveTrafficLayerState` / `openskyTraffic`。コミット: `9a7ee0b`〜`707a003`。[02](02_System_Spec.md) · [03](03_Development_Guide.md) · [04](04_Operations_Guide.md) OpenSky 運用。 |
| 2026-06-21 | **v4.0.25 / MFA リカバリーコード 本番確認**: Profile で **10 件のリカバリーコード再発行成功**。Vercel: ネスト `[action].ts` 非デプロイ → **`api/mfa-recovery-codes.ts` + `?action=`**（`6edfdc5`）。サーバー AAL2: JWT `aal` クレーム（`3648940`）。ログイン MFA デフォルト OFF（[`20260624`](../scripts/database/20260624_profiles_mfa_required_at_login_default_off.sql)）。CI: `WelcomeSetupPage` 非同期 teardown（`b58facd`）。コミット: `d1c6ec9`〜`3648940`。[02](02_System_Spec.md) · [04](04_Operations_Guide.md) MFA 運用。 |
| 2026-06-21 | **v4.0.24 / Profile Hub + MFA 本番**: Profile Hub 4 セクション・TOTP ログインゲート・リカバリーコード・アカウント削除を **本番デプロイ済**（`54b2a27`〜`99401d3`）。Vercel: API 統合で 12 Serverless 上限内。verify-build: 通知 auto-save lint 修正。DB: [`20260622`](../scripts/database/20260622_profiles_mfa_required_at_login.sql) / [`20260623`](../scripts/database/20260623_mfa_recovery_codes.sql)。[02](02_System_Spec.md) · [04](04_Operations_Guide.md) MFA 運用。 |
| 2026-06-21 | **v4.0.23 / Phase D cohort pilot 本番**: D-3 **pilot 稼働** — cohort 週次 cron（日曜 09:00 JST）、in-app + Brevo メール、Welcome cohort 必須、RPC hardening（[`20260621_cohort_rpc_hardening.sql`](../scripts/database/20260621_cohort_rpc_hardening.sql)）。Supabase **Pause/Restore** 実施・Security Advisor 7 WARN は許容/監視（[04](04_Operations_Guide.md)）。コミット: `a268c3b`（feature）、`7d6cb8c`（CI/auth）、`61c6626`（RPC hardening）。 |
| 2026-06-06 | **v4.0.22 / 6月期ゲート・Quiz Hub**: Lane A **PR-Q0〜Q5** — `/test` Quiz Hub（`testHubFilters`・UI 分割・GA4 5 イベント・学習ループ）。`npm run test:coverage` → **`src` Statements 18.07%**（5302/29341）。[Phase_C §4](Phase_C_Quality_Preparation.md)、[02 §/test](02_System_Spec.md)。Lane B: W24 マッピング（空力基礎→`3.2.7`、未マッピング **47→36**）、PPL Callout、`testHubFilters.test.ts`（14）。A11y: [`accessibility_audit_memo_2026-06-06.md`](../artifacts/accessibility_audit_memo_2026-06-06.md)。 |
| 2026-05-10 | **v4.0.21 / プロダクト指標と docs 連携**: [Product_North_Star_and_GTM.md](Product_North_Star_and_GTM.md) を参照する **「プロダクト指標（ALPM）とエンジニアリング KPI」** 節を追加。推奨読み順に同文書を挿入。[00](00_Flight_Academy_Strategy.md)・[docs/README](README.md) v4.49 と整合。 |
| 2026-05-09 | **v4.0.20 / May 後半 W21→W22 ドキュメント整備**: **W21 完了** — [`3.2.8`](../src/content/lessons/3.2.8_PowerAndPerformance.mdx)、[`PPL-1-1-9`](../src/content/lessons/PPL-1-1-9_FlightPerformance.mdx)。[May](May_2026_Late_Content_Sprint.md) §6・§2、[05](05_Content_Pipeline.md) W21/W22、[May 後半アウトライン](content_outlines/May_2026_Late_PPL_CPL_Outlines.md)、[content_outlines/README.md](content_outlines/README.md) を整合。**W22 実行素案** [content_outlines/W22_2026/README.md](content_outlines/W22_2026/README.md) 追加、**W21** `content_outlines/W21_2026/` 撤去。**[docs/README](README.md)** 索引 v4.48。 |
| 2026-05-08 | **v4.0.19 / May 後半 W20→W21 ドキュメント整備**: W20 で実装済みの **コンテンツ**（[`3.2.7`](../src/content/lessons/3.2.7_LiftAndDrag.mdx)、[`PPL-1-1-3`/`4`](../src/content/lessons/PPL-1-1-3_BernoulliPrinciple.mdx)）と [May](May_2026_Late_Content_Sprint.md) §6 完了ログ、[05](05_Content_Pipeline.md) W20/W21 行、[May 後半アウトライン](content_outlines/May_2026_Late_PPL_CPL_Outlines.md) を整合。**W21 実行用ワーク**は `content_outlines/W21_2026/`（**2026-05-09 実装後に削除**）。W20 用 Gemini 素案ファイル削除。 |
| 2026-05-07 | **v4.0.18 / 5月後半コンテンツ拡充メモ**: [May_2026_Late_Content_Sprint.md](May_2026_Late_Content_Sprint.md)（W20〜W22・CPL/PPL 対応）、[content_outlines/May_2026_Late_PPL_CPL_Outlines.md](content_outlines/May_2026_Late_PPL_CPL_Outlines.md)、[templates/External_LLM_Article_Brief.md](templates/External_LLM_Article_Brief.md)。`---## 現状評価` の改行欠落を修正。[docs/README](README.md) に索引。 |
| 2026-05-07 | **v4.0.17 / 6月期計画書**: [June_2026_Implementation_Plan.md](June_2026_Implementation_Plan.md) を追加。**2026-W23〜W26** の週次ゴール・マッピング 1 サイクル・Phase C 準備と C-1〜5 の境界を定義。本書に **「2026年6月期スプリント」** 参照を追加。[docs/README](README.md) に索引。**[Phase_C §4](Phase_C_Quality_Preparation.md)** に **「2026-06 末」行**を 6月末に追記する前提。 |
| 2026-05-06 | **v4.0.16 / 5月期残タスク一括（計画）**: CPL→PPL 復習 Callout を **[3.2.10](../src/content/lessons/3.2.10_WeightAndBalance.mdx) / [3.2.12](../src/content/lessons/3.2.12_EngineSystems.mdx) / [3.4.4](../src/content/lessons/3.4.4_FlightPlanning.mdx)** に追加（案 A：最低本数達成）。**[05](05_Content_Pipeline.md)**: Phase 2 週次 **W19〜W22** と暫定 KPI 段落。**[14](Article_Coverage_Backlog.md)**: MCP `execute_sql` で §1 指標を再検証し前回値と一致（新規 SQL なし）。**B-4**: [`aviationWeatherApiCore.test.ts`](../src/__tests__/api/aviationWeatherApiCore.test.ts)、[`openskyStatesCore.test.ts`](../src/__tests__/api/openskyStatesCore.test.ts)、[`weatherApiCore.test.ts`](../src/__tests__/api/weatherApiCore.test.ts)。**B-6**: `createBrowserClient` シングルトンを静的確認。**B-7**: [Sustainability_API_Memo.md](Sustainability_API_Memo.md)。**Phase C 準備**: [`artifacts/accessibility_audit_memo_2026-05-06.md`](../artifacts/accessibility_audit_memo_2026-05-06.md)。`npm run test:coverage` の **`src` 実効 Statements 約 13.99%**（`api/` は集計外のため増分なし）。[Phase_C](Phase_C_Quality_Preparation.md) 月末表を記入済み。 |
| 2026-05-06 | **v4.0.15 / B-4 残タスク一括**: [`useArticleProgress.hook.test.tsx`](../src/__tests__/hooks/useArticleProgress.hook.test.tsx)、[`mdxContentParsing.ts`](../src/utils/mdxContentParsing.ts)+[`mdxContentParsing.test.ts`](../src/__tests__/utils/mdxContentParsing.test.ts)、[`structuredData.test.ts`](../src/__tests__/utils/structuredData.test.ts)、[`swimNotamGeometry.test.ts`](../src/__tests__/api/swimNotamGeometry.test.ts)、[`planDocument.test.ts`](../src/__tests__/utils/planDocument.test.ts) を追加。技術的負債表の **`src` 実効 Statements を約 13.99%** に更新。[Phase_C](Phase_C_Quality_Preparation.md) 月末メモ、[docs/README](README.md) カバレッジ行と整合。`vitest.config.ts` 閾値は据え置き。 |
| 2026-05-06 | **v4.0.14 / カバレッジ KPI 再定義・再計測・Wave A**: `src` 実効 Statements の**主目標を Phase B 一発 30% から Phase C 15%**（ストレッチ 18%）へ変更。成功指標サマリー・Phase C KPI・Phase D の注記・リスク表を追随。**2026-05-06** `npm run test:coverage` で **約 11.89%**（`FlightAcademyTsx/src/` のみ集計）を技術的負債表・[Phase_C](Phase_C_Quality_Preparation.md)・[docs/README](README.md)・[06](06_Long_Term_Execution.md) §1.1 に反映。[00](00_Flight_Academy_Strategy.md) 弱みの記述を整合。`vitest.config.ts` の閾値は据え置き。[`taskGenerator.test.ts`](../src/__tests__/utils/taskGenerator.test.ts) を追加。 |
| 2026-05-06 | **v4.0.13 / パイプライン・マッピング tier2・品質メモ**: [05](05_Content_Pipeline.md) Phase 2 週次着手記録。[14](Article_Coverage_Backlog.md) に [`20260506_learning_test_mapping_unmapped_tier2.sql`](../scripts/database/20260506_learning_test_mapping_unmapped_tier2.sql)（verified 未マッピング **69**・行 **58**）。[`useArticleProgress.test.ts`](../src/__tests__/hooks/useArticleProgress.test.ts) 拡張。[Phase_C](Phase_C_Quality_Preparation.md) 月末表、[06](06_Long_Term_Execution.md) §1.4（`tsc -b`）。 |
| 2026-05-06 | **v4.0.12 / B-4 カバレッジ**: [`useLearningProgress.test.ts`](../src/__tests__/hooks/useLearningProgress.test.ts)、[`useGamification.test.ts`](../src/__tests__/hooks/useGamification.test.ts)（`completeMissionByAction`）、[`dashboard.test.ts`](../src/__tests__/utils/dashboard.test.ts)。`coverage-final.json` から **`.vercel` を除く** `FlightAcademyTsx/src/` のみ集計し **Statements 約 10.78%**（同日 `npm run test:coverage`）。Phase B の **30% KPI は未達**、B-4 を継続。 |
| 2026-05-06 | **v4.0.11 / GA4 B-5**: GA4 **リアルタイム**で本番受信を確認（プロパティ **FlightAcademy**、測定 ID `G-22VFYSM69J`）。[04_Operations_Guide.md](04_Operations_Guide.md) Post-Phase-B 表・Phase B 検証記録を更新。技術的負債表・KPI・Tasks B-5・成功指標サマリー行を整合。 |
| 2026-05-05 | **Phase B 並行（Phase 2 記事クローズ／マッピング／カバレッジ）**: 気象 `3.3.10`〜`3.3.12`・工学 `3.2.10`〜`3.2.12`・法規 `3.1.7`〜`3.1.8` の MDX 体裁（科目ハブ・`/articles` ナビ、`/docs/` サイト外リンク削除）。[`20260505_learning_contents_phase2_eight_meta.sql`](../scripts/database/20260505_learning_contents_phase2_eight_meta.sql) を MCP 本番適用。§5.2 上位クラスタ（航空機装備・航空機構造・施行規則）を [`20260505_learning_test_mapping_unmapped_top_clusters.sql`](../scripts/database/20260505_learning_test_mapping_unmapped_top_clusters.sql) で追補 — [05](05_Content_Pipeline.md)、[14](Article_Coverage_Backlog.md)、`scripts/database/INDEX.md` 更新。**テストカバレッジ**: src の **Statements 実効 約 9.40%**（同上日 `npm run test:coverage`・v8 JSON から `FlightAcademyTsx/src` のみ集計）。**GA4**: [04](04_Operations_Guide.md) の Post-Phase-B 表は人手入力が正本（本記録では Data API 数値確認なし）。 |
| 2026-05-05 | **v4.0.10 / May sprint**: 「2026年5月期スプリント」節追加。Phase 2 級の **3.5.4** 緊急通信レッスンの本文化与 DB メタ同期 SQL、[Phase_C_Quality_Preparation.md](Phase_C_Quality_Preparation.md)、監査／再試行用 `20260505_*.sql`、[04_Operations_Guide.md](04_Operations_Guide.md) GA4 ログ表の運用手順明示。`calculateLearningStats` テスト拡張。詳細は同節参照。 |
| 2026-04-30 | v4.0.9: 空中航法 **3.4.5〜3.4.7** を含むシリーズのドキュメント整合 — [09](09_CPL_Learning_Stub.md)、[05](05_Content_Pipeline.md)、[14](Article_Coverage_Backlog.md)、[db/CPL_KPI_and_Database_Operations.md](db/CPL_KPI_and_Database_Operations.md) を `CPL-Navigation`・冪等 SQL（`20260430_learning_contents_cpl_navigation_341_347_meta.sql`）に追随。Phase 1 KPI「19本」の定義（空中航法は `3.4.1`〜`3.4.4` のみ）は変更なし。 |
| 2026-04-25 | ドキュメント整理: 長期方針の [06](06_Long_Term_Execution.md) を旧 16–18 から**1 本**に再編。[docs/README](README.md) 冒頭の更新履歴を圧縮。 |
| 2026-04-25 | v4.0.8: **Phase 1 完走**前提で Phase B KPI・成功指標サマリー・Phase C（C-6）・CPL 価値命題・リスク表を更新。[docs/README](README.md)・Node 18+・GA4 状態（実装済／本番確認は [04](04_Operations_Guide.md)）と整合。長期方針は [06_Long_Term_Execution.md](06_Long_Term_Execution.md) および [docs/README](README.md)「長期実行計画」 |
| 2026-04-13 | Post-Phase-B 完了反映: [14](Article_Coverage_Backlog.md) を MCP 実測で同期（`learning_contents` **90**・PPL **13**・マッピング **50**）。PPL 3 本の `learning_contents` SQL と `3.4.5`/`3.4.6`/`3.5.5` の `learning_test_mapping` SQL を本番 `execute_sql` 適用済み。**3.4.2** の `question_text` 狭義化は未実施（方針は [14](Article_Coverage_Backlog.md) §9）。**テスト**: `useArticleProgress` の統計集計を `calculateLearningStats` として抽出し [useArticleProgress.test.ts](../src/__tests__/hooks/useArticleProgress.test.ts) を追加。`npm run test:coverage`（2026-04-13）All files **Statements/Lines 79.33%**・**Funcs 19.31%**；**src 全体 30%（Statements）KPI は未達**のまま、B-4 で段階的拡充を継続。 |
| 2026-04-12 | v4.0.7: Phase B フォーカス実装 — CPL Phase 1 **本文化 19/19**（[db/CPL_KPI_and_Database_Operations.md](db/CPL_KPI_and_Database_Operations.md)）。空中航法 `3.4.1`〜`3.4.3` の `learning_test_mapping` 冪等 SQL（[scripts/database/20260412_learning_test_mapping_nav_341_343.sql](../scripts/database/20260412_learning_test_mapping_nav_341_343.sql)）・`learning_contents` メタ SQL（[20260412_learning_contents_nav_comm_phase_b_meta.sql](../scripts/database/20260412_learning_contents_nav_comm_phase_b_meta.sql)）。PPL **20/150**（記事 3 本）。[14](Article_Coverage_Backlog.md) サマリー同期。**Supabase** は `src/utils/supabase.ts` で二重 GoTrue 原因の `createClient` 系をやめ、`dashboard` / `taskGenerator` / `chartData` / `heatmapData` は共有 `supabase` を import。**テストカバレッジ**: Phase B の **src 全体 30%** は、現状はユニットテストがコアユーティリティ・フックに集中しておりページ・大量の utils が未計測のため **未達**。当面は CPL・マッピング・運用検証を優先し、**B-4 で `useArticleProgress` 等へのテスト拡充**で段階的に引き上げる（`vitest.config.ts` の低い thresholds は CI 安定用の下限として維持）。**GA4**: コードは `VITE_GA_MEASUREMENT_ID` ガチ仕様済み；本番の変数設定と UI 確認は [04](04_Operations_Guide.md) のチェックリストに従い運用側で実施。 |
| 2026-04-12 | v4.0.6: CPL Phase 1 進捗を [db/CPL_KPI_and_Database_Operations.md](db/CPL_KPI_and_Database_Operations.md) に集約（本文化 12/19）。旧 Shop・ギャラリー・体験搭乗のレガシーはルート/UI から削除（A-5・§6 整合） |
| 2026-04-12 | v4.0.5: 「将来保留バックログ」節を追加（GA4 Data API/MCP・週次レポート案、Planning イタリア AIP）。4 月末チェックポイントの誤った `**` マークアップを修正 |
| 2026-04-12 | v4.0.4: 本番 URL を **https://flight-lms.vercel.app/** と明記。GA4 チェックポイントに URL と [04](04_Operations_Guide.md) へのトラブルシュート導線を追加 |
| 2026-04-12 | v4.0.3: GA4 の測定 ID を `vite.config.ts` の `define` で `getEnv('VITE_GA_MEASUREMENT_ID')` から埋め込み（Vercel の process.env を確実にバンドルへ）。`page_view` は `gtag('event', 'page_view', { page_path, page_title, page_location })` に変更 |
| 2026-04-12 | v4.0.2: アクセス解析を **GA4** に変更（`VITE_GA_MEASUREMENT_ID`・`src/lib/googleAnalytics.ts`・`GoogleAnalyticsTracker.tsx`）。4月末チェックポイントの検証手順を GA4 に合わせて更新                                                                         |
| 2026-04-12 | v4.0.1: CPL KPI を「スタブ配置」と「深文化・マッピング」に分解（MCP スナップショットは [14](Article_Coverage_Backlog.md)）。4月末チェックポイント・5〜7月橋渡し節を追加。Plausible オプション（`VITE_PLAUSIBLE_DOMAIN`）をコード導入                                                                |
| 2026-04-12 | v4.0: Strategy v1.2 整合。**CPL 記事最優先**、案A/B 削除、Phase E からパートナーシップ交渉を削除、レガシー機能の分類、成功指標に CPL 列、技術的負債のカバレッジ注記                                                                                                              |
| 2026-03-24 | v3.5: [00](00_Flight_Academy_Strategy.md) Strategy v1.1 整合。CPL 価値命題の節追加、案A/案B（CPL 着手時期）、任意タスク B-7 / C-8、リスクに API 採算を追加                                                                                                |
| 2026-02-08 | v3.4: MDX 記事メタデータ形式の統一（7記事の YAML→ESM 変換）、画像記法統一、記事テンプレート更新、Cursor ルール追加（MDX ガイドライン・Git コミット規約）                                                                                                                        |
| 2026-02-08 | v3.3: A-5 外部依存機能の正式分類完了、.env ファイル整理（テンプレート修正・セクション再構成・cursorignore 調整）                                                                                                                                                |
| 2026-02-07 | v3.2: Phase A-3 Sentry エラー監視導入完了                                                                                                                                                                                      |
| 2026-02-07 | v3.1: Phase A テスト完了反映（A-1/A-2 完了、カバレッジ 3.9%→4.85%、103テスト/10ファイル）                                                                                                                                                      |
| 2026-02-07 | v3.0: 独立プラットフォーム回帰に伴い Phase A-E を策定                                                                                                                                                                                   |
| 2025-12-26 | v1.9: ヘッダーUI改善・背景画像設定追加                                                                                                                                                                                               |
| 2025-12-24 | v1.8: 飛行計画エクスポート/インポート・燃料計算・印刷機能実装                                                                                                                                                                                    |


---

**最終更新**: 2026年5月10日  
**バージョン**: Roadmap v4.0.21（Strategy v1.2・CPL 主軸・独立運営）
**次回レビュー予定**: Phase B 終盤〜 Phase C（Phase 2 記事継続・`learning_test_mapping`・`npm run test:coverage` KPI）、数値の見直し