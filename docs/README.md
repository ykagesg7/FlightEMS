# Flight Academy ドキュメント - AI向けプロジェクトコンテキストガイド

**最終更新**: 2026年4月12日（本番 URL 明記・GA4 表示差の注記）
**バージョン**: Documentation Index v4.18

---

## 🎯 このドキュメントの目的

このドキュメントは、**AIアシスタントがプロジェクトのコンテキストを迅速に理解できるよう**設計された包括的なガイドです。プロジェクトの全体像、技術スタック、現在の実装状況、開発方針を一箇所にまとめています。

### 更新履歴（抜粋・2026-03-30）

- **2026-04-12 MCP / Sentry**: [13_Cursor_MCP_Setup.md](13_Cursor_MCP_Setup.md) に **Marketplace の `plugin-*` と手動 `mcp.json` の関係**を追記。`.cursor/mcp.json.example` の **Windows `cmd` ラップ**を統一。Supabase 記事登録ルール・[MCP_RELEASE_CHECKLIST](ops/MCP_RELEASE_CHECKLIST.md)・[APPLICABLE_EXAMS_PILOT](db/APPLICABLE_EXAMS_PILOT.md) のサーバー名を Marketplace 対応。Sentry 本番検証手順は [04](04_運用保守ガイド.md)。
- **2026-04-12 本番 URL**: **Production** は [https://flight-lms.vercel.app/](https://flight-lms.vercel.app/) を正とする（[02](02_技術開発ガイド.md)・[04](04_運用保守ガイド.md)）。
- **2026-04-12 KPI・計測（GA4）**: アクセス解析を **Google Analytics 4** に統一。本番かつ `VITE_GA_MEASUREMENT_ID` 設定時のみ `src/lib/googleAnalytics.ts`・`GoogleAnalyticsTracker.tsx`（`.env.example`・[03](03_計画改善ロードマップ.md)）。**Playwright で `dataLayer` に `page_view` が積まれても GA の UI に出ない場合**の切り分けは [04](04_運用保守ガイド.md)「GA4」。従来の Plausible 変数は廃止。
- **2026-04-12 KPI・計測**: [00](00_Flight_Academy_Strategy.md) **v1.2.1**（CPL を「スタブ配置」と「深文化・マッピング」に分解、MDX 66 件を反映）。[03](03_計画改善ロードマップ.md) **v4.0.1**（4月末チェックポイント・5〜7月橋渡し）。[14](14_記事単元網羅とバックログ.md) を MCP 再取得（マッピング 42 記事等）。[06](06_記事作成ロードマップ.md) の気象 3.3 注記を実態に合わせ更新。
- **2026-04-12 戦略・ロードマップ**: [00](00_Flight_Academy_Strategy.md) **v1.2 独立運営**（パートナーシップ柱・案A/B 廃止）、**CPL 学科最優先**・PPL/CPL 記事分離と相互リンク方針、クイズの **PPL/CPL 範囲フィルタ維持**。[03](03_計画改善ロードマップ.md) **v4.0**（Phase B〜D を CPL 記事主軸 KPI に再定義、Phase E からパートナー交渉を削除）。プロジェクト用 Markdown の正本は **`docs/`**（`public/docs/` は `npm run sync:public-docs` で同期。詳細は [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)）。
- **2026-04-12 記事 MDX UX**: `MDXContent` に **`prose-invert`**（ダーク地での `code` 可読性）、記事カラムの **`min-w-0` / `overflow-x-auto`** で flex 下の幅潰れを防止。`Callout` 内も `prose-invert`。レッスン MDX の **「データ連携」**は学習者向け文言に統一（`unified_cpl_questions` 等の内部名は本文から除去）。**アフィリエイト枠**は `not-prose` ＋ **CSS Grid** ＋ `break-normal` でレイアウト崩れ（縦一文字折り返し）を修正。詳細は [05](05_設計仕様書.md)・[07](07_コンポーネント構造ガイド.md)、テンプレ [templates/CPL_Lesson_Stub_Template.mdx](templates/CPL_Lesson_Stub_Template.mdx)。
- **2026-04-11 記事ロック廃止**: シリーズ順次アンロックを撤去し全記事を常時閲覧可能に。未ログイン向け登録 CTA を `ReviewContentLink` 先頭に追加。E2E は通常 `build` + `preview`。仕様は [05](05_設計仕様書.md)・[01](01_プロジェクト概要ガイド.md)・[08](08_Syllabus_Management_Guide.md)。
- **2026-04-11 航空法規 3.1.x MDX**: 根拠（航空法・施行規則等＋e-Gov）の Callout、フィクション明示、飲酒トーン注記、関連リンクを `/articles/{ファイル名}` に統一。`meta.series` を `CPL-Aviation-Legal`（`order` 1〜8）に分離。`learning_contents` 用 [20260411_learning_contents_cpl_aviation_legal_order.sql](scripts/database/20260411_learning_contents_cpl_aviation_legal_order.sql)。[08](08_Syllabus_Management_Guide.md)・[09](09_CPL_Learning_Stub.md) と `npm run sync:public-docs`（`public/docs/`）を更新。
- **2026-04-11 Supabase DB スリム化（追記）**: `fan_photos` / `gallery_events` / `products` / `purchase_history` 等を削除。`check_rank_requirements` 更新。`migration_log` 削除。`/gallery` ルートはホームへリダイレクト。
- **2026-04-11 Supabase DB スリム化**: 未使用の分析系・旧 `cpl_exam_questions` / `user_progress` 等を `scripts/database/20260411_drop_legacy_*.sql` で削除。`src/types/database.types.ts` を現行スキーマに同期。詳細は [05_設計仕様書.md](05_設計仕様書.md)「DB スリム化」。
- **2026-04-11 Cursor MCP（hourei）**: 航空法規 MDX 執筆向けに **法令検索 MCP**（`hourei-mcp-server` / e-Gov）を [13_Cursor_MCP_Setup.md](13_Cursor_MCP_Setup.md) と `.cursor/mcp.json.example` に追加。`.cursor/rules/mdx-article-guide.mdc` に根拠条文・hourei 利用の節を追加。
- **2026-04-05 学習記事ハブ**: SKY NOTES / `narrator` MDX 廃止。記事詳細に **関連テスト**（`RelatedTestsBlock`）、テスト結果から記事へ **「単元記事を読む」** で統一。詳細は [05_設計仕様書.md](05_設計仕様書.md) と変更履歴（2026年4月5日）。
- **CPL 学科 MDX**: 航空法規 `3.1.2` / `3.1.3` を本文化（相互の前後記事リンクを整合）。`3.1.4`・航空工学 `3.2.1`〜`3.2.6`・科目ハブ（気象・航法・通信）・`engineering_basics` / `weather_basics` に、執筆スコープと `unified_cpl_questions` / `learning_test_mapping` との対応を明記。
- **クイズ誤答→記事**: `ReviewContentLink` がマッピング行を **セッション設問 UUID との重なり件数**でソート（多い順、最大 5 件）。法規 `3.1.2` は `sub_subject` クラスタ単位の冪等更新 SQL（`scripts/database/20260331_learning_test_mapping_aviation_legal_312_skill_cluster.sql`）。四分位からの移行方針は [08_Syllabus_Management_Guide.md](08_Syllabus_Management_Guide.md)。
- **ドキュメント索引**: [09_CPL_Learning_Stub.md](09_CPL_Learning_Stub.md) を新設。記事内から `/docs/*.md` で参照するファイルは **`npm run sync:public-docs`** で `docs/` から `public/docs/` へ同期（正本は常に `docs/`）。[FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) 参照。

---

## 📋 プロジェクト概要（クイックリファレンス）

### プロジェクト名
**Flight Academy**（リポジトリ名: FlightAcademyTsx）

### 本番 URL（Vercel Production）
- **公開URL**: [https://flight-lms.vercel.app/](https://flight-lms.vercel.app/)（Sentry・GA4 の検証・ストリーム設定の基準）

### プロジェクトの性質
- **タイプ**: フルスタックWebアプリケーション（React + TypeScript + Supabase）
- **目的**: 独立した航空学習プラットフォーム — 学習コンテンツ、実用ツール、コミュニティを提供
- **コンセプト**: "Learn, Plan, Fly" — 航空知識を学び、フライトプランを作り、仲間として飛び立つ
- **戦略**: **完全独立運営** — 外部パートナー承認に依存しない。詳細は [00_Flight_Academy_Strategy.md](00_Flight_Academy_Strategy.md)（**3本柱**: Content / Tools / Community）
- **価値・運営（要約）**: **CPL 学科**受験者をコンテンツの主軸とし、**CPL 記事を最優先**で執筆。**PPL 記事**は別記事として継続し、CPL 記事から**リンクで基礎復習**可能にする。クイズは **PPL のみ / CPL 範囲**の選択を維持。個人開発の持続可能性・表現上の境界は [00](00_Flight_Academy_Strategy.md) **§2・§3**。**Phase・KPI の数値正本**は [03_計画改善ロードマップ.md](03_計画改善ロードマップ.md) v4.0.4（コンテンツ進捗の補助指標は [14_記事単元網羅とバックログ.md](14_記事単元網羅とバックログ.md)）。

### コア機能
1. **学習コンテンツ管理**: MDXベースの記事システム（PPL/CPL統合）、進捗管理（ログインで永続化）、推奨読み順用 `meta.series` / `order`、KaTeX数式記法サポート
2. **テスト・クイズシステム**: CPL 試験問題ベースの出題、**試験範囲フィルタ（PPL のみ等）**、SRS（間隔反復学習）、進捗追跡
3. **フライトプランニング**: インタラクティブ地図、気象データ（METAR/TAF）、経路計画
4. **ゲーミフィケーション**: 統合ランクシステム（Fan → PPL中間ランク → PPL → Wingman → CPL → Ace → Master → Legend）、XP、ミッション、ストリーク、達成通知
5. **コミュニティ**: ギャラリー（航空写真投稿）、コメント

### レガシー・非表示ルート（戦略ロードマップ外）

`/shop`・`/experience`・About 内のコメントアウト箇所などは**過去 UI の名残**。リダイレクトまたは非表示で維持。詳細は [00](00_Flight_Academy_Strategy.md) §6。

### 技術スタック（2026年2月現在）

#### フロントエンド
- **React 18**: Concurrent Mode、Suspense、useTransition
- **TypeScript**: 型安全性重視（`any`型の使用を避ける）
- **Vite**: 高速ビルド、動的チャンク分割
- **Tailwind CSS**: ユーティリティファースト

#### バックエンド・インフラ
- **Supabase**: PostgreSQL、認証、リアルタイム機能、ストレージ
- **Vercel**: デプロイメント、Serverless Functions（APIプロキシ）

#### テスト・CI/CD
- **Vitest**: テストフレームワーク（109テスト、`planDocument` / `flightTime` 等を含む）
- **Testing Library**: Reactコンポーネントテスト
- **GitHub Actions**: CI/CDパイプライン（Lint、テスト、ビルド、カバレッジ）

#### 外部API
- **WeatherAPI.com**: 一般気象情報（要APIキー）
- **NOAA Aviation Weather Center API**: METAR/TAF航空気象データ（無料・認証不要）
- **RainViewer / Open-Meteo**: 計画地図のレーダー・上層風バーブ・経路 ETE の風補正オプション（非商用枠・帰属。詳細は `docs/05`・`02`）

### Cursor MCP

開発者向けの MCP 設定（**Cursor Marketplace** の `plugin-*` と手動 `mcp.json` の使い分け、Chrome DevTools、法令検索（hourei）、Serena、Vercel、GitHub、トラブルシューティング）は **[13_Cursor_MCP_Setup.md](13_Cursor_MCP_Setup.md)** に集約した。

### SWIM / デジタルノータム（参考）

- **フォルダ:** [SWIM_Portal/README.md](SWIM_Portal/README.md) — 国土交通省航空局 SWIM の API 共通編・デジタルノータムリクエスト（S2019）等の **Markdown 転記**と索引（付録 04 転記は `API連携仕様書(DigitalNOTAM).md` 等）。
- **実装状況:** Planning 地図から **`/api/swim-notam-search`** 経由で取得（サーバに `SWIM_LOGIN_ID` / `SWIM_LOGIN_PASSWORD`、任意 `SWIM_SEARCH_USER_ID`）。**`npm run dev`** では `vite/devWeatherApiPlugin.ts` が同 API を処理（`.env.local`）；**`npm run dev:weather`** でも `scripts/dev-weather-server.ts` が提供。
- **応答・UI（要約）:** サーバが AIXM XML から **`headline` / 期間 / 場所・高度 / `featureLabel` / `detailNotes` / `geometry`（GeoJSON・参考）/ `rawXml`（上限付き）** を組み立て。ポップアップでは **カード表示**、**詳細・原文 XML は折りたたみ**、**「地図に表示」** で Leaflet オーバーレイ（閉じると消去）。負荷軽減時は API クエリ **`includeRawXml=0`**（クライアントは `fetchSwimNotams({ includeRawXml: false })`）。
- **コード索引:** `api/swim-notam-search.ts`、`api/lib/swimNotamCore.ts`、`api/lib/swimNotamGeometry.ts`、`api/lib/swimNotamHttpShared.ts`；フロント `src/services/swimNotam.ts`、`map/popups/swimNotamPopup.ts`、`swimNotamMapOverlay.ts`。**詳細は [05_設計仕様書.md](05_設計仕様書.md) の NOTAM 節。** 仕様の正本は PDF／ポータル。

---

## 🏗️ プロジェクト構造（重要）

リポジトリ全体のフォルダ索引は **[FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)**。`src/` 以下の配置ルールとモジュールの正本は **[07_コンポーネント構造ガイド.md](07_コンポーネント構造ガイド.md)**。

---

## 📊 現在の実装状況（2026年2月）

**KPI・Phase 表の単一ソース**: 優先度・未完了項目の詳細は **[03_計画改善ロードマップ.md](03_計画改善ロードマップ.md)** を正とする。以下は要約（数値は 03・シラバスと同期）。

### ✅ 完了済み機能

- ✅ レイアウト基盤（MarketingLayout、AppLayout）。MarketingLayout: ヘッダー `NavLink` アクティブ表示・ロゴコントラスト・モバイルフォーカス管理・`UserMenu` をパネルトークンに統一、`/profile?tab=` 連携（2026-03）
- ✅ ゲーミフィケーション（統合ランクシステム、XP、ミッション、ストリーク、達成通知）
- ✅ Gallery（イベント管理、いいね機能、承認制）
- ✅ ランクシステム統合（PPL中間ランク + XPベースランク）
- ✅ 経験値（XP）システム（記事読了時のXP付与、カテゴリ別設定）
- ✅ エンゲージメント追跡（ストリーク、達成）
- ✅ 管理者ページ（ランク条件・XP設定編集）
- ✅ デュアルテーマ、MarketingLayout統合、リポジトリ整理
- ✅ 進捗管理（セクションベース）、進捗可視化、学習ダッシュボード（XP 相対位置 RPC・任意参加ランキングは [05](05_設計仕様書.md) ダッシュボード節）
- ✅ Flight Planning（Waypoint 単一パネル3モード、ツールバー JSON/下書き確認、最終保存表示、地図ヘルプ、経路・燃料、A4印刷）
- ✅ 記事システム（MDX、全記事閲覧可、テスト結果からの推奨記事＋ゲスト向け登録 CTA、KaTeX、コメント）
- ✅ CI/CD（GitHub Actions: test、verify-build）

### 📝 今後の開発（[03_計画改善ロードマップ.md](03_計画改善ロードマップ.md) v4.0）

**直近のフォーカス**: **CPL 記事 Phase 1（19本）の執筆**、テストカバレッジの段階的上げ、PPL 記事の継続（二次・リンク先整備）。

- ⏳ **CPL 記事**: Phase 1 **0/19** — Phase B 末 **5/19 以上**、Phase C 末 **10/19 以上**、Phase D 末 **19/19** を目標
- ⏳ **PPL 記事**: 17/150（11.3%）— 二次 KPI（2026年末 50% は [03](03_計画改善ロードマップ.md) 参照）
- ⏳ テストカバレッジ: 目標 30%（Phase B）→ 50%（Phase D）。**実測は `npm run test:coverage` と [vitest.config.ts](../vitest.config.ts) を正とする**
- ✅ エラー監視: Sentry 導入済み（DSN設定で有効化）
- ⏳ アクセス解析の導入（Phase B）
- ⏳ Flight Academy ブランド移行（Phase C: 2026年6月〜）
- ⏸️ ランキング機能（Phase D）
- ⏸️ LMS 目標設定・弱点分析（Phase D / E）
- ⏸️ PWA 最適化（Phase C）

---

## 🔧 開発環境・ツール

### 必須ツール
- **Node.js**: 16.x以上
- **npm**: 7.x以上
- **Git**: バージョン管理
- **Cursor IDE**: 推奨（AI統合開発環境）

### 開発コマンド
```bash
# 開発サーバー起動
npm run dev          # フロント（5173）＋ Vite 上で /api/opensky-states・/api/weather（キーなしは天気モック）・/api/aviation-weather（METAR/TAF）
npm run dev:weather  # 任意: 3001（RainViewer 等その他 /api プロキシ用）
# 任意: npm run dev:full（vercel dev + API 直 3000）— 初回は npx vercel link、詳細は docs/02_技術開発ガイド.md

# テスト
npm test             # ウォッチモード
npm run test:run     # 1回実行
npm run test:coverage  # カバレッジ生成
npm run test:e2e      # Playwright（初回: npx playwright install chromium。webServer が build + preview で CPL スタブ記事を開くテスト含む。CI 時は既存 preview を再利用しない）

# ビルド・デプロイ
npm run build        # 本番ビルド
npm run lint         # Lintチェック
```

### CI/CD設定
- **GitHub Actions**: プルリクエスト・プッシュ時に自動実行
  - Lint、テスト、ビルド、カバレッジレポート
- **テストカバレッジ**: プルリクエストに自動コメント
- **リリース前（MCP）**: [docs/ops/MCP_RELEASE_CHECKLIST.md](ops/MCP_RELEASE_CHECKLIST.md)

---

## 🎨 デザインシステム

### テーマ戦略
- **Cockpit Academy**: ダークネイビー + エアフォースブルー基調（`#0B1220`, `#7DAAF7`）
- **AppLayout**: HUD補助アクセント（`#8FD3FF`）、計器風の緑（`#7CFFB2`）

### 共通UIコンポーネント
- `Button`, `Card`, `Typography`, `Tabs` など（`src/components/ui/`）

---

## 🗄️ データベース（Supabase）

### 主要テーブル
- **profiles**: ユーザープロファイル（ランク、XP含む）
- **learning_contents**: 学習記事メタデータ
- **learning_progress**: 学習進捗（セクションベース）
- **learning_sessions**: 学習セッション（クイズ・記事の学習時間、ヒートマップ・今週の学習時間の元データ）
- **user_learning_profiles**: 学習プロファイル（継続日数、ブートストラップ済み）
- **unified_cpl_questions**: CPL試験問題（verified ベースで出題）。**`applicable_exams`**（`PPL` / `CPL` / `ATPL`）で `/test` の PPL 基礎フィルタ。パイロット手順は [db/APPLICABLE_EXAMS_PILOT.md](db/APPLICABLE_EXAMS_PILOT.md)
- **learning_test_mapping**: 記事と統一設問の対応（`unified_cpl_question_ids`）
- **quiz_sessions**: クイズセッション（解答・スコア）
- **user_test_results**: テスト結果（科目・サブ科目・正誤）
- **user_weak_areas**, **user_unified_srs_status**: 苦手分野・SRS 状態
- **missions**, **user_missions**: ゲーミフィケーション
- **ppl_rank_definitions**, **user_ppl_ranks**: PPL ランク定義と付与
- **streak_records**: 連続学習日数追跡（2025年1月実装）
- **user_achievements**: マイルストーン報酬（2025年1月実装）
- **rank_requirements**: ランク条件管理（2025年1月実装）

**レガシー削除（2026年4月）**: 分析系・旧 CPL ステージング・**ギャラリー／ショップ／purchase_history／migration_log** 等。正本は [05_設計仕様書.md](05_設計仕様書.md)「DB スリム化」と `scripts/database/20260411_drop_*.sql`。

**残る 0 行付近テーブル（監視用）**: `learning_content_likes`, `streak_records`, `user_achievements`, `user_unified_srs_status` 等はコード参照ありのため温存。追加 DROP 時は Supabase MCP で FK・行数を確認すること。

### セキュリティ
- **RLS（Row Level Security）**: 全テーブルに適用
- **認証**: Supabase Auth（メール/パスワード）

---

## 📚 ドキュメント構成と読み方

### 🎯 AIアシスタント向け推奨読み順

1. **このREADME.md** - プロジェクトの全体像を把握
2. **[00_Flight_Academy_Strategy.md](00_Flight_Academy_Strategy.md)** - プロジェクトの戦略（独立運営、CPL 主軸、PPL/CPL 記事の棲み分け、3本柱）
3. **[03_計画改善ロードマップ.md](03_計画改善ロードマップ.md)** - Phase A-Eの実行計画とKPI
4. **[01_プロジェクト概要ガイド.md](01_プロジェクト概要ガイド.md)** - 機能一覧と技術スタック詳細
5. **[02_技術開発ガイド.md](02_技術開発ガイド.md)** - 開発環境、コーディング規約、実装詳細
6. **[07_コンポーネント構造ガイド.md](07_コンポーネント構造ガイド.md)** - コンポーネント配置方針（新規コンポーネント追加時）

### 📖 詳細ドキュメント（必要に応じて参照）

- **[05_設計仕様書.md](05_設計仕様書.md)** - 現行仕様の正本（DB、API、/test、Dashboard）
- **[07_コンポーネント構造ガイド.md](07_コンポーネント構造ガイド.md)** - `src/` 構造の正本（新規コンポーネント追加時）
- **[12_Quiz_Analytics_Phase_Design.md](12_Quiz_Analytics_Phase_Design.md)** - クイズ分析・後続フェーズ
- **[04_運用保守ガイド.md](04_運用保守ガイド.md)** - 運用時の手順、トラブルシューティング
- **[06_記事作成ロードマップ.md](06_記事作成ロードマップ.md)** - MDX記事の作成計画とガイドライン
- **[07_PPL_Master_Syllabus.md](07_PPL_Master_Syllabus.md)** - PPL学科試験対策記事のMaster Syllabus
- **[08_Syllabus_Management_Guide.md](08_Syllabus_Management_Guide.md)** - PPL/CPL統合Syllabus管理ガイド（**分類ツリーの正本は CPL クラスタ**、**問題–記事連携**・`learning_test_mapping` テンプレは同文書内。記事 ID 対照は [11](11_ドキュメント整合性検討.md) §2.4。PPL 工学マッピング投入例: `scripts/database/20260329_learning_test_mapping_incremental_ppl_clusters.sql`。**気象・航法・通信の科目ハブと CPL 系 `learning_contents` 補完**: `scripts/database/20260330_learning_test_mapping_cpl_clusters_by_subject.sql`）
- **[09_CPL_Learning_Stub.md](09_CPL_Learning_Stub.md)** - CPL-Learning-Stub シリーズの索引・クイズ連携の要約（Web からは `/docs/09_CPL_Learning_Stub.md`。`sync:public-docs` 対象）
- **[14_記事単元網羅とバックログ.md](14_記事単元網羅とバックログ.md)** - verified クラスタ数・マッピング済み記事・リポジトリ MDX 突合・未マッピング優先度（`sync:public-docs` 対象）
- **[10_航空工学_学科試験攻略ブログ_ロードマップ.md](10_航空工学_学科試験攻略ブログ_ロードマップ.md)** - 航空工学（AD）科目別ロードマップ
- **[11_ドキュメント整合性検討.md](11_ドキュメント整合性検討.md)** - 06/07/08/10 の役割と相互参照方針
- **[13_Cursor_MCP_Setup.md](13_Cursor_MCP_Setup.md)** - Cursor MCP・Serena・コミットメッセージ関連リンク
- **[FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)** - リポジトリ直下のフォルダ索引

---

## ⚠️ 重要な開発ルール

### コーディング規約
1. **型安全性**: `any`型の使用を避ける（型エラーは修正必須）
2. **コンポーネント配置**: [07](07_コンポーネント構造ガイド.md) の「共通 vs ページ固有」に従う
3. **UI/UX変更**: 事前承認必須（ルールに明記）
4. **パッケージバージョン**: 明示的な承認なしに変更禁止
5. **機密情報**: `.env.local`に保存、コードに直接記述禁止

### Git運用規約
- **コミットメッセージ**: 英語で記述（文字化け対策のため）
  - フォーマット: Conventional Commits形式を推奨（`feat:`, `fix:`, `refactor:`など）

### テスト・品質管理
- **テスト**: 新機能追加時はテストを追加
- **Lint**: コミット前に`npm run lint`で確認
- **CI/CD**: プルリクエスト時に自動実行

### セキュリティ
- **環境変数**: `.env.local`に保存（`.gitignore`に含まれる）
- **RLS**: データベースアクセスはRLSポリシーで保護
- **APIキー**: コードに直接記述せず、環境変数から取得

---

## 🔄 最近の主要変更

### /test・Dashboard・学習時間・プロフィール整備（2026年3月）
- ✅ **/test 科目選択必須**: 全科目一括出題を廃止し、科目選択後にサブ科目・問題数を絞る導線へ変更
- ✅ **クイズフィルタ**: verified ベース出題、サブ科目正規化、優先度順/シラバス順切替、カスタム Listbox でダークテーマ統一
- ✅ **結果画面**: 不正解だけ復習、フラグだけ復習、フラグ+不正解、弱点サブ科目表示
- ✅ **学習時間**: `answeredAt` / `responseTimeMs` を記録し、`learning_sessions` に実測ベースで保存
- ✅ **ヒートマップ**: 縦軸=曜日、横軸=週のカレンダー型、ツールチップに学習分・セッション数
- ✅ **user_learning_profiles ブートストラップ**: 初回クイズ/記事学習時に自動で行を作成（migration: `20260309_bootstrap_user_learning_profiles.sql`）
- ✅ **Dashboard エラー解消**: `getStreakDays` を `.maybeSingle()` に、`getWeakTopics` から `sub_category` 参照を削除

### Supabase learning_contents 登録（2026年3月）
- PPL-1-1-2, PPL-1-1-7, PPL-1-1-10 を `learning_contents` に登録
- SQL: `scripts/database/insert_ppl_1_1_2_7_10.sql`（Supabase Dashboard で実行可能）

### aero-1-2 対気速度 強化編集（2026年3月）
- ✅ **PPL-1-1-2_AirspeedBasics**: CAS/EAS 追加、2%ルール暗算、大砲ラーメン比喩強化、CPL タグ
- ロードマップで編集完了に更新

### aero-2-3 離着陸性能 新規記事（2026年3月）
- ✅ **PPL-1-1-10_TakeoffLandingPerformance**: 密度高度、加速停止距離、50ft障害物、追い風21%の罠（阿蘇あか牛比喩）
- ロードマップ・シラバスを更新

### PPL-1-1-7 V-n線図リライト（2026年3月）
- ✅ **aero-2-2 設計強度**: PPL-1-1-7 を強化（大分団子汁比喩、Va=Accelerated Stall 明記、CPL タグ追加）
- ロードマップ `10_航空工学_学科試験攻略ブログ_ロードマップ.md` で編集完了に更新

### 記事・進捗・ランク関連エラー修正（2026年3月1日）
- ✅ **validateDOMNesting 対策**: MDX の `p` を `<div>` でレンダリング、アフィリエイト枠直前の JSX コメント配置見直し
- ✅ **learning_progress 400 / rank_code 曖昧**: `ON CONFLICT ON CONSTRAINT` で制約名を明示
- ✅ **complete_mission 404 / user_cpl_ranks**: CPL 未実装のため `has_cpl_master := false` 固定
- ✅ **読了判定の簡素化**: TableOfContents のスクロール連動読了を廃止、明示的操作（一覧ボタン・次記事リンク）のみ
- ✅ **アフィリエイト枠レイアウト**: 画像・テキストのバランス調整（全15記事）
- ✅ **文字化け修正**: RelatedArticles、ArticleJsonLd、HomePage
- **ドキュメント**: `04_運用保守ガイド.md` にトラブルシューティングを追加、`mdx-article-guide.mdc` に DOM ネスト回避ルールを追加

### Phase A テスト基盤構築 + エラー監視導入（2026年2月7日）
- ✅ **A-1/A-2: コアロジック + ユーティリティのテスト追加完了**
  - `airspace.ts`: ray casting、MultiPolygon、プロパティフォールバック（16テスト）
  - `streak.ts`: getStreakMultiplier 境界値 + DB操作モック（28テスト）
  - `usePPLRanks`: データ変換、デフォルト値フォールバック、エラーハンドリング（8テスト）
  - `useGamification`: ランク進捗計算、XP計算、RANK_INFO整合性（12テスト）
  - 新規64テスト追加（合計103テスト、10ファイル、カバレッジ: 3.9% → 4.85%）
- ✅ **A-3: Sentry エラー監視導入**
  - `@sentry/react` + `@sentry/vite-plugin` 統合
  - `EnhancedErrorBoundary` を Sentry 連携に更新
  - `logger.ts` のエラーメソッドに Sentry 自動送信を追加
  - ソースマップアップロード対応（CI/CD用）
  - `.env.example` テンプレート追加
- ✅ **A-5: 外部依存機能の正式分類**
  - Shop（リダイレクト済）、Experience（Coming Soon UI）、パイロット紹介（コメントアウト）を**レガシー**として記録（後に [00](00_Flight_Academy_Strategy.md) §6 で戦略ロードマップ外と明文化）
- ✅ **環境変数ファイル整理**
  - `.env.example` を UTF-8 で全変数テンプレートに修正
  - `.env.local` のセクション再構成（クライアント側 / ツール用 / 将来用）
  - `.cursorignore` に `.env.server.local` 除外ルールを再追加
- ✅ **MDX 記事メタデータ・画像記法の統一**
  - 1-2 シリーズ 7 記事の YAML frontmatter を ESM `export const meta` に変換（記事インデックス未登録バグを修正）
  - 全 15 記事のアフィリエイト枠内 `<img>` タグを `<Image>` コンポーネントに統一
  - 記事テンプレート（`docs/templates/PPL_Article_Template.mdx`）を実践的な構成に更新
  - Cursor ルール `mdx-article-guide.mdc`（記事作成ガイドライン）を新規追加
  - Cursor ルール `git-conventions.mdc`（英語コミットメッセージ必須）を新規追加

### 独立プラットフォームへの転換（2026年2月7日〜）
- ✅ **2026-02**: Flight Academy としての独立路線（学習コンテンツ・ツール・ゲーミフィケーションを自前で推進）。コンセプト "Learn, Plan, Fly"。Shop / Experience 等はレガシー扱いへ。
- ✅ **2026-04**: [00](00_Flight_Academy_Strategy.md) **v1.2** — **完全独立運営**（パートナーシップを戦略から除外）、**3本柱**、**CPL 記事最優先**・PPL/CPL 記事の分離と相互リンク。[03](03_計画改善ロードマップ.md) **v4.0**（CPL 主軸 KPI）。

### ACC Sector / RAPCON ポップアップ追加（2026年2月1日）
- ✅ 空域クリック時の詳細表示（周波数・高度範囲のポップアップ）

### バグ修正・改善（2026年1月）
- ✅ FlightPlanner地図タブのレイヤー表示修正（worldCopyJump対応）
- ✅ ランクアップ進捗表示の改善
- ✅ Shopページのエラー修正（ランク参照フォールバック）

### CI/CD・テスト
- ✅ GitHub Actionsワークフロー（test.yml, verify-build.yml）
- ✅ テストカバレッジレポート自動生成
- ✅ Vitest設定最適化

---

## 🚀 クイックスタート（AIアシスタント向け）

### プロジェクトのコンテキストを理解する手順

1. **このREADME.mdを読む** - 全体像を把握
2. **主要ファイルを確認**:
   - `package.json` - 依存関係とスクリプト
   - `vitest.config.ts` - テスト設定
   - `.github/workflows/` - CI/CD設定
   - `src/App.tsx` - ルーティング構造
3. **主要コンポーネントを確認**:
   - `src/layouts/` - レイアウト構造
   - `src/pages/` - ページ構造
   - `src/components/ui/` - デザインシステム
4. **データベース構造を確認**:
   - `src/types/database.types.ts` - 型定義
   - `docs/05_設計仕様書.md` - スキーマ詳細

### コード変更時の注意点

1. **型安全性**: TypeScriptの型エラーは必ず修正
2. **テスト**: 新機能追加時はテストを追加
3. **Lint**: `npm run lint`で確認
4. **コンポーネント配置**: [07](07_コンポーネント構造ガイド.md) の方針に従う
5. **ドキュメント更新**: 重要な変更はドキュメントも更新

---

## 📝 ドキュメント更新について

このプロジェクトでは、`scripts/docs-auto-update/`による自動ドキュメント更新システムが統合されています。

- **自動更新**: Git Hooks経由で自動実行
- **手動更新**: `npm run docs:update`
- **品質チェック**: `npm run docs:validate`

詳細は [docs/scripts/Docs_Auto_Update.md](scripts/Docs_Auto_Update.md) を参照（旧 `scripts/docs-auto-update/README.md` から集約）。

---

## 🔗 関連リンク

- **プロジェクトルート**: [../README.md](../README.md)
- **GitHub Actions**: [.github/workflows/](../.github/workflows/)
- **テスト設定**: [../vitest.config.ts](../vitest.config.ts)
- **フォルダ構造ガイド**: [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)

---

## 📊 プロジェクト統計（2026年2月）

- **テストファイル**: 10ファイル、103テストケース（カバレッジ: 4.85% → 目標50%）
- **ソースファイル**: 155+（.tsx: 112、.ts: 76）
- **コンポーネント**: 34（共通）+ 84（ページ）= 118
- **カスタムフック**: 14ファイル
- **ユーティリティ**: 21ファイル
- **記事数**: 49記事（MDX形式、PPL記事17件含む）— PPL目標: 150記事
- **データベーステーブル**: 20+ テーブル
- **CI/CD**: GitHub Actions（2ワークフロー）
- **現在のPhase**: Phase A（基盤安定化）

---

**最終更新**: 2026年4月11日（ギャラリー・ショップ系削除）  
**バージョン**: Documentation Index v4.13  
**管理者**: Flight Academy 開発チーム
