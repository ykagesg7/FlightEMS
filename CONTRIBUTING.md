# FlightAcademyTsx - 開発参加ガイド

このドキュメントでは、FlightAcademyTsxプロジェクトへの貢献方法について説明します。バグ報告、機能リクエスト、コード貢献など、プロジェクトに参加するためのガイドラインを提供します。

## 関連ドキュメント
- [基本情報とセットアップ](./README.md)
- [技術仕様と実装詳細](./DOCUMENTATION.md)
- [開発状況と計画](./DEVELOPMENT_STATUS.md)

## クイックスタート

1. リポジトリをフォークする
2. フォークしたリポジトリをクローンする：`git clone https://github.com/あなたのユーザー名/FlightAcademyTsx.git`
3. 依存関係をインストールする：`npm install`
4. 環境変数を設定する：`.env.local`ファイルを作成
5. 開発サーバーを起動する：`npm run dev`

## 環境変数の設定

`.env.example`ファイルを参照し、必要な環境変数を`.env.local`に設定してください。少なくとも以下の変数が必要です：

```
VITE_WEATHER_API_KEY=your_weather_api_key
```

**重要**: APIキーなどの機密情報をコードに直接ハードコードしないでください。常に環境変数を使用してください。

## 開発フロー

1. 新しいブランチを作成する：`git checkout -b feature/あなたの機能名`
2. 変更を加える
3. コードの品質を確認する：`npm run lint`
4. テストを実行する：`npm run test`（※現在テストは実装段階です）
5. 変更をコミットする：`git commit -m "機能の説明"`
6. フォークしたリポジトリにプッシュする：`git push origin feature/あなたの機能名`
7. プルリクエストを作成する

## Cursor.AIとGithub連携

Cursor.AIを活用してGithubとの連携を効率化するための方法を説明します。

### Cursor.AIでのGithub連携設定

1. **リポジトリアクセスの設定**
   - Cursor.AIでプロジェクトを開く
   - 左側のサイドバーから「Source Control」アイコンをクリック
   - 「Clone Repository」を選択し、GitHubリポジトリのURLを入力
   - 必要に応じてGitHubアカウントへの認証を行う

2. **認証設定**
   - GitHubで個人アクセストークン（PAT）を作成：
     - GitHubの設定 > Developer settings > Personal access tokens
     - 必要な権限：`repo`, `workflow`
   - 作成したトークンをCursor.AIの認証設定に追加

### ブランチマージとコンフリクト解決の自動化

#### 基本的なブランチマージフロー

```bash
# masterブランチの最新情報を取得
git fetch origin master

# 現在のブランチ（例：mainブランチ）にいることを確認
git checkout main

# masterブランチをmainブランチにマージする
git merge origin/master

# コンフリクトが発生した場合、解決後にコミット
git add .
git commit -m "Merge master into main"

# リモートリポジトリにプッシュ
git push origin main
```

#### Cursor.AIでのコンフリクト解決

1. **コンフリクトの特定**
   - マージコンフリクトが発生すると、Cursor.AIは該当ファイルをハイライト表示
   - コンフリクトのある各ファイルには `<<<<<<< HEAD`, `=======`, `>>>>>>> master` のマーカーが表示される

2. **AIアシスタントを使った解決**
   - コンフリクトのあるファイルを開く
   - Cursor.AIのAIアシスタントに「コンフリクトを解決してください」と指示
   - AIが提案する解決策を確認し、必要に応じて調整

3. **特定ファイルタイプのコンフリクト処理**
   - **JSONファイル**: 構造の整合性を維持しながら、両方の変更を統合
   - **TypeScriptファイル**: 型定義や依存関係を壊さないよう注意して解決
   - **マークダウンファイル**: 文書構造を保持しながら内容をマージ

4. **自動解決の検証**
   - ファイル内のすべてのコンフリクトマーカーが解消されていることを確認
   - 変更をステージングエリアに追加: `git add <ファイル名>`
   - 変更をコミット: `git commit -m "Resolve merge conflicts"`

### GitHub Actions連携

Cursor.AIとGitHub Actionsを連携させて、自動テストやデプロイを効率化できます：

1. **ワークフローファイルの作成・編集**
   - `.github/workflows/`内のYAMLファイルをCursor.AIで編集
   - AIアシスタントを使用してワークフロー設定を最適化

2. **自動マージワークフローの例**

```yaml
name: Auto Merge Branches

on:
  schedule:
    - cron: '0 0 * * *'  # 毎日UTC 0:00に実行
  workflow_dispatch:     # 手動実行も可能

jobs:
  merge:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v2
        with:
          fetch-depth: 0
      
      - name: Setup Git
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
      
      - name: Merge master into main
        run: |
          git checkout main
          git pull origin main
          git merge origin/master --no-edit || {
            echo "マージコンフリクトが発生しました。手動で解決してください。"
            exit 1
          }
          git push origin main
```

### Cursor.AIを使ったコード品質向上

1. **コードレビュー**
   - コミット前にAIアシスタントにコードレビューを依頼
   - 「このコードをレビューして最適化してください」と質問

2. **バグの特定と修正**
   - エラーメッセージをAIアシスタントに共有して解決策を得る
   - 「このエラーの原因と修正方法を教えてください」と質問

3. **ドキュメント生成**
   - コードからドキュメントを自動生成
   - 「このクラス/関数のドキュメントを生成してください」と依頼

## Issueの作成

新機能の提案やバグ報告を行う場合は、以下のテンプレートに従ってIssueを作成してください：

### バグ報告
```
## バグの説明
どのようなバグが発生したか簡潔に説明してください

## 再現手順
1. '...' に移動
2. '....' をクリック
3. '....' までスクロール
4. エラーを確認

## 期待される動作
どのような動作が期待されるか説明してください

## スクリーンショット
可能であれば、問題を説明するスクリーンショットを追加してください

## 環境情報
 - OS: [例: Windows 10, macOS 11.2]
 - ブラウザ: [例: Chrome 90, Safari 14]
 - アプリバージョン: [例: v1.0.0]
```

### 機能リクエスト
```
## 関連する問題
この機能リクエストがどのような問題を解決するか説明してください

## 提案する解決策
実装してほしい機能について説明してください

## 代替案
検討した他の解決策や機能があれば記載してください

## その他の情報
機能を理解するために役立つ情報やスクリーンショットを追加してください
```

## プルリクエスト

プルリクエストを提出する前に、以下のチェックリストを確認してください：

- [ ] コードはTypeScriptの型安全性に準拠している
- [ ] 新しいコンポーネントはコンポーネント命名規則に従っている
- [ ] コードは既存のスタイルガイドに従っている
- [ ] すべての不要なコンソールログとデバッグコードが削除されている
- [ ] 既存の機能が損なわれていないことを確認した
- [ ] ドキュメントが更新されている（必要な場合）
- [ ] 環境変数の変更がある場合は`.env.example`が更新されている

## コーディング規約

### 命名規則

- **コンポーネント**: PascalCase（例: `FlightParameters.tsx`）
- **関数**: camelCase（例: `calculateDistance`）
- **変数**: camelCase（例: `totalDistance`）
- **定数**: UPPER_SNAKE_CASE（例: `MAX_ALTITUDE`）
- **ファイル名**: コンポーネントはPascalCase、その他はcamelCase

### TypeScript

- 可能な限り`any`型を避け、具体的な型または型定義を使用する
- 複雑なデータ構造には適切なインターフェイスを定義する
- optional chainingを活用して型安全性を確保する
- 非同期操作には適切なエラーハンドリングを実装する

### ファイル構成

- 関連するロジックは適切なディレクトリに配置する
- コンポーネントはできるだけ小さく、再利用可能にする
- ビジネスロジックとUI表示を分離する
- ユーティリティ関数は`utils`ディレクトリに配置する

### スタイリング

- Tailwind CSSのユーティリティクラスを活用する
- コンポーネント特有のスタイルは適切に名前空間を分ける
- レスポンシブデザインを考慮する
- アクセシビリティガイドラインに従う

## データ管理に関する注意事項

### ウェイポイントデータの更新

1. ウェイポイントを編集する場合は、アルファベット別のファイル（例: `waypoints_A.json`）を直接編集してください
2. ファイルを編集した後は、必ずマージスクリプトを実行してください：
   ```
   node scripts/mergeWaypoints.cjs
   ```
3. 地域別ファイルを更新するには、分割スクリプトを実行してください：
   ```
   node public/geojson/split-waypoints-regions.mjs
   ```

### 気象データの扱い

- Weather APIへのリクエストを最小限に抑えるため、キャッシュを利用してください
- WeatherCacheContextを活用して、コンポーネント間でデータを共有してください
- 気象データの取得時には適切なローディング状態を表示してください

## セキュリティガイドライン

- APIキーなどの機密情報をコードに直接含めないでください
- ユーザー入力は適切にバリデーションしてください
- フォーク時にはAPIキーを含む環境変数をリセットしてください
- プルリクエスト内で機密情報が公開されていないことを確認してください

## サポート

質問や支援が必要な場合は、Issueを作成するか、プロジェクト管理者に連絡してください。技術的な議論はIssue内で行うことを推奨します。

---

最終更新日: 2025年3月29日 