# AGENTS.md — FlightAcademyTsx

> Cursor / Codex / CLI 共有のエージェント前提（要約）。詳細は `.cursor/rules`・`.cursor/skills`・`docs/`・必要時 `DESIGN.md` に委譲。

## 参照の優先順位

1. **UI** → `DESIGN.md`
2. **手順・チェックリスト** → `.cursor/skills/*/SKILL.md`
3. **隔離した専門作業** → `.cursor/agents/*.md`
4. **パス別・条件付き制約** → `.cursor/rules/*.mdc`

## コスト運用（Cursor）

- 日常: **Composer 2.5** または **Grok 4.5**（Cursor Models 枠）
- 難設計・法規・航空安全の難問のみ frontier（Other Models）を明示切替
- 調査は Ask、編集が固まったら Agent。単純な1ファイル修正はサブエージェント不要

## プロジェクト概要

PPL/CPL 向け学習コンテンツとフライトプランニングの **React + Vite** アプリ。信頼性（学習・計画データ）と既存パターンとの一貫性を優先。

## 技術スタック（要約）

- Vite 5 + React 18 + TypeScript（strict）+ Tailwind CSS
- react-router-dom / Supabase / Vitest + Playwright
- MDX（`remark-gfm`、`remark-math` + KaTeX）— `src/content/lessons` 等

## よく使うコマンド

```bash
npm run dev          # Vite 開発サーバー
npm run build        # 本番ビルド（prebuild で public docs 同期）
npm run lint         # ESLint
npm run test         # Vitest（ウォッチ）
npm run test:run     # Vitest 単発
npm run test:e2e     # Playwright
npm exec -- tsc -b   # 型チェック
```

## ディレクトリ

| パス | 役割 |
|------|------|
| `src/` | アプリ本体・MDX |
| `api/` | Vercel Serverless |
| `public/` | 静的配信（`public/docs` は同期のみ・手編集しない） |
| `docs/` | 仕様・運用の正本 |
| `scripts/` | SQL・取込・同期スクリプト |
| `e2e/` | Playwright |
| `vite/` | Vite プラグイン |

詳細: [`docs/FOLDER_STRUCTURE.md`](docs/FOLDER_STRUCTURE.md)、[`docs/Component_Structure_Guide.md`](docs/Component_Structure_Guide.md)

## 不変制約（要約）

常時ルール: [`.cursor/rules/core-project.mdc`](.cursor/rules/core-project.mdc)  
（日本語応答、版変更・UI 無断変更禁止、秘密情報は `.env.local`、`any` 多用禁止）

## ワークフロー

1. 大きな仕様/UI/DB/機能変更 → Skill [`docs-sync`](.cursor/skills/docs-sync/SKILL.md)
2. レッスン MDX → [`.cursor/rules/mdx-article-guide.mdc`](.cursor/rules/mdx-article-guide.mdc)（必要なら agent `mdx-content`）
3. `learning_contents` 登録 → Skill [`learning-contents-registration`](.cursor/skills/learning-contents-registration/SKILL.md)
4. コミットメッセージ → Skill [`git-commit-en`](.cursor/skills/git-commit-en/SKILL.md)（英語・Conventional Commits）
5. 週末クリップ整理／週次発信弧 → Skill [`weekend-ingest`](.cursor/skills/weekend-ingest/SKILL.md) / [`weekend-editorial`](.cursor/skills/weekend-editorial/SKILL.md)（正本 [`docs/ops/Weekend_Content_Pipeline.md`](docs/ops/Weekend_Content_Pipeline.md)）
6. 週次記事メール文案 → Skill [`weekly-article-digest`](.cursor/skills/weekly-article-digest/SKILL.md)（送信は明示時のみ）
7. 記事ドリップ公開確認 → Skill [`article-publish-check`](.cursor/skills/article-publish-check/SKILL.md)
8. 火曜・GA4+Sentry 週次レビュー（ISO 週） → 正本 [`docs/ops/Weekly_Telemetry_Review.md`](docs/ops/Weekly_Telemetry_Review.md)。数字は `weekly-telemetry-ga4` の artifact。Facts 通知は `weekly-telemetry-notify`（日本語・`@` なし）。要約 PR は Skill [`weekly-telemetry-review`](.cursor/skills/weekly-telemetry-review/SKILL.md)（merge しない）。L0 マージは `weekly-telemetry-approve`（`APPROVE-DOC`）。L1 許可リストは空。認証は [`docs/Cursor_MCP_Setup.md`](docs/Cursor_MCP_Setup.md)

## サブエージェント / Skills

| 用途 | 使うもの |
|------|----------|
| 構造化・深掘り（必要時） | Rule `deep-analysis`（Agent Decide）+ agent `deep-analysis` |
| MDX ペルソナ執筆 | agent `mdx-content` |
| フライトプラン手順レビュー | Skill `flight-plan-review` |
| 航空安全の隔離監査 | agent `aviation-safety-review` |
| 完了検証（テスト・抜け漏れ） | agent `verifier` |
| 土曜 Ingest / 日曜 Editorial | `weekend-ingest` / `weekend-editorial` |
| 週次 digest 文案 / 公開確認 | `weekly-article-digest` / `article-publish-check` |
| 火曜テレメトリ正本 PR | `weekly-telemetry-review` |

組み込み Explore / Bash / Browser は設定不要（ノイズ隔離用）。

危険なシェル（`main`/`master` への force-push 等）は [`.cursor/hooks.json`](.cursor/hooks.json) で拒否。

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

- [DESIGN.md](DESIGN.md)
- [docs/README.md](docs/README.md)
- [docs/Product_North_Star_and_GTM.md](docs/Product_North_Star_and_GTM.md)
- [docs/Cursor_MCP_Setup.md](docs/Cursor_MCP_Setup.md)
