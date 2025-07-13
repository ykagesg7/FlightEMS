# Flight Academy TSX - Gemini CLI Context

## プロジェクト概要

FlightAcademyTsxは、航空機操縦士向けの学習支援Webアプリケーションです。事業用操縦士（CPL）試験対策を中心とした包括的な学習プラットフォームを提供しています。

## 技術スタック

### フロントエンド
- **React 18** with TypeScript
- **Vite** - ビルドツール
- **Tailwind CSS** - スタイリング
- **React Router Dom 7** - ルーティング
- **Zustand** - 状態管理
- **React Query** - サーバー状態管理

### バックエンド・データベース
- **Supabase** - BaaS（Backend as a Service）
- **PostgreSQL** - データベース
- **Supabase Auth** - 認証システム

### 地図・可視化
- **Leaflet** - 地図ライブラリ
- **React Leaflet** - React統合
- **Chart.js** - グラフ描画
- **Mermaid** - ダイアグラム生成

### 学習コンテンツ
- **MDX** - Markdown + JSX コンテンツ
- **@mdx-js/react** - MDX React統合

## プロジェクト構造

```
src/
├── components/         # Reactコンポーネント
│   ├── auth/          # 認証関連
│   ├── flight/        # 飛行計画・計算
│   ├── learning/      # 学習システム
│   ├── map/           # 地図コンポーネント
│   ├── quiz/          # クイズ・試験
│   └── ui/            # UI コンポーネント
├── content/           # 学習コンテンツ（MDX）
├── hooks/             # カスタムフック
├── pages/             # ページコンポーネント
├── types/             # TypeScript型定義
└── utils/             # ユーティリティ関数

cpl_exam_data/         # 事業用操縦士試験データ
database/              # データベーススキーマとマイグレーション
scripts/               # データ処理・インポートスクリプト
```

## 開発ガイドライン

### コーディング規約

#### TypeScript
- **厳格な型安全性**: `strict: true` を使用
- **関数型プログラミング**: 可能な限り純粋関数を使用
- **命名規則**: 
  - コンポーネント: PascalCase (`FlightPlan`)
  - フック: camelCase with 'use' prefix (`useFlightData`)
  - 定数: UPPER_SNAKE_CASE (`MAX_ALTITUDE`)

#### React
- **関数コンポーネント**: クラスコンポーネントは使用しない
- **Hooks**: 状態管理にhooksを活用
- **Props型定義**: 必ず型を定義

```typescript
interface ComponentProps {
  title: string;
  optional?: boolean;
}

export const Component: React.FC<ComponentProps> = ({ title, optional = false }) => {
  return <div>{title}</div>;
};
```

#### CSS/Styling
- **Tailwind CSS**: 主要なスタイリング手法
- **モジュラーCSS**: コンポーネント固有のスタイルは別ファイル
- **レスポンシブデザイン**: モバイルファーストアプローチ

### データベース操作

#### Supabase クエリ
- **Type-safe**: 自動生成された型を使用
- **エラーハンドリング**: 必ず適切なエラー処理を実装

```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('id', id);

if (error) {
  console.error('Database error:', error);
  return;
}
```

### 航空関連の専門知識

#### 用語・単位
- **高度**: フィート (ft) またはメートル (m)
- **距離**: 海里 (NM) または キロメートル (km)
- **速度**: ノット (kt) または km/h
- **方位**: 度 (°) - 真方位/磁方位を明確に区別

#### データ形式
- **座標**: 度分秒 (DMS) または 十進度 (Decimal Degrees)
- **時刻**: UTC基準
- **周波数**: MHz形式

### 必須チェック項目

新しいコードを作成・修正する際は以下を確認：

1. **型安全性**: TypeScriptエラーがないこと
2. **アクセシビリティ**: ARIA属性やaltテキストの適切な使用
3. **レスポンシブ**: モバイル・タブレット・デスクトップでの動作確認
4. **パフォーマンス**: 不要な再レンダリングの回避
5. **エラーハンドリング**: 適切な例外処理とユーザーフィードバック

### 航空学習システム特有の要件

#### 試験問題・解答の扱い
- **正確性**: 航空法規や技術的な内容は公式資料に基づく
- **著作権**: 引用時は適切な出典明記
- **更新性**: 法規改正に対応できる構造

#### 地図・ナビゲーション
- **精度**: 航空用途に適した精度を維持
- **データソース**: 信頼できる航空情報源を使用
- **更新頻度**: NOTAMやAIPの変更への対応

## プロジェクト固有のコマンド

### 開発環境
```bash
npm run dev              # 開発サーバー起動
npm run build           # プロダクションビルド
npm run lint            # コード品質チェック
```

### データベース
```bash
# カスタムスクリプト（scripts/ディレクトリ）
python import_exam_data.py    # 試験データインポート
node reset-article-stats.js  # 記事統計リセット
```

## 最近の変更点と今後のステップ

### 最近の変更点 (2025年7月13日)

- **テーマ設定の改善**: 
  - `day`, `dark`, `auto` の3種類のテーマを導入。
  - `day` テーマはネイビーブルーの背景と緑色のHUDを、`dark` テーマは黒い背景と赤色のHUDを使用。
  - `auto` テーマは時間帯に応じて `day` と `dark` を自動で切り替える。
  - `ThemeContext.tsx`, `ThemeToggler.tsx`, `tailwind.config.js`, `src/index.css` を更新し、安定したテーマ切り替えロジックと動的なHUDカラーを実現。
- **Vite設定の調整**: 
  - `vite.config.ts` から実験的なビルド機能を一時的に無効化し、HMR (Hot Module Replacement) 関連のエラーを解消。
  - 開発時の二重レンダリングを防ぐため、`src/main.tsx` から `React.StrictMode` を削除。
- **認証関連の修正**: 
  - `AuthButton.tsx` の `signInWithOAuth` 呼び出しから不要な `async/await` を削除し、非同期処理のハンドリングを改善。
- **コードのクリーンアップ**: 
  - `AppLayout.tsx` および `ArticlesPage.tsx` から未使用のインポートやデッドコードを削除し、コードベースを整理。

### 今後のステップ

1.  **Supabase認証のリダイレクトURI設定の確認**: 
    - SupabaseダッシュボードのAuthentication設定にて、`http://localhost:5173` および `http://localhost:5173/` がRedirect URIsに登録されていることを確認してください。これがログイン機能の正常動作に不可欠です。
2.  **テストカバレッジの向上**: 
    - 現在のテストスイート（`vitest`）は導入済みですが、主要なコンポーネントやビジネスロジックに対するテストが不足しています。特に、テーマ切り替えや認証フローなど、ユーザー体験に直結する部分のテストを拡充し、コードの品質と保守性を高めることを推奨します。
3.  **API構成のドキュメント化**: 
    - `vite.config.ts` に `/api` へのプロキシ設定があり、`api/weather.ts` のようなファイルも存在します。これらのAPIエンドポイントの役割、使用方法、認証要件などを明確にドキュメント化することで、新規開発者のオンボーディングをスムーズにし、将来的なメンテナンスを容易にします。

このコンテキストを基に、航空学習システムの特性を理解し、適切な技術的判断とコード生成を行ってください。