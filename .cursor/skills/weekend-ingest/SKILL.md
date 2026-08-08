---
name: weekend-ingest
description: >-
  Saturday Obsidian ingest for FlightAcademy: classify raw clips into
  content/personal/ops, write wiki summaries, update weekly cover, light lint.
  Triggers: 土曜, 週末インジェスト, weekend ingest, raw整理, wiki要約.
disable-model-invocation: false
---

# Weekend Ingest（土曜）

## Before starting

1. Read and follow [`docs/ops/Weekend_Content_Pipeline.md`](../../../docs/ops/Weekend_Content_Pipeline.md).
2. Use Obsidian MCP with vault `iCloud~md~obsidian` under `FlightAcademy/`.
3. Do **not** design next week's arc, write MDX, post to X, or create Notion Public Wiki pages beyond noting `notion_seed`.

## Contract (short)

- Articles = canonical; Notion **FA Public Wiki** = public companion; X = teaser → Articles or Public Wiki.
- **T-4 hubs are student-only.** Never put T-4 URLs in public CTAs or Public Wiki.
- One-way only: T-4 → Public Wiki. Public Wiki must not link to T-4.
- Never delete personal/ops clips; never touch Lessons.

## Prompt (execute this)

Copy the Saturday prompt block from `docs/ops/Weekend_Content_Pipeline.md` §5 and run it end-to-end.

## Done when

- Buckets assigned; summaries written where possible
- `wiki/weeks/YYYY-Www.md` updated
- One-paragraph Sunday handoff in chat
