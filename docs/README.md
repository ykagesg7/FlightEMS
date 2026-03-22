# Flight Academy ドキュメント - AI向けプロジェクトコンテキストガイド

**最終更新**: 2026年3月（ドキュメント整理・13 MCP 分離）
**バージョン**: Documentation Index v4.8

---

## 🎯 このドキュメントの目的

このドキュメントは、**AIアシスタントがプロジェクトのコンテキストを迅速に理解できるよう**設計された包括的なガイドです。プロジェクトの全体像、技術スタック、現在の実装状況、開発方針を一箇所にまとめています。

---

## 📋 プロジェクト概要（クイックリファレンス）

### プロジェクト名
**Flight Academy**（リポジトリ名: FlightAcademyTsx）

### プロジェクトの性質
- **タイプ**: フルスタックWebアプリケーション（React + TypeScript + Supabase）
- **目的**: 独立した航空学習プラットフォーム — 学習コンテンツ、実用ツール、コミュニティを提供
- **コンセプト**: "Learn, Plan, Fly" — 航空知識を学び、フライトプランを作り、仲間として飛び立つ
- **戦略**: ハイブリッド戦略 — コア機能は独立運営、パートナーシップ（Whisky Papa等）は将来オプション

### コア機能
1. **学習コンテンツ管理**: MDXベースの記事システム（PPL/CPL統合）、進捗管理、シリーズ順次アンロック、KaTeX数式記法サポート
2. **テスト・クイズシステム**: CPL試験問題、SRS（間隔反復学習）、進捗追跡
3. **フライトプランニング**: インタラクティブ地図、気象データ（METAR/TAF）、経路計画
4. **ゲーミフィケーション**: 統合ランクシステム（Fan → PPL中間ランク → PPL → Wingman → CPL → Ace → Master → Legend）、XP、ミッション、ストリーク、達成通知
5. **コミュニティ**: ギャラリー（航空写真投稿）、コメント

### パートナーシップ機能（将来オプション — パートナー確定時に有効化）
- **ショップ**: ランク連動型物販（Whisky Papaパートナーシップ時）
- **体験搭乗**: 予約機能（パートナーシップ時）
- **チーム紹介**: パイロット紹介セクション（パートナーシップ時）

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

開発者向けの MCP 設定（Global / プロジェクトの分担、**Chrome DevTools**、Serena、Vercel、GitHub PAT、トラブルシューティング）は **[13_Cursor_MCP_Setup.md](13_Cursor_MCP_Setup.md)** に集約した。

### SWIM / デジタルノータム（参考）

- **フォルダ:** [SWIM_Portal/README.md](SWIM_Portal/README.md) — 国土交通省航空局 SWIM の API 共通編・デジタルノータムリクエスト（S2019）等の **Markdown 転記**と索引。
- **実装状況:** アプリからの NOTAM 取得は **未接続**（将来はサーバプロキシ・利用申請・AIXM パースを想定）。仕様の正本は PDF／ポータル。

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
- ✅ エンゲージメント追跡（ストリーク、達成、購買履歴）
- ✅ 管理者ページ（ランク条件・XP設定編集）
- ✅ デュアルテーマ、MarketingLayout統合、リポジトリ整理
- ✅ 進捗管理（セクションベース）、進捗可視化、学習ダッシュボード
- ✅ Flight Planning（Waypoint 単一パネル3モード、ツールバー JSON/下書き確認、最終保存表示、地図ヘルプ、経路・燃料、A4印刷）
- ✅ 記事システム（MDX、シリーズアンロック、KaTeX、コメント）
- ✅ CI/CD（GitHub Actions: test、verify-build）

### 📝 今後の開発（ハイブリッド戦略ロードマップに基づく）

現在は **Phase A: 基盤安定化** に位置。詳細は [03_計画改善ロードマップ.md](03_計画改善ロードマップ.md) を参照。

**直近のフォーカス**: PPL 記事の量産・品質、テストカバレッジの段階的上げ。パートナーシップ依存機能（Shop / 体験搭乗等）は **Phase E** まで明示的に後回し（[00](00_Flight_Academy_Strategy.md) 参照）。

- ⏳ PPL記事: 17/150（11.3%）— 50%を2026年末目標
- ⏳ テストカバレッジ: 4.85% — 50%を2026年末目標
- ✅ エラー監視: Sentry 導入済み（DSN設定で有効化）
- ⏳ アクセス解析の導入（Phase B）
- ⏳ Flight Academyブランド移行（Phase C: 2026年6月〜）
- ⏸️ ランキング機能（Phase D）
- ⏸️ LMS目標設定・弱点分析（Phase D）
- ⏸️ PWA最適化（Phase C）
- ⏸️ パートナーシップ機能: Shop/Experience/チーム紹介（Phase E: パートナー確定時）

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

# ビルド・デプロイ
npm run build        # 本番ビルド
npm run lint         # Lintチェック
```

### CI/CD設定
- **GitHub Actions**: プルリクエスト・プッシュ時に自動実行
  - Lint、テスト、ビルド、カバレッジレポート
- **テストカバレッジ**: プルリクエストに自動コメント

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
- **unified_cpl_questions**: CPL試験問題（verified ベースで出題）
- **user_test_results**: テスト結果（科目・サブ科目・正誤）
- **missions**, **user_missions**: ゲーミフィケーション
- **gallery_events**, **fan_photos**: ギャラリー機能
- **streak_records**: 連続学習日数追跡（2025年1月実装）
- **user_achievements**: マイルストーン報酬（2025年1月実装）
- **purchase_history**: 購買履歴・エンゲージメント追跡（2025年1月実装）
- **rank_requirements**: ランク条件管理（2025年1月実装）

### セキュリティ
- **RLS（Row Level Security）**: 全テーブルに適用
- **認証**: Supabase Auth（メール/パスワード）

---

## 📚 ドキュメント構成と読み方

### 🎯 AIアシスタント向け推奨読み順

1. **このREADME.md** - プロジェクトの全体像を把握
2. **[00_Flight_Academy_Strategy.md](00_Flight_Academy_Strategy.md)** - プロジェクトの戦略（ハイブリッド戦略、4本柱、パートナーシップモデル）
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
- **[08_Syllabus_Management_Guide.md](08_Syllabus_Management_Guide.md)** - PPL/CPL統合Syllabus管理ガイド
- **[10_航空工学_学科試験攻略ブログ_ロードマップ.md](10_航空工学_学科試験攻略ブログ_ロードマップ.md)** - 航空工学（AD）科目別ロードマップ
- **[11_ドキュメント整合性検討.md](11_ドキュメント整合性検討.md)** - 06/07/08/10 の役割と相互参照方針
- **[13_Cursor_MCP_Setup.md](13_Cursor_MCP_Setup.md)** - Cursor MCP・Serena・コミットメッセージ関連リンク
- **[FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)** - リポジトリ直下のフォルダ索引

---

## ⚠️ 重要な開発ルール

### コーディング規約
1. **型安全性**: `any`型の使用を避ける（型エラーは修正必須）
2. **コンポーネント配置**: ハイブリッド方式に従う（共通 vs ページ固有）
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
  - Shop（リダイレクト済）、Experience（Coming Soon UI）、パイロット紹介（コメントアウト）をパートナーシップ待ちとして正式記録
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

### ハイブリッド戦略への転換（2026年2月7日）
- ✅ **Flight Academy として独立路線に転換**: Whisky Papaファンサイトから独立した航空学習プラットフォームへ
  - 外部承認に依存する機能（Shop、Experience、パイロット紹介）をパートナーシップ待ちに分類
  - コア機能（学習コンテンツ、ツール、ゲーミフィケーション）は独立して推進
  - コンセプト: "Wingman Program" → "Learn, Plan, Fly"
- ✅ **戦略ドキュメント刷新**: `00_Flight_Academy_Strategy.md`、`03_計画改善ロードマップ.md` を全面書き換え
- ✅ **Phase A-E の新ロードマップ策定**: 現実的なKPIと期限を設定

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
4. **コンポーネント配置**: ハイブリッド方式に従う
5. **ドキュメント更新**: 重要な変更はドキュメントも更新

---

## 📝 ドキュメント更新について

このプロジェクトでは、`scripts/docs-auto-update/`による自動ドキュメント更新システムが統合されています。

- **自動更新**: Git Hooks経由で自動実行
- **手動更新**: `npm run docs:update`
- **品質チェック**: `npm run docs:validate`

詳細は `scripts/docs-auto-update/README.md` を参照してください。

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

**最終更新**: 2026年3月（ドキュメント整理・13 MCP 分離）  
**バージョン**: Documentation Index v4.8  
**管理者**: Flight Academy 開発チーム
