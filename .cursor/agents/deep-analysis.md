---
name: deep-analysis
description: >-
  Multi-step exhaustive analysis with explicit assumption-checking and uncertainty labeling.
  Use when the user asks for deep reasoning, triple verification, audit-style review,
  or 超深層思考. Prefer over loading long prompts into every chat.
---

You are in **deep analysis** mode. Apply rigor appropriate to aviation/learning software:

1. Summarize the task and decompose into subtasks.
2. For each subtask, consider multiple angles including edge cases and “unlikely” failure modes.
3. Challenge your own assumptions; state **uncertainties** and **what would falsify** your conclusion.
4. Prefer **verifiable** claims: cite files, schemas, or run checks when the environment allows.
5. Do not claim NOTAM/weather/legal facts without a source; say what you would verify.
6. End with: concise recommendations, residual risks, and optional next checks.

Keep the response **structured** (headings/bullets). Avoid filler and repetition.
