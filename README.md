# フライトアカデミー

フライトプランニング用の対話型ウェブアプリケーションです。パイロットや航空学生がフライトルートを計画し、航法データを視覚化するツールを提供します。

## 関連ドキュメント

- [詳細なドキュメント（DOCUMENTATION.md）](./DOCUMENTATION.md) - プロジェクトの詳細な技術仕様と実装ガイド
- [開発状況（DEVELOPMENT_STATUS.md）](./DEVELOPMENT_STATUS.md) - 現在の開発状況と今後の計画

## クイックスタート

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 環境変数の設定

このプロジェクトでは以下の環境変数を使用します：

| 環境変数 | 説明 | 設定場所 |
|----------|------|---------|
| VITE_WEATHER_API_KEY | Weather APIのアクセスキー | `.env.local`（開発）, `.env.production`（本番） |

### 開発環境

1. `.env.local`ファイルを作成し、必要な環境変数を設定します：

```
VITE_WEATHER_API_KEY=あなたのAPIキー
```

2. 開発サーバーを起動します：

```bash
npm run dev
```

### 本番環境へのデプロイ

#### Vercelでのデプロイ

1. [Vercelアカウント](https://vercel.com/)にログインします。

2. 新しいプロジェクトを作成し、GitHubリポジトリを連携します。

3. 「Environment Variables」セクションで以下の環境変数を設定します：
   - `VITE_WEATHER_API_KEY` = あなたのWeather APIキー

4. デプロイを実行します。

#### ローカルでのビルド

```bash
# 本番ビルドを作成
npm run build:prod

# ビルド結果をプレビュー
npm run preview
```

## APIキーの取得方法

Weather APIのキーは[https://www.weatherapi.com/](https://www.weatherapi.com/)で無料アカウントを作成して取得できます。

## ライセンス

このプロジェクトは教育・訓練目的で提供されており、実際のフライトナビゲーションに使用することは推奨されません。 