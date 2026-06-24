# AGENTS.md — FlightAcademyTsx

> Cursor / Codex / CLI 共有のエージェント前提（要約）。**詳細規約は `.cursor/rules`・`docs/`・必要時 `DESIGN.md` に委譲**する。

## 参照の優先順位

1. **UI の見た目・トークン** → リポジトリ直下の **`DESIGN.md`**（実装前に読む）
2. **長文手順・チェックリスト** → **`.cursor/skills/*/SKILL.md`**（例: 記事登録、フライトプラン棚卸し）
3. **隔離した専門プロンプト** → **`.cursor/agents/*.md`**（例: 多角的レビュー、MDX 執筆人格）
4. **パス別の強制ルール** → **`.cursor/rules/*.mdc`**

## プロジェクト概要

PPL/CPL 向け学習コンテンツとフライトプランニング機能を持つ **React + Vite** アプリ。信頼性（学習・計画データ）と既存パターンとの一貫性を優先する。

## 技術スタック（要約）

- フロント: **Vite 5** + **React 18** + **TypeScript（strict）** + **Tailwind CSS**
- ルーティング: **react-router-dom**
- データ・認証: **Supabase**
- テスト: **Vitest** + **Playwright**
- コンテンツ: **MDX**（`remark-gfm` で GFM 表等、`remark-math` + KaTeX 数式）（`src/content/lessons` 等）

## よく使うコマンド

正確にこの文字列を使うこと。

```bash
npm run dev              # Vite 開発サーバー
npm run build            # 本番ビルド（prebuild で public docs 同期あり）
npm run lint             # ESLint
npm run test             # Vitest（ウォッチ）
npm run test:run         # Vitest 単発
npm run test:e2e         # Playwright
npm exec -- tsc -b       # 型チェック（tsconfig プロジェクト参照）
```

## ディレクトリの指針

- 共通 UI・MDX 部品: `src/components/`（[`docs/Component_Structure_Guide.md`](docs/Component_Structure_Guide.md)）
- ページ専用: `src/pages/<feature>/components/`
- ユーティリティ・型: `src/utils/`, `src/types/` など既存配置に合わせる

## トップレベル7本柱（フォルダの俯瞰）

リポジトリ直下で **アプリと仕様を分ける**単位は次のとおり。詳細索引は [`docs/FOLDER_STRUCTURE.md`](docs/FOLDER_STRUCTURE.md)。

| ディレクトリ | 役割 |
|--------------|------|
| **`src/`** | React アプリ（ルーティング・ページ・`src/content` の MDX） |
| **`api/`** | Vercel Serverless（気象・NOTAM 等のプロキシ） |
| **`public/`** | 静的配信（画像、GeoJSON、**同期のみ** `public/docs/*.md`） |
| **`docs/`** | 仕様・運用の**正本**Markdown（`public/docs` は手で編集しない） |
| **`scripts/`** | SQL・CPL CSV 取込・`sync-public-docs`・ウェイポイント補助等 |
| **`e2e/`** | Playwright E2E（`npm run test:e2e`） |
| **`vite/`** | Vite 専用プラグイン（開発時 `/api/*` プロキシ・GA4 ビルド注入等） |

**ルートの単体ファイル**: `vite.config.ts`、`package.json`、`tsconfig*.json`、本ファイル、[DESIGN.md](DESIGN.md)、[README.md](README.md)。

- `package.json` の依存バージョンを **明示承認なしに** 変更しない
- **UI/UX の意図的な変更**は承認なしで行わない（トークン・レイアウト・文言設計）
- 秘密情報をソースに埋め込まない（`.env.local`）
- 型・Lint を悪化させる `any` の多用

## ワークフロー

1. 仕様やユーザー影響が大きい変更では [**`docs-sync`**](.cursor/rules/docs-sync.mdc) に沿って `docs/` 更新要否を確認する
2. PPL/CPL **レッスン MDX** を触るときは [**`mdx-article-guide`**](.cursor/rules/mdx-article-guide.mdc) を前提にする
3. **`learning_contents` 登録**や DB メタ同期は Skill [**`learning-contents-registration`**](.cursor/skills/learning-contents-registration/SKILL.md) を使う
4. コミットメッセージは [**`git-conventions`**](.cursor/rules/git-conventions.mdc)（英語・Conventional Commits）

## サブエージェント（委譲例）

- 平易な構成・構造化応答などの基底ペルソナは **`.cursor/rules/deep-analysis.mdc`**（常時適用）。
- 多角的・監査級の追加深掘りのみ → Composer でエージェント **`deep-analysis`**（`.cursor/agents/deep-analysis.md`）を明示選択。
- 記事のペルソナ・構成を前面に出すとき → `.cursor/agents/mdx-content.md`
- 計画・燃料・安全境界のレビュー限定 → `.cursor/agents/aviation-safety-review.md`

## Cursor Cloud specific instructions

> 将来の Cloud Agent 向け。依存導入は起動時の update script（`npm install`）で済む前提。ここには「非自明な起動・実行の注意点」のみ記す。標準コマンドは `package.json` / README を参照。

- **Node 22** 系で動作（CI も `node-version: 22`）。`engines` 指定はない。
- **Supabase の env は起動時必須**。`src/utils/supabase.ts` は test モード以外で `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` が無いと **throw** する。実 Supabase 認証情報が無い環境では、CI と同じダミー値を `.env.local` に置けば `npm run dev` / `npm run build` は起動する（`.github/workflows/verify-build.yml` 参照）:
  - `VITE_SUPABASE_URL=https://test.supabase.co`
  - `VITE_SUPABASE_ANON_KEY=test-anon-key-ci`
  - `.env.local` は gitignore 対象。Cloud VM では update script では作られないため、未設定なら手動作成が必要。
- ダミー Supabase 値での **動作範囲**: クライアント完結機能（フライトプランニング `/planning` の地図・ルート作成・GPX インポート、記事スタブ表示）は動く。**ログイン・クイズ・進捗など実 DB 依存フローは動かない**（実 Supabase 認証情報が要る）。
- 動作確認の hello-world は `/planning` で出発地・目的地を選びルート線を描く操作が手軽（外部 API 不要）。
- 気象・NOTAM など `/api/*` をフルに使うには、別ターミナルで `npm run dev:weather`（Express, port 3001）を起動してから `npm run dev`（README 推奨構成）。`npm run dev` 単体でも一部 `/api/*` は Vite プラグインで処理される。
- Lint は **警告のみ**で 0 エラー（`eslint .`）。

## 関連ドキュメント

- [DESIGN.md](DESIGN.md) — デザインシステム要約
- [docs/README.md](docs/README.md) — ドキュメント索引・テーマ別ハブ
- [docs/Product_North_Star_and_GTM.md](docs/Product_North_Star_and_GTM.md) — NSM（ALPM）・オンボーディング・PMF・AI・データ・法務 UX
- [docs/Cursor_MCP_Setup.md](docs/Cursor_MCP_Setup.md) — MCP（Supabase / hourei 等）
