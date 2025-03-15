# フライトプランナー

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