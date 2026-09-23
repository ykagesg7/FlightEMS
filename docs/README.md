# Flight Academy ドキュメント索引

**最終更新**: 2026-09-23（段階2 正本に整理。旧計画・スナップショット文書は削除）  
**バージョン**: Documentation Index v6.0

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
| シラバス・記事 ID | [08_Syllabus_Management_Guide.md](08_Syllabus_Management_Guide.md)、[09_CPL_Learning_Stub.md](09_CPL_Learning_Stub.md)、[db/CPL_KPI_and_Database_Operations.md](db/CPL_KPI_and_Database_Operations.md) |
| 仕様・実装 | [02_System_Spec.md](02_System_Spec.md)、[03_Development_Guide.md](03_Development_Guide.md)、[Component_Structure_Guide.md](Component_Structure_Guide.md)、[FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)、[GeoJSON_Waypoints_And_Assets.md](GeoJSON_Waypoints_And_Assets.md)、[Flight_Debrief_Tools.md](Flight_Debrief_Tools.md) |
| 運用・計測 | [04_Operations_Guide.md](04_Operations_Guide.md)、[ops/Weekly_Telemetry_Review.md](ops/Weekly_Telemetry_Review.md)、[ops/MCP_RELEASE_CHECKLIST.md](ops/MCP_RELEASE_CHECKLIST.md)、[Scripts_Repository_Tooling.md](Scripts_Repository_Tooling.md) |
| ツール・外部仕様 | [Cursor_MCP_Setup.md](Cursor_MCP_Setup.md)、[SWIM_Portal/README.md](SWIM_Portal/README.md)、[templates/README.md](templates/README.md) |

## 更新のしかた

- 正本は `docs/`。`public/docs` は `npm run sync:public-docs` の出力（`prebuild` でも実行）。手編集しない。
- どの文書を直すかは Skill [`docs-sync`](../.cursor/skills/docs-sync/SKILL.md)。`npm run docs:update` / `docs:validate` / `docs:setup` は欠ファイル前提のため実行しない。
- 変更日報を本書に足さない。経緯は `git log -- docs/`。
