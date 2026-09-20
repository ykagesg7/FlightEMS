# Flight Academy ドキュメント - AI向けプロジェクトコンテキストガイド

**最終更新**: 2026年9月20日（第2波: ポインタ重複の統合。README/DESIGN はルートに残す）
**バージョン**: Documentation Index v4.75

## AI向けのドキュメント番号（読み方）

- **番号付き `00`〜`06`（`01_Current_Status` … 形式）**は **初動の読み順**を表す。数値正本・詳細手順の一部は、番号外の **Reference**（`08`〜`14` や `PPL_Master`、**`Product_North_Star_and_GTM`** 等、ファイル名に旧番号が残るもの含む）に分かれている。
- **詳細資料・方針メモ**は、英名ファイル（例: `Product_North_Star_and_GTM.md`）や **旧番号付き**の `08`/`10`/`14`（Web 向け `public/docs` 同期用）に置く。記事 ID 対照は [08](08_Syllabus_Management_Guide.md)。
- 迷ったら本 README の **テーマ別ハブ**または **推奨読み順**だけで現在地を掴み、必要に応じて本文内リンクで深掘りする。

## テーマ別ハブ（迷わない導線）

| ハブ | 主なドキュメント |
|------|------------------|
| **Strategy & Product（戦略・プロダクト成長）** | [00_Flight_Academy_Strategy.md](00_Flight_Academy_Strategy.md)、**[Product_North_Star_and_GTM.md](Product_North_Star_and_GTM.md)**（NSM・ALPM・オンボーディング・PMF スライス・AI コンシェルジュ・データ・法務 UX）、[01_Current_Status_and_Roadmap.md](01_Current_Status_and_Roadmap.md) |
| **Content & Curriculum（コンテンツ・シラバス）** | [05_Content_Pipeline.md](05_Content_Pipeline.md)、**[ops/Weekend_Content_Pipeline.md](ops/Weekend_Content_Pipeline.md)**（週末 Ingest／Editorial）、[08_Syllabus_Management_Guide.md](08_Syllabus_Management_Guide.md)（記事 ID 対照含む）、[PPL_Master_Syllabus.md](PPL_Master_Syllabus.md)、[09_CPL_Learning_Stub.md](09_CPL_Learning_Stub.md)、[Article_Coverage_Backlog.md](Article_Coverage_Backlog.md)、[10_航空工学_学科試験攻略ブログ_ロードマップ.md](10_航空工学_学科試験攻略ブログ_ロードマップ.md) |
| **Engineering & Spec（実装・仕様）** | [02_System_Spec.md](02_System_Spec.md)、[03_Development_Guide.md](03_Development_Guide.md)、[Component_Structure_Guide.md](Component_Structure_Guide.md)、[FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)、[GeoJSON_Waypoints_And_Assets.md](GeoJSON_Waypoints_And_Assets.md) |
| **Operations & Quality（運用・品質）** | [04_Operations_Guide.md](04_Operations_Guide.md)、[06_Long_Term_Execution.md](06_Long_Term_Execution.md)（カバレッジ・Lighthouse 運用含む）、[ops/MCP_RELEASE_CHECKLIST.md](ops/MCP_RELEASE_CHECKLIST.md)、[ops/Weekend_Content_Pipeline.md](ops/Weekend_Content_Pipeline.md)、**[ops/Weekly_Telemetry_Review.md](ops/Weekly_Telemetry_Review.md)**（火曜・ISO週・GA4+Sentry 週次レビュー正本）、[Scripts_Repository_Tooling.md](Scripts_Repository_Tooling.md) |
| **Reference & Portal（参考・外部仕様転記）** | [Cursor_MCP_Setup.md](Cursor_MCP_Setup.md)、[SWIM_Portal/README.md](SWIM_Portal/README.md)、[db/CPL_KPI_and_Database_Operations.md](db/CPL_KPI_and_Database_Operations.md)、[content_outlines/README.md](content_outlines/README.md)、[templates/README.md](templates/README.md) |

---

## 🎯 このドキュメントの目的

このドキュメントは、**AIアシスタントがプロジェクトのコンテキストを迅速に理解できるよう**設計された包括的なガイドです。プロジェクトの全体像、技術スタック、現在の実装状況、開発方針を一箇所にまとめています。

### 長期実行計画と完了スプリント

- **[06_Long_Term_Execution.md](06_Long_Term_Execution.md)** — 品質・MDX/DB 整合・クイズ分析・成長/コスト/プライバシー。数値 KPI は [01](01_Current_Status_and_Roadmap.md) を正とする。
- **実行中**: [01](01_Current_Status_and_Roadmap.md) の「2026年9月期」＋ [05](05_Content_Pipeline.md) 週次表。月次計画ファイルは増やさない。
- **完了分（5〜9月）**: [Closed_Sprints.md](Closed_Sprints.md)（全文は Git 履歴）。

### 更新履歴（抜粋）

**方針**: 直近だけ。細目は `git log -- docs/` または [01](01_Current_Status_and_Roadmap.md) 更新履歴。完了スプリントは [Closed_Sprints.md](Closed_Sprints.md)。

- **2026-09-20（docs スリム 第2波）**: `Project_Overview` / `Sustainability_API_Memo` / `Phase_C_Quality_Preparation` / `Docs_Consistency_Decisions` と実装済 W38/W39 カードを削除。ルート README・DESIGN は契約どおりルートに残す。
- **2026-09-20（docs スリム）**: 月次計画 7 本と実装済み Gemini ブリーフを削除。欠ファイルへのリンクを `Closed_Sprints.md` へ。`docs-auto-update` は実行しない（正本は Skill `docs-sync`）。
- **2026-09-20（記事/Quiz XP 403）**: `award_article_read_xp` / `award_quiz_session_xp` を DEFINER impl + INVOKER ラッパー。正本 [02](02_System_Spec.md)。
- **2026-09-20（Quiz Review / 記事読了）**: Review が lapse カードを読める。記事は本文末尾センチネル。正本 [02](02_System_Spec.md)。
- **2026-09-19（W39 配信準備）**: CP-5-3 / 5-4 / 5-5 を **9/20・23・25**。正本 [Contact_Transition_2026](content_outlines/Contact_Transition_2026/README.md)。
- **2026-09-12（W38 配信準備）**: CP-4-2 / 5-1 / 5-2。正本 同上。

## 📋 プロジェクト概要（クイックリファレンス）

### プロジェクト名
**Flight Academy**（リポジトリ名: FlightAcademyTsx）

### 本番 URL（Vercel Production）
- **公開URL**: [https://flight-lms.vercel.app/](https://flight-lms.vercel.app/)（Sentry・GA4 の検証・ストリーム設定の基準）

### プロジェクトの性質
- **タイプ**: フルスタックWebアプリケーション（React + TypeScript + Supabase）
- **目的**: 独立した航空学習プラットフォーム — 学習コンテンツ、実用ツール、コミュニティを提供
- **コンセプト**: "Learn, Plan, Fly" — 航空知識を学び、フライトプランを作り、仲間として飛び立つ
- **戦略**: **完全独立運営** — 外部パートナー承認に依存しない。詳細は [00_Flight_Academy_Strategy.md](00_Flight_Academy_Strategy.md)（**3本柱**: Content / Tools / Community）。**プロダクト成長・NSM・PMF スライス**は [Product_North_Star_and_GTM.md](Product_North_Star_and_GTM.md) を正とする。
- **価値・運営（要約）**: **CPL 学科**受験者をコンテンツの主軸とし、**CPL 記事（Phase 1 完走後は Phase 2・マッピング）を最優先**で拡充。**PPL 記事**は別記事として継続し、CPL 記事から**リンクで基礎復習**可能にする。クイズは **PPL のみ / CPL 範囲**の選択を維持。個人開発の持続可能性・表現上の境界は [00](00_Flight_Academy_Strategy.md) **§2・§3**。**Phase・KPI の数値正本**は [01_Current_Status_and_Roadmap.md](01_Current_Status_and_Roadmap.md) v4.0.8（コンテンツ進捗の補助指標は [Article_Coverage_Backlog.md](Article_Coverage_Backlog.md)）。

### コア機能
1. **学習コンテンツ管理**: MDXベースの記事システム（PPL/CPL統合）、進捗管理（ログインで永続化）、推奨読み順用 `meta.series` / `order`、KaTeX数式記法サポート
2. **テスト・クイズシステム**: CPL 試験問題ベースの出題、**試験範囲フィルタ（PPL のみ等）**、SRS（間隔反復学習）、進捗追跡
3. **フライトプランニング**: インタラクティブ地図、気象データ（METAR/TAF）、経路計画
4. **ゲーミフィケーション**: 統合ランクシステム（Fan → PPL中間ランク → PPL → Wingman → CPL → Ace → Master → Legend）、XP、ミッション、ストリーク、達成通知
5. **コミュニティ**: 記事コメント、外部ギャラリー等へのリンク（アプリ内ギャラリー・Shop は撤去済み）

### 撤去済みレガシー（戦略ロードマップ外）

旧 **Shop / アプリ内ギャラリー / 体験搭乗** ルートとミッション UI、About のコメントアウト紹介ブロックは **2026-04-12 削除**。詳細は [00](00_Flight_Academy_Strategy.md) §6。

### 技術スタック

#### フロントエンド
- **React 18**: Concurrent Mode、Suspense、useTransition
- **TypeScript**: 型安全性重視（`any`型の使用を避ける）
- **Vite**: 高速ビルド、動的チャンク分割
- **Tailwind CSS**: ユーティリティファースト

#### バックエンド・インフラ
- **Supabase**: PostgreSQL、認証、リアルタイム機能、ストレージ
- **Vercel**: デプロイメント、Serverless Functions（APIプロキシ）

#### テスト・CI/CD
- **Vitest**: テストフレームワーク（`npm run test:run`。本数はここに固定しない）
- **Testing Library**: Reactコンポーネントテスト
- **GitHub Actions**: CI/CDパイプライン（Lint、テスト、ビルド、カバレッジ）

#### 外部API
- **WeatherAPI.com**: 一般気象情報（要APIキー）
- **NOAA Aviation Weather Center API**: METAR/TAF航空気象データ（無料・認証不要）
- **RainViewer / Open-Meteo**: 計画地図のレーダー・上層風バーブ・経路 ETE の風補正オプション（非商用枠・帰属。詳細は [02_System_Spec.md](02_System_Spec.md)・[03_Development_Guide.md](03_Development_Guide.md)）

### Cursor MCP

開発者向けの MCP 設定（**Cursor Marketplace** の `plugin-*` と手動 `mcp.json` の使い分け、Chrome DevTools、法令検索（hourei）、任意の **Google Analytics MCP**（公式 pipx と任意 `npx` の経路、`G-…` と数値プロパティ ID の違い）、Serena、Vercel、GitHub、トラブルシューティング）は **[Cursor_MCP_Setup.md](Cursor_MCP_Setup.md)** に集約した。**本番の GA4 タグ・Realtime と MCP の両面確認**は [04_Operations_Guide.md](04_Operations_Guide.md)「GA4」。

### SWIM / デジタルノータム（参考）

- **フォルダ:** [SWIM_Portal/README.md](SWIM_Portal/README.md) — 国土交通省航空局 SWIM の API 共通編・デジタルノータムリクエスト（S2019）等の **Markdown 転記**と索引（付録 04 転記は `API連携仕様書(DigitalNOTAM).md` 等）。
- **実装状況:** Planning 地図から **`/api/swim-notam-search`** 経由で取得（サーバに `SWIM_LOGIN_ID` / `SWIM_LOGIN_PASSWORD`、任意 `SWIM_SEARCH_USER_ID`）。**`npm run dev`** では `vite/devWeatherApiPlugin.ts` が同 API を処理（`.env.local`）；**`npm run dev:weather`** でも `scripts/dev-weather-server.ts` が提供。
- **応答・UI（要約）:** サーバが AIXM XML から **`headline` / 期間 / 場所・高度 / `featureLabel` / `detailNotes` / `geometry`（GeoJSON・参考）/ `rawXml`（上限付き）** を組み立て。ポップアップでは **カード表示**、**詳細・原文 XML は折りたたみ**、**「地図に表示」** で Leaflet オーバーレイ（閉じると消去）。負荷軽減時は API クエリ **`includeRawXml=0`**（クライアントは `fetchSwimNotams({ includeRawXml: false })`）。
- **コード索引:** `api/swim-notam-search.ts`、`api/lib/swimNotamCore.ts`、`api/lib/swimNotamGeometry.ts`、`api/lib/swimNotamHttpShared.ts`；フロント `src/services/swimNotam.ts`、`map/popups/swimNotamPopup.ts`、`swimNotamMapOverlay.ts`。**詳細は [02_System_Spec.md](02_System_Spec.md) の NOTAM 節。** 仕様の正本は PDF／ポータル。

---

## 🏗️ プロジェクト構造（重要）

リポジトリ全体のフォルダ索引は **[FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)**。`src/` 以下の配置ルールとモジュールの正本は **[Component_Structure_Guide.md](Component_Structure_Guide.md)**。

### 「どこが正本か」クイックマップ（コード・データ・SQL）

| 関心事 | 正本 |
|--------|------|
| UI トークン・Profile Hub | ルート **[DESIGN.md](../DESIGN.md)**（`docs/` へ移さない。AGENTS.md 優先順位 1） |
| アプリ挙動・DB・`/test` 等 | **[02_System_Spec.md](02_System_Spec.md)** |
| トップレベル 7 本柱・`vite/`・`e2e`/Playwright の位置付け | **[FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)**、[AGENTS.md](../AGENTS.md) |
| `src/` に置くべき粒度・配置・`pages/planning` の機能マップ | **[Component_Structure_Guide.md](Component_Structure_Guide.md)** |
| 静的 GeoJSON・ウェイポイント運用／ランタイム vs 編集シャード | **[GeoJSON_Waypoints_And_Assets.md](GeoJSON_Waypoints_And_Assets.md)** |
| npm 経由スクリプト・CPL CSV・`scripts/database/` のレイヤとアーカイブ方針 | **[Scripts_Repository_Tooling.md](Scripts_Repository_Tooling.md)**、短く **[../scripts/database/INDEX.md](../scripts/database/INDEX.md)** |

---

## 📊 現在の実装状況

**KPI・Phase 表の単一ソース**: **[01_Current_Status_and_Roadmap.md](01_Current_Status_and_Roadmap.md)**。CPL Phase 1 本文化は **[db/CPL_KPI_and_Database_Operations.md](db/CPL_KPI_and_Database_Operations.md)**。完了スプリントは [Closed_Sprints.md](Closed_Sprints.md)。仕様の詳細は [02](02_System_Spec.md)。

**直近のフォーカス**: **週3本の Articles ドリップ**（[05](05_Content_Pipeline.md)・[ops/Weekend_Content_Pipeline.md](ops/Weekend_Content_Pipeline.md)）。ここへチェックリストを写経しない。

---

## 🔧 開発環境・ツール

### 必須ツール
- **Node.js**: **24.x**（ルート [README.md](../README.md) および `package.json` `engines.node` と一致。Vercel 本番も 24.x）
- **npm**: **9 以上**を推奨
- **Git**: バージョン管理
- **Cursor IDE**: 推奨（AI統合開発環境）

### 開発コマンド
```bash
# 開発サーバー起動
npm run dev          # フロント（5173）＋ Vite 上で /api/opensky-states・/api/weather（キーなしは天気モック）・/api/aviation-weather（METAR/TAF）
npm run dev:weather  # 任意: 3001（RainViewer 等その他 /api プロキシ用）
# 任意: npm run dev:full（vercel dev + API 直 3000）— 初回は npx vercel link、詳細は docs/03_Development_Guide.md

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
- **learning_sessions**: 学習セッション（クイズ・記事の学習時間、ヒートマップ・今日/直近7日の学習時間の元データ）
- **user_learning_profiles**: 学習プロファイル（継続日数、ブートストラップ済み）
- **unified_cpl_questions**: CPL試験問題（verified ベースで出題）。**`applicable_exams`**（`PPL` / `CPL` / `ATPL`）で `/test` の PPL 基礎フィルタ。パイロット手順は [db/CPL_KPI_and_Database_Operations.md](db/CPL_KPI_and_Database_Operations.md)
- **learning_test_mapping**: 記事と統一設問の対応（`unified_cpl_question_ids`）
- **quiz_sessions**: クイズセッション（解答・スコア）
- **user_test_results**: テスト結果（科目・サブ科目・正誤）
- **question_issue_reports**: ユーザーによる問題・解説の報告（`/admin/question-reports` でトリアージ）
- **user_weak_areas**, **user_unified_srs_status**: 苦手分野・SRS 状態
- **missions**, **user_missions**: ゲーミフィケーション
- **ppl_rank_definitions**, **user_ppl_ranks**: PPL ランク定義と付与
- **streak_records**: 連続学習日数追跡（2025年1月実装）
- **user_achievements**: マイルストーン報酬（2025年1月実装）
- **rank_requirements**: ランク条件管理（2025年1月実装）

**レガシー削除（2026年4月）**: 分析系・旧 CPL ステージング・**ギャラリー／ショップ／purchase_history／migration_log** 等。正本は [02_System_Spec.md](02_System_Spec.md)「DB スリム化」と `scripts/database/20260411_drop_*.sql`。

**残る 0 行付近テーブル（監視用）**: `learning_content_likes`, `streak_records`, `user_achievements`, `user_unified_srs_status` 等はコード参照ありのため温存。追加 DROP 時は Supabase MCP で FK・行数を確認すること。

### セキュリティ
- **RLS（Row Level Security）**: 全テーブルに適用
- **認証**: Supabase Auth（メール/パスワード）

---

## 📚 ドキュメント構成と読み方

### 🎯 AIアシスタント向け推奨読み順（コア＋プロダクト成長）

初動は **下記の順**で足りることが多い。品質・分析の長期枠は **[06_Long_Term_Execution.md](06_Long_Term_Execution.md)**。ルートの入口は [README.md](../README.md)（GitHub）と [DESIGN.md](../DESIGN.md)（UI 正本）。

1. **この README.md** — 全体像・テーマ別ハブ
2. **[00_Flight_Academy_Strategy.md](00_Flight_Academy_Strategy.md)** — 戦略・3 本柱・ターゲット
3. **[Product_North_Star_and_GTM.md](Product_North_Star_and_GTM.md)** — NSM（ALPM）・オンボーディング・気象/通信 PMF・AI・データ・法務 UX
4. **[01_Current_Status_and_Roadmap.md](01_Current_Status_and_Roadmap.md)** — Phase / エンジニアリング KPI
5. **[02_System_Spec.md](02_System_Spec.md)** — 現行仕様の正本
6. **[03_Development_Guide.md](03_Development_Guide.md)** — 開発・実装ルール
7. **[04_Operations_Guide.md](04_Operations_Guide.md)** — 本番確認・Sentry/GA4 等
8. **[05_Content_Pipeline.md](05_Content_Pipeline.md)** — 記事パイプラインの入口

### 📖 詳細ドキュメント（必要に応じて参照）

- **[Product_North_Star_and_GTM.md](Product_North_Star_and_GTM.md)** — NSM（ALPM）・二重オンボーディング・気象/通信 PMF スライス・AI コンシェルジュ・学習データ方針・法務 UX 論点
- **[02_System_Spec.md](02_System_Spec.md)** - 現行仕様の正本（DB、API、/test、Dashboard）
- **[Component_Structure_Guide.md](Component_Structure_Guide.md)** - `src/` 構造の正本（新規コンポーネント追加時）
- **[04_Operations_Guide.md](04_Operations_Guide.md)** - 運用時の手順、トラブルシューティング
- **[05_Content_Pipeline.md](05_Content_Pipeline.md)** - MDX記事の作成計画とガイドライン
- **[PPL_Master_Syllabus.md](PPL_Master_Syllabus.md)** - PPL学科試験対策記事のMaster Syllabus
- **[08_Syllabus_Management_Guide.md](08_Syllabus_Management_Guide.md)** - PPL/CPL統合Syllabus管理ガイド（**分類ツリーの正本は CPL クラスタ**、**問題–記事連携**・記事 ID / `aero-*` 対照は同文書。PPL 工学マッピング投入例: `scripts/database/20260329_learning_test_mapping_incremental_ppl_clusters.sql`。**気象・航法・通信の科目ハブと CPL 系 `learning_contents` 補完**: `scripts/database/20260330_learning_test_mapping_cpl_clusters_by_subject.sql`）
- **[09_CPL_Learning_Stub.md](09_CPL_Learning_Stub.md)** - CPL-Learning-Stub シリーズの索引・クイズ連携の要約（Web からは `/docs/09_CPL_Learning_Stub.md`。`sync:public-docs` 対象）
- **[Article_Coverage_Backlog.md](Article_Coverage_Backlog.md)** - verified クラスタ数・マッピング済み記事・リポジトリ MDX 突合・未マッピング優先度（`sync:public-docs` 対象）
- **[10_航空工学_学科試験攻略ブログ_ロードマップ.md](10_航空工学_学科試験攻略ブログ_ロードマップ.md)** - 航空工学（AD）科目別ロードマップ
- **[Cursor_MCP_Setup.md](Cursor_MCP_Setup.md)** - Cursor MCP・Serena・コミットメッセージ関連リンク
- **[FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)** - リポジトリ直下のフォルダ索引

---

## ⚠️ 重要な開発ルール

### コーディング規約
1. **型安全性**: `any`型の使用を避ける（型エラーは修正必須）
2. **コンポーネント配置**: [Component_Structure_Guide.md](Component_Structure_Guide.md) の「共通 vs ページ固有」に従う
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

### Quiz GA4・チャンク復旧・DB クリーンアップ（2026-07-08）
- ✅ **`quiz_session_complete`** に `tab` / `exam` / `content_id` / `subject` を追加（科目別完了率分析）
- ✅ **`chunk_recovery_reload`** GA4 イベント + Home/Planning を `lazyWithRetry` 化、SW キャッシュ **`flight-academy-shell-v3`**
- ✅ Quiz CBT 整合 SQL **5 本**をリポジトリ登録（[`20260528_quiz_*`](../scripts/database/INDEX.md) — verified **2,129**）
- 運用: [04_Operations_Guide.md](04_Operations_Guide.md)（GA4 カスタムディメンション手順）· ファネル: [`artifacts/quiz_hub_funnel_memo_2026-07-08.md`](../artifacts/quiz_hub_funnel_memo_2026-07-08.md)

### PPL Subject 3 Phase 1 完走（2026-07-09）
- ✅ **空中航法 Phase 1 全9本** — [`PPL-3-1-1`](../src/content/lessons/PPL-3-1-1_EarthCoordinatesAndTime.mdx)〜[`PPL-3-3-2`](../src/content/lessons/PPL-3-3-2_SpatialDisorientationBasics.mdx)（Jul 7–9 に **7 本**追加公開）
- ✅ `learning_test_mapping` **+11 行**（`3-3-2` に空間識失調 **22 問**）。`3-3-1` は [PPL-5-4-1](../src/content/lessons/PPL-5-4-1_AirspaceAndFacilitiesOverview.mdx) に mapping 分担
- **次**: Subject 4 通信 [`PPL-4-1-1`](../src/content/lessons/PPL-4-1-1_AirTrafficServicesOverview.mdx) から Phase 1 着手
- 数値正本: [Article_Coverage_Backlog.md](Article_Coverage_Backlog.md) — `learning_contents` **106**・mapping **120 行**・未マッピング **17**

### PPL Subject 3 Phase 1 拡充（2026-07-08）
- ✅ **[PPL-3-1-3](../src/content/lessons/PPL-3-1-3_AeronauticalChartsBasics.mdx)**〜**[PPL-3-2-2](../src/content/lessons/PPL-3-2-2_RadioNavigationOverview.mdx)** 深文化公開 **5 本**（ブロックA完結 + 地文/無線）
- ✅ `learning_test_mapping` **+7 行**（航空図30・風力22・航法計算7・機位2・航法計器1）
- Subject 3 Phase 1 **7/9** — 残り **3-3-1**・**3-3-2**

### PPL Subject 3 着手 + Subject 2/3 深文化（2026-07-07）
- ✅ **[PPL-3-1-1](../src/content/lessons/PPL-3-1-1_EarthCoordinatesAndTime.mdx)**・**[PPL-3-1-2](../src/content/lessons/PPL-3-1-2_NavigationElementsAndAltitude.mdx)** 深文化公開 + `learning_test_mapping`（65 問）
- ✅ Subject 3/4 **MDX スタブ 15 本** + [Gemini 骨子索引](content_outlines/PPL_Navigation_Communication_2026/README.md)
- ✅ **[PPL-2-2-3](../src/content/lessons/PPL-2-2-3_PressureSystemsAndJapanWeather.mdx)** 深文化（気象 Phase 1 系列）

### Profile Hub + MFA 本番（2026-06-21）
- ✅ **Profile Hub**: 4 セクション IA（`profile`/`learning`/`privacy`/`account`）、通知 debounce auto-save、完成度ストリップ
- ✅ **MFA**: Supabase TOTP、ログインゲート（opt-in）、`mfa_required_at_login` デフォルト **false**、リカバリーコード 10 件、ログイン時デバイス紛失フロー
- ✅ **リカバリーコード**: Profile 再発行 **本番確認済**（2026-06-21）— `api/mfa-recovery-codes.ts?action=generate`、AAL2 は JWT `aal` クレーム
- ✅ **アカウント削除**: `POST /api/account/delete`（確認フレーズ + 再認証）
- ✅ **デプロイ**: Vercel 本番（`api/mfa-recovery-codes.ts`、Serverless 10 本）。verify-build OK（`3648940`）
- 仕様: [02_System_Spec.md](02_System_Spec.md) · 運用: [04_Operations_Guide.md](04_Operations_Guide.md) · Vercel 上限: [03_Development_Guide.md](03_Development_Guide.md)

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
- **ドキュメント**: `04_Operations_Guide.md` にトラブルシューティングを追加、`mdx-article-guide.mdc` に DOM ネスト回避ルールを追加

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
- ✅ **2026-04**: [00](00_Flight_Academy_Strategy.md) **v1.2** — **完全独立運営**（パートナーシップを戦略から除外）、**3本柱**、**CPL 記事最優先**・PPL/CPL 記事の分離と相互リンク。[01](01_Current_Status_and_Roadmap.md) **v4.0**（CPL 主軸 KPI）。

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
   - `docs/02_System_Spec.md` - スキーマ詳細

### コード変更時の注意点

1. **型安全性**: TypeScriptの型エラーは必ず修正
2. **テスト**: 新機能追加時はテストを追加
3. **Lint**: `npm run lint`で確認
4. **コンポーネント配置**: [Component_Structure_Guide.md](Component_Structure_Guide.md) の方針に従う
5. **ドキュメント更新**: 重要な変更はドキュメントも更新

---

## 📝 ドキュメント更新について

正本は `docs/`。公開コピーは `npm run sync:public-docs`（`prebuild` でも実行。`public/docs` は手編集しない）。

手順の正本は Skill [`docs-sync`](../.cursor/skills/docs-sync/SKILL.md)。`scripts/docs-auto-update/` と `npm run docs:update` / `docs:validate` / `docs:setup` は欠ファイル `docs/ROADMAP.md` 前提のため **実行しない**。

---

## 🔗 関連リンク

- **プロジェクトルート**: [../README.md](../README.md)
- **GitHub Actions**: [.github/workflows/](../.github/workflows/)
- **テスト設定**: [../vitest.config.ts](../vitest.config.ts)
- **フォルダ構造ガイド**: [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)

---

## 📊 プロジェクト統計

数値の正本は [01](01_Current_Status_and_Roadmap.md)。CPL Phase 1 は [db/CPL_KPI_and_Database_Operations.md](db/CPL_KPI_and_Database_Operations.md)。テスト本数は `npm run test:run`。

---

**最終更新**: 2026年9月20日（docs スリム）  
**バージョン**: Documentation Index v4.74  
**管理者**: Flight Academy 開発チーム
