# Flight Academy ドキュメント索引

**最終更新**: 2026-09-23（段階2 正本のみ）  
**バージョン**: Documentation Index v7.0

本番: [https://flight-lms.vercel.app/](https://flight-lms.vercel.app/)。リポジトリの入口はルート [README.md](../README.md)、エージェント前提は [AGENTS.md](../AGENTS.md)、UI の正本はルート [DESIGN.md](../DESIGN.md)。

## 読み順

1. [Product_North_Star_and_GTM.md](Product_North_Star_and_GTM.md) §0 — 段階1（完了）/ 段階2（いま）/ 保留
2. [01_Current_Status_and_Roadmap.md](01_Current_Status_and_Roadmap.md) — 段階2 のワークストリームと現在地
3. [Closed_Sprints.md](Closed_Sprints.md) — 完了サマリ・壊してはいけないこと・最終数値
4. [ops/Work_Allocation.md](ops/Work_Allocation.md) — クラウド / ローカル / GrokBot / Actions / Cron の分担
5. 作業に応じて下のハブへ

## ハブ

| ハブ | ドキュメント |
|------|--------------|
| 戦略・段階 | [Product_North_Star_and_GTM.md](Product_North_Star_and_GTM.md)、[01_Current_Status_and_Roadmap.md](01_Current_Status_and_Roadmap.md)、[Closed_Sprints.md](Closed_Sprints.md) |
| 記事・配信 | [05_Content_Pipeline.md](05_Content_Pipeline.md)、[ops/Weekend_Content_Pipeline.md](ops/Weekend_Content_Pipeline.md)、[content_outlines/README.md](content_outlines/README.md)、[ops/Gemini_CP_FN_System_Prompt.md](ops/Gemini_CP_FN_System_Prompt.md)、[ops/Gemini_Memoir_Article_System_Prompt.md](ops/Gemini_Memoir_Article_System_Prompt.md) |
| 実装・構成 | [Component_Structure_Guide.md](Component_Structure_Guide.md)、[FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)、[GeoJSON_Waypoints_And_Assets.md](GeoJSON_Waypoints_And_Assets.md) |
| DB・CPL KPI | [db/CPL_KPI_and_Database_Operations.md](db/CPL_KPI_and_Database_Operations.md)、[scripts/database/INDEX.md](../scripts/database/INDEX.md) |
| 運用・計測 | [ops/Weekly_Telemetry_Review.md](ops/Weekly_Telemetry_Review.md)、[Cursor_MCP_Setup.md](Cursor_MCP_Setup.md) |
| 記事テンプレート | [templates/README.md](templates/README.md) |

## 更新のしかた

- 正本は `docs/`。`public/docs` は `npm run sync:public-docs` の出力（`prebuild` でも実行）。手編集しない。
- どの文書を直すかは Skill [`docs-sync`](../.cursor/skills/docs-sync/SKILL.md)。`npm run docs:update` / `docs:validate` / `docs:setup` は欠ファイル前提のため実行しない。
- 変更日報を本書に足さない。経緯は `git log -- docs/`。
