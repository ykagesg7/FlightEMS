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
1. 「Planning」タブに移動
2. 出発空港を選択
3. 目的空港を選択
4. ウェイポイントを追加
5. フライトパラメータを設定
6. フライトサマリーを確認

### マニューバービューアの使用
1. 「Learning」タブに移動
2. マニューバーが含まれるスライドに移動
3. ビューアで機動を確認し、再生/一時停止/リセットボタンで操作

## 技術スタック

- **フロントエンド**: React, TypeScript, Vite, Tailwind CSS
- **マップ表示**: Leaflet.js
- **状態管理**: React Context API
- **データ形式**: GeoJSON
- **APIクライアント**: Axios
- **ドキュメント**: MDX, Mermaid
- **AI開発支援**: Google Gemini CLI

## ドキュメント構成

本プロジェクトのドキュメントは以下のように構成されています：

- **README.md** (本ドキュメント): プロジェクト概要、セットアップ、基本的な使い方
- **DEVELOPMENT.md**: 開発ガイドライン、コーディング規約、プロジェクト構造
- **ADVANCED.md**: 高度な機能、トラブルシューティング、自動化機能

詳細なAPIドキュメントやコンポーネント仕様については、`src`ディレクトリ内の各ファイルのコメントを参照してください。

## Gemini CLI - AI開発支援ツール

本プロジェクトではGoogle Gemini CLIが統合されており、AI支援による開発効率の向上が可能です。

### 主な機能
- **大規模コードベース解析**: 100万トークンの文脈理解でプロジェクト全体を把握
- **航空専門知識の活用**: 航空学習システム固有の要件に対応した支援
- **マルチモーダル対応**: 画像、PDF、スケッチからのアプリ生成
- **DevOps自動化**: Git操作、PR管理、複雑なリベース処理
- **Google検索統合**: リアルタイム情報取得による回答の最新性確保

### 使用方法

#### 基本起動
```bash
# 直接起動
npm run gemini

# ヘルプ表示
npm run gemini:help

# 自動承認モード（YOLO）
npm run gemini:yolo
```

#### 初回セットアップ
1. **認証**: Googleアカウントでログイン（無料で1日1,000リクエスト、毎分60リクエスト）
2. **テーマ選択**: お好みのカラーテーマを設定
3. **プロジェクトコンテキスト**: `GEMINI.md`ファイルが自動的に航空システムの専門知識を提供

#### 高度な使用（API キー利用）
より高いレート制限が必要な場合：
```bash
# Google AI Studio でAPIキーを取得
# 環境変数を設定（PowerShell）
$env:GEMINI_API_KEY="your_api_key_here"

# または .env.local ファイルに記載
echo "GEMINI_API_KEY=your_api_key_here" >> .env.local
```

#### 航空学習システム向け活用例
```bash
# プロジェクト全体の分析
> このシステムのアーキテクチャの主要な部分を説明してください

# 航空専門機能の実装
> CPL試験の気象分野で新しいクイズコンポーネントを作成してください

# データベースマイグレーション
> 新しい飛行計画機能のためのテーブル設計を提案してください

# バグ修正と最適化
> Leafletマップコンポーネントのパフォーマンス問題を分析してください
```

### プロジェクト固有の設定
- **`.gemini/settings.json`**: MCP設定、GitHub統合、プロジェクト固有の設定
- **`GEMINI.md`**: 航空学習システムのコンテキスト、開発ガイドライン、専門知識
- **自動除外パターン**: `node_modules`, `dist`, `build`などを自動除外

## CPL試験学習資料

本プロジェクトには、事業用操縦士（飛行機）学科試験の学習支援資料が含まれています：

### 構造化学習資料（`cpl_exam_data/converted_md/`）
- **`structured_aviation_engineering.md`** - 航空工学（航空力学、航空機構造、動力装置等）
- **`structured_aviation_weather.md`** - 航空気象（大気の物理、気象障害、気象情報等）
- **`structured_air_navigation.md`** - 空中航法（航法技術、運航方式、ヒューマンファクター等）
- **`structured_aviation_communication.md`** - 航空通信（航空交通業務、管制業務、緊急時通信等）
- **`structured_aviation_regulations.md`** - 航空法規（国際条約、航空法、実務適用等）

各資料には以下の特徴があります：
- 📋 クリック可能な目次機能
- 🎯 重要度に応じた視覚的強調
- 💡 実用的な技能ガイド
- 🔄 他分野との関連性明示
- ⚡ 効率的な学習方法の提案

### 過去問データベース
- 2022年9月〜2025年9月の実際の試験問題
- 各試験回の詳細な問題と解答

## 最近の更新

- **CPL試験学習資料の構造化**: 事業用操縦士学科試験出題範囲を5つの分野別資料に体系化
- mermaidライブラリの追加によるダイアグラム描画機能の実装
- ドキュメント構造の整理（3つの主要ドキュメントに統合）
- 各種コンポーネントのリファクタリングとバグ修正

## ライセンス

本プロジェクトは[MIT License](../LICENSE)の下で公開されています。

---

最終更新日: 2025年4月19日
