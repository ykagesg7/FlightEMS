# FlightAcademyTsx - プロジェクト概要

FlightAcademyTsxは、フライトプランニングとナビゲーション学習を支援するためのインタラクティブなWeb アプリケーションです。本ドキュメントでは、プロジェクトの概要、セットアップ方法、基本的な使い方について説明します。

## プロジェクトの概要

FlightAcademyTsxは、以下の機能を提供します：

- インタラクティブな地図表示（Leaflet.jsベース）
- フライトプランの作成と管理
- 空港、ウェイポイント、NAVAIDの表示と操作
- 気象データの取得と表示
- フライトパラメータの計算
- 学習コンテンツとマニューバービューア
- ユーザー認証とプロファイル管理
- 進捗管理機能
- ページ分割方式によるナビゲーション（React Router）
- ダークモード対応
- **インタラクティブ学習ページ（TACAN進入方式の実践授業）**

## 最近の更新

### 2025年5月の主要アップデート
- **Learning → Test フロー実装**: サイドメニューを廃止し、インタラクティブ学習をLearningページに統合
- **Articlesページ新設**: 既存のブログ記事機能を独立したページに移動し、記事閲覧機能を維持
- **学習体験の改善**: 明確な学習フロー（Learning: 知識インプット → Articles: 詳細記事 → Test: 知識確認）を実現
- **UI/UX簡素化**: 複雑なサイドバーナビゲーションを削除し、直感的な学習体験を提供
- **新記事追加**: 1.6_SeekFirstToUnderstand.mdx（メンタリティーカテゴリー）
- **ソーシャル機能**: 学習記事にいいね・コメント機能を実装
- **フリーミアム機能**: 1.4, 1.5, 1.6記事を無料公開対象に設定
- **認証システム統一**: AuthContextからZustand AuthStoreへの移行完了
- **Supabaseセキュリティ強化**: RLSポリシー、関数のsearch_path設定
- **UI/UX改善**: Learning一覧画面にいいね・コメント数表示、フリーミアムバッジ

### 過去のアップデート
- インタラクティブ学習（TACAN進入方式）ページを新規追加し、Learningページからアクセス可能に
- 既存のFlightAcademyTsxプロジェクトにInteractiveLearningの機能を統合
- ルーティング（/interactive-learning）を追加
- 重複していた設定ファイル等を整理
- React Routerを導入したタブベースからページ分割方式への構造変更
- モバイル表示の余白調整
- ハイライト表示の修正
- テキスト表示の改善
- ダークモードの実装
- 進捗管理機能の実装
- カードレイアウトの改良によるUI/UX向上
- mermaidライブラリの追加によるダイアグラム描画機能
- Supabaseデータベース連携によるユーザー認証・プロファイル管理機能の実装
- Cursor IDE MCPを活用したデータベース操作機能の追加

## セットアップ方法

### 必要条件
- Node.js 16.x以上
- npm 7.x以上

### インストール手順
1. リポジトリのクローン：
```bash
git clone https://github.com/yourusername/FlightAcademyTsx.git
cd FlightAcademyTsx
```

2. 依存関係のインストール：
```bash
npm install
```

3. 環境変数の設定：
`.env.local`ファイルを作成し、以下の内容を追加します：
```
VITE_WEATHER_API_KEY=your_weather_api_key
```

4. 開発サーバーの起動：
```bash
npm run dev
```

5. ブラウザで以下のURLにアクセス：
```
http://localhost:5173/
```

## 基本的な使い方

### マップの操作
- ズームイン/アウト：マウスホイールまたは「+」「-」ボタン
- 移動：マウスドラッグ
- レイヤー切替：右上のレイヤーコントロール

### フライトプランの作成
1. 「Planning」ページに移動
2. 出発空港を選択
3. 目的空港を選択
4. ウェイポイントを追加
5. フライトパラメータを設定
6. フライトサマリーを確認

### 認証とユーザー機能
1. 「ログイン」ボタンをクリック
2. 既存アカウントでログインするか新規登録
3. ログイン後、学習進捗が保存されます
4. プロファイルメニューからプロファイル設定にアクセス可能
5. Learning機能は認証ユーザーのみ利用可能

### マニューバービューアの使用
1. 「Learning」ページに移動
2. マニューバーが含まれるスライドに移動
3. ビューアで機動を確認し、再生/一時停止/リセットボタンで操作

## 技術スタック

- **フロントエンド**: React, TypeScript, Vite, Tailwind CSS
- **マップ表示**: Leaflet.js
- **状態管理**: React Context API
- **ルーティング**: React Router
- **データ形式**: GeoJSON
- **APIクライアント**: Axios
- **認証・データベース**: Supabase (PostgreSQL), Supabase Auth
- **開発ツール**: Cursor IDE (MCP機能による直接DB操作)
- **ドキュメント**: MDX, Mermaid

## ユーザーロール

FlightAcademyTsxでは3つのユーザーロールを定義しています：

1. **Student** - 学生ユーザー（デフォルト）
   - 学習コンテンツへのアクセス
   - 進捗の追跡
   - クイズの受験

2. **Teacher** - 教師ユーザー
   - 学生の進捗の確認
   - フィードバックの提供

3. **Admin** - 管理者ユーザー
   - システム全体の管理
   - お知らせの投稿

## ドキュメント構成

本プロジェクトのドキュメントは以下のように構成されています：

### プロジェクト基本情報
- **README.md** (本ドキュメント): プロジェクト概要、セットアップ、基本的な使い方
- **FEATURES.md**: 機能詳細ガイド、ソーシャル機能、フリーミアム機能
- **ROADMAP.md**: 今後の開発計画と長期的なロードマップ

### 開発者向けドキュメント (`development/`)
- **DEVELOPMENT.md**: 開発プロセス、Git連携、Supabase連携
- **CONTRIBUTING.md**: コントリビューションガイド、コーディング規約
- **ADVANCED.md**: 高度な機能、図表作成機能、AIエージェント自動化
- **process/**: 詳細な開発プロセスドキュメント（要件定義、DB設計、API仕様等）

### ガイド・チュートリアル (`guides/`)
- **LOGICAL_PRESENTATION_SQL_GUIDE.md**: SQLガイド
- **MANUAL_SQL_EXECUTION.md**: 手動SQL実行ガイド
- **MARKITDOWN_SETUP.md**: MarkItDownセットアップガイド

### トラブルシューティング (`troubleshooting/`)
- **authentication-issues.md**: 認証関連のトラブルシューティング
- **REACT_COMPONENTS.md**: Reactコンポーネント関連の問題解決

## ライセンス

本プロジェクトは[MIT License](../LICENSE)の下で公開されています。

---

最終更新日: 2025年5月27日
