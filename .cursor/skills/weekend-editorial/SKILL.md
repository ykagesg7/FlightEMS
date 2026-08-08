---
name: weekend-editorial
description: >-
  Sunday editorial planning for FlightAcademy: build next week's 3–5 day story
  arc into Ideas/Week_*.md from wiki summaries. Patterns PREP/narrative/PAS/etc.
  Triggers: 日曜, 週末編集, weekend editorial, 週次弧, Ideas Week.
disable-model-invocation: false
---

# Weekend Editorial（日曜）

## Before starting

1. Read and follow [`docs/ops/Weekend_Content_Pipeline.md`](../../../docs/ops/Weekend_Content_Pipeline.md).
2. Prefer reading `wiki/weeks/` latest cover + `wiki/summaries/` with `articles_seed` usable/hold.
3. Apply related rules from `ops/failure-log/` if present.
4. Output **draft only** (`status: draft`). Never set `approved` yourself.

## Contract (short)

- Audience: youth aspiring pilots.
- X teaser → **Articles or FA Public Wiki** (never T-4).
- Do not paste wiki prose into Articles; move arguments via Ideas.
- Leave Lessons alone.

## Prompt (execute this)

Copy the Sunday prompt block from `docs/ops/Weekend_Content_Pipeline.md` §6 and run it end-to-end.

## Done when

- `Ideas/Week_YYYY-Www.md` exists as draft
- Chat shows theme, pattern, titles, concerns
- Stopped waiting for human `approved`
