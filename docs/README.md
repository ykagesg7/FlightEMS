# FlightAcademyTsx ドキュメント - AI向けプロジェクトコンテキストガイド

**最終更新**: 2026年1月（PPL記事システム実装、KaTeX数式記法サポート追加）
**バージョン**: Documentation Index v3.2

---

## 🎯 このドキュメントの目的

このドキュメントは、**AIアシスタントがプロジェクトのコンテキストを迅速に理解できるよう**設計された包括的なガイドです。プロジェクトの全体像、技術スタック、現在の実装状況、開発方針を一箇所にまとめています。

---

## 📋 プロジェクト概要（クイックリファレンス）

### プロジェクト名
**FlightAcademyTsx** / **Whisky Papa**（ブランド名）

### プロジェクトの性質
- **タイプ**: フルスタックWebアプリケーション（React + TypeScript + Supabase）
- **目的**: エアロバティックチーム「Whisky Papa」の公式サイト兼パイロット学習プラットフォーム
- **コンセプト**: "Wingman Program" - ファンを「観客」から「僚機（Wingman）」へと育てる体験型プラットフォーム

### 主要機能
1. **学習コンテンツ管理**: MDXベースの記事システム（PPL/CPL統合）、進捗管理、シリーズ順次アンロック、KaTeX数式記法サポート
2. **テスト・クイズシステム**: CPL試験問題、SRS（間隔反復学習）、進捗追跡
3. **フライトプランニング**: インタラクティブ地図、気象データ（METAR/TAF）、経路計画
4. **ゲーミフィケーション**: ランクシステム（10段階: Fan → Spectator → Trainee → Student → Apprentice → Pilot → Wingman → Ace → Master → Legend）、XP、ミッション、ストリーク、達成通知
5. **エンゲージメント**: ショップ、ギャラリー、ブログ、体験搭乗予約（Coming Soon）

### 技術スタック（2025年1月現在）

#### フロントエンド
- **React 18**: Concurrent Mode、Suspense、useTransition
- **TypeScript**: 型安全性重視（`any`型の使用を避ける）
- **Vite**: 高速ビルド、動的チャンク分割
- **Tailwind CSS**: ユーティリティファースト、Whisky Papaブランドカラー（黒×黄色）

#### バックエンド・インフラ
- **Supabase**: PostgreSQL、認証、リアルタイム機能、ストレージ
- **Vercel**: デプロイメント、Serverless Functions（APIプロキシ）

#### テスト・CI/CD
- **Vitest**: テストフレームワーク（39テスト、6ファイル）
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

## 📊 現在の実装状況（2025年1月）

### ✅ 完了済み機能

#### Phase 1-3: コア機能（100%完了）
- ✅ ブランド基盤（MarketingLayout、AppLayout）
- ✅ ゲーミフィケーション（10段階ランク、XP、ミッション、ストリーク、達成通知）
- ✅ エンゲージメント（ショップ、ギャラリー、ブログ）

#### Phase 5: ゲーミフィケーション拡張（2025年1月完了）
- ✅ ランクシステム10段階化
- ✅ 経験値（XP）システム（記事読了時のXP付与、カテゴリ別設定）
- ✅ エンゲージメント追跡（ストリーク、達成、購買履歴）
- ✅ ランク条件管理（複数条件・OR条件対応）
- ✅ 管理者ページ（ランク条件・XP設定編集）

#### Phase 4.5-4.7: 設計システム・統合（100%完了）
- ✅ デュアルテーマ戦略（Marketing/App）
- ✅ MarketingLayout統合
- ✅ リポジトリ整理

#### Phase 5: Advanced LMS（約60%完了）
- ✅ 進捗管理（セクションベース）
- ✅ 進捗可視化（ProgressRing、ProgressSidebar）
- ✅ 学習ダッシュボード
- ⏸️ 目標設定機能（未実装）
- ⏸️ 弱点分析機能（未実装）

#### Phase 4: Real Experience（約30%完了）
- ✅ Coming Soonページ
- ✅ ランク制限ロジック
- ⏸️ 予約フォーム（承認待ち）
- ⏸️ 招集命令演出（承認待ち）

### 📝 未着手機能

#### Phase 6: Content Expansion & Analytics
- ✅ PPL記事システム実装開始（3記事完了: 温度換算、対気速度、ベルヌーイの定理）
- ⏸️ CPL記事拡充（19記事計画中）
- ⏸️ ランキング機能
- ⏸️ PWA最適化

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
- **MarketingLayout**: Whisky Papaブランド（黒×黄色基調）
- **AppLayout**: HUD固定スタイル（Dayモード、HUDグリーン `#39FF14`）

### ブランドカラー
- **Whisky Papa Yellow**: `#FFD700`
- **Whisky Papa Black**: `#121212`
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
2. **[00_WhiskyPapa_Transformation_Guide.md](00_WhiskyPapa_Transformation_Guide.md)** - プロジェクトの方向性と実装計画
3. **[01_プロジェクト概要ガイド.md](01_プロジェクト概要ガイド.md)** - 機能一覧と技術スタック詳細
4. **[02_技術開発ガイド.md](02_技術開発ガイド.md)** - 開発環境、コーディング規約、実装詳細
5. **[07_コンポーネント構造ガイド.md](07_コンポーネント構造ガイド.md)** - コンポーネント配置方針（新規コンポーネント追加時）

### 📖 詳細ドキュメント（必要に応じて参照）

- **[03_計画改善ロードマップ.md](03_計画改善ロードマップ.md)** - 改善計画と実装進捗
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

### テスト・品質管理
- **テスト**: 新機能追加時はテストを追加
- **Lint**: コミット前に`npm run lint`で確認
- **CI/CD**: プルリクエスト時に自動実行

### セキュリティ
- **環境変数**: `.env.local`に保存（`.gitignore`に含まれる）
- **RLS**: データベースアクセスはRLSポリシーで保護
- **APIキー**: コードに直接記述せず、環境変数から取得

---

## 🔄 最近の主要変更（2025年1月）

### フォルダ・コンポーネント整理
- ✅ `src/components/`フォルダの整理（未使用ファイル5件削除）
  - `ErrorBoundary.tsx`削除（`EnhancedErrorBoundary.tsx`が使用中）
  - `layout/`フォルダ削除（未使用コンポーネント2件削除）
  - `common/`フォルダ整理（`FilterTabs.tsx`、`SearchAndTags.tsx`削除）
- ✅ ドキュメント更新（`07_コンポーネント構造ガイド.md`、`FOLDER_STRUCTURE.md`）

### CI/CD統合
- ✅ GitHub Actionsワークフロー追加（`.github/workflows/test.yml`, `verify-build.yml`）
- ✅ テストカバレッジレポート自動生成
- ✅ プルリクエストにカバレッジコメント自動追加

### テスト設定改善
- ✅ Vitest設定最適化（カバレッジ閾値設定）
- ✅ `setupTests.ts`の型エラー修正

### API改善
- ✅ `api/weather.ts`のタイムアウト実装修正（AbortController使用）

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

## 📊 プロジェクト統計（2026年1月）

- **テストファイル**: 6ファイル、39テストケース
- **コンポーネント**: 100+ コンポーネント
- **記事数**: 29記事（MDX形式、PPL記事3件含む）
- **データベーステーブル**: 20+ テーブル
- **CI/CD**: GitHub Actions（2ワークフロー）

---

**最終更新**: 2026年1月（PPL記事システム実装、KaTeX数式記法サポート追加）
**バージョン**: Documentation Index v3.2
**管理者**: FlightAcademy開発チーム
