---
name: docs-sync
description: >-
  Decide which docs/ files to update after significant product, UI, DB schema,
  or feature changes. Use when finishing implementation, syncing documentation,
  or when docs-sync rule applies. Triggers: docs更新, 仕様同期, docs-sync.
paths:
  - "docs/**/*.md"
  - "src/**/*.{ts,tsx}"
  - "api/**/*.{ts,js}"
disable-model-invocation: false
---

# Docs sync skill

実装だけで終わらせず、`docs/` 正本の更新要否を確認する。

## When to check

Confirm docs update when you:

- Change important specifications (behavior, flows, business rules)
- Change UI flows or user-facing behavior
- Change DB schema or add/modify migrations
- Add or remove major features

## Which doc to update

| Role | File | Content |
|------|------|---------|
| Entry | `docs/README.md` | Reading order and hubs only |
| Product stages | `docs/Product_North_Star_and_GTM.md` | §0 current stage and on-hold items |
| Current work | `docs/01_Current_Status_and_Roadmap.md` | Stage-2 workstreams |
| Completed work | `docs/Closed_Sprints.md` | What exists, invariants, final numbers |
| Content pipeline | `docs/05_Content_Pipeline.md` | CP/FN/memoir drip, mapping contract |
| Work allocation | `docs/ops/Work_Allocation.md` | Cloud / local / Actions / Cron |
| Structure | `docs/Component_Structure_Guide.md` | `src/` layout, components |
| Repo folders | `docs/FOLDER_STRUCTURE.md` | Top-level dirs, scripts |
| Cursor MCP | `docs/Cursor_MCP_Setup.md` | MCP, release checks |
| Weekly telemetry | `docs/ops/Weekly_Telemetry_Review.md` | GA4 + Sentry review |

## Before finishing

- Prefer updating the right file over duplicating content.
- Keep README as summary; structure guides as structure.
- If no docs change is needed, state that briefly.
