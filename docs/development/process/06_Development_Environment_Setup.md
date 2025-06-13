# 06 開発環境セットアップ手順

本ドキュメントでは、Web4択問題アプリの開発環境をローカルマシンにセットアップする手順を説明します。

## 1. 前提ツールリスト
以下のツールがローカルマシンにインストールされていることを確認してください。

*   **Node.js**: JavaScriptランタイム (LTSバージョンを推奨、例: v18.x.x または v20.x.x)
    *   確認コマンド: `node -v`
*   **npm** または **yarn**: Node.jsパッケージマネージャー (Node.jsにnpmは同梱。yarnを使用する場合は別途インストール)
    *   確認コマンド: `npm -v` または `yarn -v`
*   **Git**: バージョン管理システム
    *   確認コマンド: `git --version`
*   **Supabase CLI**: Supabaseプロジェクトのローカル開発用ツール
    *   インストール: `npm install supabase --save-dev` (プロジェクトローカル) または `npm install -g supabase` (グローバル)
    *   確認コマンド: `supabase --version` (グローバルインストールの場合) または `npx supabase --version` (プロジェクトローカルの場合)
*   **お好みのコードエディタ**: Visual Studio Code (推奨), WebStorm, etc.
    *   VS Code推奨拡張機能: ESLint, Prettier, Tailwind CSS IntelliSense, Prisma (もしSupabaseスキーマ管理にPrismaを使う場合)

## 2. プロジェクトセットアップ手順 (Vite + React + TypeScript)

1.  **プロジェクトディレクトリの作成と移動**:
    ```bash
    mkdir flight-academy-quiz
    cd flight-academy-quiz
    ```

2.  **Viteプロジェクトの初期化 (React + TypeScript)**:
    ```bash
    npm create vite@latest . -- --template react-ts
    # または
    # yarn create vite . --template react-ts
    ```
    カレントディレクトリ (`.`) にプロジェクトを作成します。

3.  **依存関係のインストール**:
    ```bash
    npm install
    # または
    # yarn install
    ```

4.  **動作確認**:
    ```bash
    npm run dev
    # または
    # yarn dev
    ```
    ブラウザで `http://localhost:5173` (または表示されたポート) を開き、Vite + Reactの初期画面が表示されることを確認します。

## 3. Supabase CLI設定

1.  **Supabase CLIのインストール (プロジェクトローカル推奨)**:
    ```bash
    npm install supabase --save-dev
    # または
    # yarn add supabase --dev
    ```

2.  **Supabaseプロジェクトへのログイン (初回のみ)**:
    ブラウザでSupabaseにログインしている状態で、ターミナルで以下を実行します。
    ```bash
    npx supabase login
    ```
    アクセストークンが発行され、CLIがSupabaseアカウントと連携します。

3.  **Supabaseプロジェクトとのリンク**:
    Supabaseダッシュボードから、対象のFlightAcademyプロジェクトの **Project ID** (または **Reference ID**) をコピーします。
    プロジェクトルートで以下を実行します。
    ```bash
    npx supabase link --project-ref YOUR_PROJECT_ID
    ```
    `YOUR_PROJECT_ID` は実際のIDに置き換えてください。パスワードを求められた場合は、データベースのパスワードを入力します。

4.  **(任意) 既存スキーマのプル**:
    もしリモートのSupabaseプロジェクトに既にテーブルが存在し、ローカルでスキーマ定義を管理したい場合は、スキーマをプルします。
    ```bash
    npx supabase db pull
    ```
    これにより `supabase/migrations` ディレクトリにスキーマ定義ファイルが作成されます。
    *注意: 本プロジェクトでは、`02_Database_Design.md` のDDLを基に、Supabase Studio (Web UI) またはマイグレーションファイルを使ってリモートDBにテーブルを作成することを想定しています。ローカルでのマイグレーション管理を厳密に行う場合は、`supabase db push` や `supabase migration new` コマンドを活用します。*

5.  **環境変数の設定**:
    SupabaseプロジェクトのAPI URLとanonキーを取得します。
    *   Supabaseダッシュボード > Project Settings > API
        *   Project URL
        *   Project API keys > `anon` `public` キー

    プロジェクトルートに `.env` ファイルを作成し、以下のように記述します:
    ```
    VITE_SUPABASE_URL=YOUR_SUPABASE_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```
    `YOUR_SUPABASE_URL` と `YOUR_SUPABASE_ANON_KEY` は実際の値に置き換えてください。

    `src` フォルダ内に Supabaseクライアントを初期化するファイル (例: `src/supabaseClient.ts`) を作成します:
    ```typescript
    // src/supabaseClient.ts
    import { createClient } from '@supabase/supabase-js'

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase URL and Anon Key must be defined in .env file");
    }

    export const supabase = createClient(supabaseUrl, supabaseAnonKey)
    ```
    `.gitignore` に `.env` を追加するのを忘れないでください。

## 4. Tailwind CSS設定

1.  **Tailwind CSSと関連パッケージのインストール**:
    ```bash
    npm install -D tailwindcss postcss autoprefixer
    # または
    # yarn add -D tailwindcss postcss autoprefixer
    ```

2.  **Tailwind CSS設定ファイルの生成**:
    ```bash
    npx tailwindcss init -p
    ```
    これにより `tailwind.config.js` と `postcss.config.js` がプロジェクトルートに生成されます。

3.  **`tailwind.config.js` の設定**:
    `content` プロパティを編集して、Tailwindがスキャンするファイルを指定します。
    ```javascript
    // tailwind.config.js
    /** @type {import('tailwindcss').Config} */
    export default {
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}", // src配下の全てのコンポーネントファイルが対象
      ],
      theme: {
        extend: {}, // ここでカスタムテーマを定義できます
      },
      plugins: [],
    }
    ```

4.  **メインCSSファイルへのTailwindディレクティブの追加**:
    `src/index.css` (または `src/main.css` など、ViteプロジェクトのメインCSSファイル) の内容を以下のように変更（または追記）します。
    ```css
    /* src/index.css */
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```

5.  **メインCSSファイルのインポート確認**:
    `src/main.tsx` (Vite + React + TS のエントリーポイント) で、上記のCSSファイルがインポートされていることを確認します。通常はデフォルトでインポートされています。
    ```typescript jsx
    // src/main.tsx
    import React from 'react'
    import ReactDOM from 'react-dom/client'
    import App from './App.tsx'
    import './index.css' // この行があることを確認

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
    ```

## 5. 起動方法と確認

1.  **開発サーバーの起動**:
    ```bash
    npm run dev
    # または
    # yarn dev
    ```

2.  **動作確認**:
    *   ブラウザでアプリケーションを開きます。
    *   Tailwind CSSのユーティリティクラスを適当なコンポーネント (例: `src/App.tsx`) に適用してみて、スタイルが反映されるか確認します。
        ```typescript jsx
        // src/App.tsx の例
        function App() {
          return (
            <div className="p-4">
              <h1 className="text-3xl font-bold text-blue-600 hover:text-red-500">
                Hello Flight Academy Quiz with Tailwind CSS!
              </h1>
              {/* Supabaseクライアントのテスト (コンソールに出力) */}
              <button onClick={() => console.log(import.meta.env.VITE_SUPABASE_URL)}>
                Show Supabase URL
              </button>
            </div>
          )
        }
        export default App
        ```
        上記のように変更し、文字が青く太字で表示され、ホバーで赤色に変わればTailwind CSSが正しく設定されています。ボタンクリックでコンソールにSupabase URLが表示されれば、環境変数も読み込めています。

以上で基本的な開発環境のセットアップは完了です。