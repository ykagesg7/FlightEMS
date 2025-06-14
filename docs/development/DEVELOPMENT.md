# FlightAcademyTsx - 開発ガイド

このドキュメントは、FlightAcademyTsxプロジェクトの開発に参加するための包括的なガイドラインを提供します。開発状況、技術的課題、GitHub連携について解説します。

## 目次

1. [開発状況](#開発状況)
2. [技術的課題](#技術的課題)
3. [開発計画](#開発計画)
4. [プロジェクト構造](#プロジェクト構造)
5. [開発環境のセットアップ](#開発環境のセットアップ)
6. [データベース接続](#データベース接続)
7. [Git/GitHub連携](#githubの連携)
8. [Issue・PRの作成方法](#issueprの作成方法)
9. [トラブルシューティング](#トラブルシューティング)

## 開発状況

### 現在の実装状況

#### ✅ 基本機能
- インタラクティブな地図表示（Leaflet.js）
- 基本レイヤー（地図、衛星写真）の切り替え
- オーバーレイレイヤー（空港、制限空域、高高度訓練空域など）の表示
- 空港、ウェイポイント、NAVAIDの表示と対話機能
- フライトパラメータ（速度、高度、出発時間）の設定と計算
- フライトプランの作成と管理（出発地、経由地、目的地）
- ウェイポイントのマップ上からの追加機能
- フライトサマリーの計算（総距離、ETE、ETA）
- ルートセグメントごとの詳細情報の表示
- 出発空港の選択時に地上標高・地上気温を自動設定
- 気象データのキャッシュ機能
- マニューバービューア機能

#### 最近追加された機能
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
- 「ルートに追加」ボタンによるマップ上からのウェイポイント追加
- セグメントごとの詳細情報の計算と表示
- 空港マーカーと気象情報表示の改善
- TASとMachの微調整機能
- ウェイポイントデータの管理改善
- 飛行場データの活用強化
- mermaidライブラリの追加によるダイアグラム描画機能

#### 2025年1月の主要アップデート
- **新記事追加**: 1.6_SeekFirstToUnderstand.mdx（メンタリティーカテゴリー）
- **ソーシャル機能**: 学習記事にいいね・コメント機能を実装
- **フリーミアム機能**: 1.4, 1.5, 1.6記事をフリーミアム対象に設定
- **認証システム統一**: AuthContextからAuthStoreへの移行完了
- **Supabaseセキュリティ強化**: RLSポリシー、関数のsearch_path設定
- **UI/UX改善**: Learning一覧画面にいいね・コメント数表示

## 技術的課題

- **API管理**: 環境変数によるAPIキー管理の改善
- **CORS対応**: WeatherAPIへの直接アクセスのCORS問題
- **UI/UX**: 空港アイコンの視認性向上、マニューバービューアの機能強化
- **パフォーマンス**: 大量のウェイポイントを扱う際の最適化、マニューバーアニメーションの最適化
- **型安全性**: イベントハンドラやコンポーネント間のデータ受け渡しの改善
- **エラーハンドリング**: 気象データ取得失敗時のユーザー向けエラー表示の改善
- **React Componentsのエラー**: 一般的なエラー（未使用の関数や変数）、レンダリングエラー（MDX CalloutBox未定義）、Hooks 使用順序エラーなどの対応

## 開発計画

開発計画の詳細は[ROADMAP.md](./ROADMAP.md)を参照してください。概要は以下の通りです：

- **フェーズ1**: UI/UX改善（コンテンツ一覧表示、ナビゲーション）
- **フェーズ2**: LMS機能の拡張（進捗管理、インタラクティブ要素、コミュニティ機能）
- **フェーズ3**: パフォーマンスとスケーラビリティ（バックエンド/フロントエンド最適化、インフラ改善）
- **フェーズ4**: 新機能開発（モバイルアプリ、高度な分析機能、統合機能）

## プロジェクト構造

```
FlightAcademyTsx/
├── docs/                   # ドキュメント
│   ├── README.md           # プロジェクト概要
│   ├── DEVELOPMENT.md      # 開発ガイド（このファイル）
│   ├── CONTRIBUTING.md     # コントリビューションガイド
│   ├── ADVANCED.md         # 高度な機能・トラブルシューティング
│   ├── ROADMAP.md          # 開発ロードマップ
│   └── troubleshooting/    # トラブルシューティングガイド
├── public/                 # 静的ファイル
│   ├── geojson/            # 地理データ
│   ├── maneuver/           # マニューバーアニメーション
│   └── images/             # 画像ファイル
├── scripts/                # ユーティリティスクリプト
├── src/                    # ソースコード
│   ├── components/         # Reactコンポーネント
│   ├── contexts/           # Reactコンテキスト
│   ├── hooks/              # カスタムフック
│   ├── types/              # TypeScript型定義
│   ├── utils/              # ユーティリティ関数
│   ├── pages/              # ページコンポーネント
│   └── App.tsx             # メインアプリケーション
├── .env.example            # 環境変数テンプレート
├── package.json            # プロジェクト依存関係
└── tsconfig.json           # TypeScript設定
```

## 開発環境のセットアップ

### 必要条件
- Node.js 16.x以上
- npm 7.x以上
- Cursor IDE (推奨)

### 開発環境の構築
1. リポジトリのクローン
```bash
git clone https://github.com/yourusername/FlightAcademyTsx.git
cd FlightAcademyTsx
```

2. 依存関係のインストール
```bash
npm install
```

3. 開発サーバーの起動
```bash
npm run dev
```

## データベース接続

FlightAcademyTsxは、ユーザーデータとコンテンツの管理にSupabaseを使用しています。

### Supabase設定

- **プロジェクト名**: FlightAcademy
- **プロジェクトID**: fstynltdfdetpyvbrswr
- **リージョン**: ap-northeast-1（東京）
- **PostgreSQLバージョン**: 15.8.1.085

### テーブル構造

FlightAcademyのデータベースには以下の主要テーブルがあります：

1. **profiles** - ユーザープロファイル情報
   - 主要フィールド: id, username, email, full_name, avatar_url, roll（Student/Teacher/Admin）
   - 関連テーブル: コメント、投稿、いいね、クイズ結果と関連付け

2. **learning_contents** - 学習コンテンツ管理
   - 主要フィールド: id, title, category, description, order_index, is_freemium
   - 機能: MDXファイルと連携した学習記事の管理、フリーミアム設定

3. **learning_content_likes** - 学習記事のいいね機能
   - 主要フィールド: id, content_id, user_id, created_at
   - 機能: 学習記事に対するいいねの管理

4. **learning_content_comments** - 学習記事のコメント機能
   - 主要フィールド: id, content_id, user_id, content, created_at, updated_at
   - 機能: 学習記事に対するコメントの管理

5. **quiz_questions** - クイズ問題（515問）
   - 主要フィールド: id, category, question, answer1-4, correct, explanation
   - 説明: 航空関連知識のクイズ問題

6. **user_quiz_results** - ユーザーのクイズ回答結果
   - 主要フィールド: id, user_id, question_id, is_correct, answered_at, category
   - 機能: ユーザーのクイズ履歴と成績の追跡

7. **user_progress** - ユーザーの学習進捗
   - 主要フィールド: id, user_id, completed_units, created_at, updated_at
   - 機能: カリキュラムにおけるユーザーの進捗状況の管理

8. **posts** - コミュニティ投稿
   - 主要フィールド: id, user_id, title, content, created_at
   - 関連テーブル: コメント、いいねと関連付け

9. **comments** - コメント情報
   - 主要フィールド: id, post_id, user_id, content, created_at
   - 機能: 投稿に対するコメントの管理

10. **likes** - いいね情報
    - 主要フィールド: id, post_id, user_id, created_at
    - 機能: 投稿に対するいいねの管理

11. **announcements** - お知らせ情報
    - 主要フィールド: id, title, date
    - 機能: 管理者からのお知らせの管理

### Cursorでのデータベース接続

FlightAcademyTsxプロジェクトでは、Cursor IDEのMCP（Model Context Protocol）機能を使用してSupabaseデータベースに接続できます。

```json
// .cursor/mcp.json
{
  "mcpServers": {
    "my_supabase_project": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "YOUR_SUPABASE_ACCESS_TOKEN"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "YOUR_SUPABASE_ACCESS_TOKEN",
        "SUPABASE_PROJECT_ID": "fstynltdfdetpyvbrswr"
      }
    }
  }
}
```

### データベースアクセスコード例

Supabaseクライアントを使用してデータにアクセスする基本的なコード例：

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fstynltdfdetpyvbrswr.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ユーザープロファイルを取得する例
async function getUserProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('roll', 'Student')
    .limit(10);
    
  if (error) {
    console.error('Error fetching profiles:', error);
    return null;
  }
  
  return data;
}

// クイズ問題を取得する例
async function getQuizQuestions(category: string) {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('category', category)
    .limit(20);
    
  if (error) {
    console.error('Error fetching quiz questions:', error);
    return null;
  }
  
  return data;
}
```

## GitHubの連携

### ブランチ戦略

1. **mainブランチ**: 安定版のコードを含む主要ブランチ
2. **feature/\***: 新機能開発用のブランチ
3. **bugfix/\***: バグ修正用のブランチ
4. **release/\***: リリース準備用のブランチ

### 基本的なワークフロー

1. 新しいブランチを作成する：`git checkout -b feature/あなたの機能名`
2. 変更を加える
3. コードの品質を確認する：`npm run lint`
4. テストを実行する：`npm run test`（※現在テストは実装段階です）
5. 変更をコミットする：`git commit -m "機能の説明"`
6. フォークしたリポジトリにプッシュする：`git push origin feature/あなたの機能名`
7. プルリクエストを作成する

### コンフリクト解決

コンフリクトが発生した場合は、以下のステップで解決してください：

1. コンフリクトのあるファイルを特定する
2. コンフリクトマーカー（`<<<<<<< HEAD`, `=======`, `>>>>>>> master`）を確認する
3. 適切な変更を行い、マーカーを削除する
4. 変更をステージングエリアに追加: `git add <ファイル名>`
5. 変更をコミット: `git commit -m "Resolve merge conflicts"`

## Issue・PRの作成方法

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

## トラブルシューティング

開発中に発生する可能性のある一般的な問題と解決策については、以下を参照してください：

- [React コンポーネント トラブルシューティング](./troubleshooting/REACT_COMPONENTS.md)
- 詳細なトラブルシューティングガイドは[ADVANCED.md](./ADVANCED.md)にもあります

### 一般的な問題と解決策

1. **起動時のエラー**: node_modulesを削除し、npm installを再実行してください
2. **APIキーの問題**: 環境変数が正しく設定されているか確認してください
3. **マップが表示されない**: ネットワーク接続やレイヤー設定を確認してください
4. **パッケージの依存関係エラー**: 依存関係を確認し、必要に応じて更新してください
5. **mermaidライブラリの問題**: 必要な依存関係がインストールされているか確認してください

## 開発ログ

### 2025年6月14日 - UI/UX大幅改善

#### 実装した機能

**ArticlesPage 最新記事機能**
- 最新記事3つを動的表示するセクションを追加
- スムーズスクロール機能付きの記事ジャンプ機能
- 2秒間のハイライト効果アニメーション
- 更新日時の人間に優しい表示（「今日更新」「○日前更新」）

**全ページデザイン統一**
- モダンなグラデーション背景を全ページに適用
- 半透明カード効果による深度表現
- ダークモード対応の強化
- 視覚的階層の統一

#### 技術実装詳細

```typescript
// 実装したファイル:
- src/pages/ArticlesPage.tsx (最新記事機能、デザイン統一)
- src/pages/LearningPage.tsx (デザイン統一)
- src/pages/TestPage.tsx (デザイン統一)
- src/App.tsx (ヘッダー・フッターのグラデーション)

// 主要機能:
1. 最新記事抽出アルゴリズム
2. CSS-in-JSによるハイライト効果
3. レスポンシブグラデーションデザイン
4. TypeScriptエラー修正
```

#### パフォーマンス向上

- 未使用変数の整理とeslint-disableの適切な使用
- TypeScriptエラーの完全解消
- ビルド時間の最適化

#### デザインシステム統一

**カラーパレット**:
- Primary: Indigo/Purple グラデーション
- Secondary: Blue/Slate グラデーション  
- Accent: Violet/Purple グラデーション

**レスポンシブ対応**:
- モバイルファースト設計
- タッチデバイス最適化
- 動的グリッドレイアウト

#### 品質管理

- ✅ TypeScriptエラー 0件
- ✅ ビルド成功
- ✅ レスポンシブ対応確認
- ✅ ダークモード動作確認

---

最終更新日: 2025年1月12日
