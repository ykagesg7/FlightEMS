# Flight Academy ドキュメント - AI向けプロジェクトコンテキストガイド

**最終更新**: 2026年2月8日（Phase A-5 完了・環境変数整理）
**バージョン**: Documentation Index v4.1

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
- **Vitest**: テストフレームワーク（103テスト、10ファイル）
- **Testing Library**: Reactコンポーネントテスト
- **GitHub Actions**: CI/CDパイプライン（Lint、テスト、ビルド、カバレッジ）

#### 外部API
- **WeatherAPI.com**: 一般気象情報（要APIキー）
- **NOAA Aviation Weather Center API**: METAR/TAF航空気象データ（無料・認証不要）

---

## 🏗️ プロジェクト構造（重要）

### ディレクトリ構成（ハイブリッド方式）

```
src/
├── components/          # 共通コンポーネント
│   ├── ui/             # デザインシステム（Button, Card, Typography）
│   ├── marketing/      # マーケティング共通（RankBadge, MissionCard）
│   ├── mdx/            # MDX関連（MDXLoader, MDXContent）
│   └── common/         # 汎用ユーティリティコンポーネント
├── pages/              # ページコンポーネント
│   ├── {page}/         # 各ページ
│   └── {page}/components/  # ページ固有コンポーネント
├── hooks/              # カスタムフック
├── stores/             # Zustandストア（authStore）
├── utils/              # ユーティリティ関数
├── types/              # TypeScript型定義
├── layouts/            # レイアウト（MarketingLayout, AppLayout）
└── content/            # MDX記事コンテンツ
    ├── articles/       # 学習記事
    ├── pilot/          # Pilot記事
    └── narrator/       # Narrator記事
```

### コンポーネント配置方針
- **共通コンポーネント**: `src/components/`（複数ページで使用）
- **ページ固有コンポーネント**: `src/pages/{page}/components/`（単一ページ専用）

詳細は [07_コンポーネント構造ガイド.md](07_コンポーネント構造ガイド.md) を参照。

---

## 📊 現在の実装状況（2026年2月）

### ✅ 完了済み機能

- ✅ レイアウト基盤（MarketingLayout、AppLayout）
- ✅ ゲーミフィケーション（統合ランクシステム、XP、ミッション、ストリーク、達成通知）
- ✅ Gallery（イベント管理、いいね機能、承認制）
- ✅ ランクシステム統合（PPL中間ランク + XPベースランク）
- ✅ 経験値（XP）システム（記事読了時のXP付与、カテゴリ別設定）
- ✅ エンゲージメント追跡（ストリーク、達成、購買履歴）
- ✅ 管理者ページ（ランク条件・XP設定編集）
- ✅ デュアルテーマ、MarketingLayout統合、リポジトリ整理
- ✅ 進捗管理（セクションベース）、進捗可視化、学習ダッシュボード
- ✅ Flight Planning（経路計画、燃料計算、A4印刷、エクスポート/インポート）
- ✅ 記事システム（MDX、シリーズアンロック、KaTeX、コメント）
- ✅ CI/CD（GitHub Actions: test、verify-build）

### 📝 今後の開発（ハイブリッド戦略ロードマップに基づく）

現在は **Phase A: 基盤安定化** に位置。詳細は [03_計画改善ロードマップ.md](03_計画改善ロードマップ.md) を参照。

- ⏳ PPL記事: 15/150（10%）— 50%を2026年末目標
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
# 開発サーバー起動（推奨: 2ターミナル方式）
npm run dev:weather  # ターミナル1: APIサーバー（ポート3001）
npm run dev          # ターミナル2: フロントエンド（ポート5173）

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
- **MarketingLayout**: 現在はWhisky Papaブランド（黒×黄色基調）— Phase Cでブランド移行予定
- **AppLayout**: HUD固定スタイル（Dayモード、HUDグリーン `#39FF14`）

### 現行ブランドカラー（Phase Cで変更予定）
- **Primary Yellow**: `#FFD700`
- **Primary Black**: `#121212`
- **HUD Green**: `#39FF14`（Dayモード）

### 共通UIコンポーネント
- `Button`, `Card`, `Typography`, `Tabs` など（`src/components/ui/`）

---

## 🗄️ データベース（Supabase）

### 主要テーブル
- **profiles**: ユーザープロファイル（ランク、XP含む）
- **learning_contents**: 学習記事メタデータ
- **learning_progress**: 学習進捗（セクションベース）
- **unified_cpl_questions**: CPL試験問題
- **user_test_results**: テスト結果
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

- **[03_計画改善ロードマップ.md](03_計画改善ロードマップ.md)** - Phase A-Eの実行計画とKPI
- **[04_運用保守ガイド.md](04_運用保守ガイド.md)** - 運用時の手順、トラブルシューティング
- **[05_設計仕様書.md](05_設計仕様書.md)** - データベース設計、API仕様、UI/UX仕様
- **[06_記事作成ロードマップ.md](06_記事作成ロードマップ.md)** - MDX記事の作成計画とガイドライン
- **[07_PPL_Master_Syllabus.md](07_PPL_Master_Syllabus.md)** - PPL学科試験対策記事のMaster Syllabus
- **[08_Syllabus_Management_Guide.md](08_Syllabus_Management_Guide.md)** - PPL/CPL統合Syllabus管理ガイド

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
- **記事数**: 48記事（MDX形式、PPL記事15件含む）— PPL目標: 150記事
- **データベーステーブル**: 20+ テーブル
- **CI/CD**: GitHub Actions（2ワークフロー）
- **現在のPhase**: Phase A（基盤安定化）

---

**最終更新**: 2026年2月8日（Phase A-5 完了・環境変数整理）
**バージョン**: Documentation Index v4.1
**管理者**: Flight Academy 開発チーム
