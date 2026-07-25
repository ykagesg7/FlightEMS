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
| Entry & summary | `docs/README.md` | Overview, recent changes, links |
| Product growth & NSM | `docs/Product_North_Star_and_GTM.md` | ALPM, onboarding, PMF, AI, legal UX |
| Specification | `docs/02_System_Spec.md` | /test, Dashboard, DB, data flows |
| Structure | `docs/Component_Structure_Guide.md` | `src/` layout, components |
| Repo folders | `docs/FOLDER_STRUCTURE.md` | Top-level dirs (non-`src/`) |
| Scripts & tooling | `docs/Scripts_Repository_Tooling.md` | CPL CSV, docs:watch, Git encoding |
| Cursor MCP | `docs/Cursor_MCP_Setup.md` | MCP, Serena, rules/agents notes |

## Before finishing

- Prefer updating the right file over duplicating content.
- Keep README as summary; `02_System_Spec` as spec; structure guides as structure.
- If no docs change is needed, state that briefly.
