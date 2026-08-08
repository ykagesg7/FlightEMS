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
6. 土曜・GA4+Sentry 週次レビュー → 正本 [`docs/ops/Weekly_Telemetry_Review.md`](docs/ops/Weekly_Telemetry_Review.md)（現状・課題・解決案を追記。認証は [`docs/Cursor_MCP_Setup.md`](docs/Cursor_MCP_Setup.md)）

## サブエージェント / Skills

| 用途 | 使うもの |
|------|----------|
| 構造化・深掘り（必要時） | Rule `deep-analysis`（Agent Decide）+ agent `deep-analysis` |
| MDX ペルソナ執筆 | agent `mdx-content` |
| フライトプラン手順レビュー | Skill `flight-plan-review` |
| 航空安全の隔離監査 | agent `aviation-safety-review` |
| 完了検証（テスト・抜け漏れ） | agent `verifier` |
| 土曜 Ingest / 日曜 Editorial | `weekend-ingest` / `weekend-editorial` |

組み込み Explore / Bash / Browser は設定不要（ノイズ隔離用）。

危険なシェル（`main`/`master` への force-push 等）は [`.cursor/hooks.json`](.cursor/hooks.json) で拒否。

## 関連ドキュメント

- [DESIGN.md](DESIGN.md)
- [docs/README.md](docs/README.md)
- [docs/Product_North_Star_and_GTM.md](docs/Product_North_Star_and_GTM.md)
- [docs/Cursor_MCP_Setup.md](docs/Cursor_MCP_Setup.md)
