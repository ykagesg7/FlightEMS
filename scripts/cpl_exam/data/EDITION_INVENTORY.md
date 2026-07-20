# MLIT CPL airplane sample editions — inventory (2026-07-20)

## Confirmed official sample editions

| Edition | Evidence | Recoverable source | Register? |
|---------|----------|-------------------|-----------|
| **2024-08** | JAPA Study Guide: MLIT published sample set Aug 2024 | `scripts/cpl_exam/real_exam_data_insert.sql` (~100 Q) | Yes (backfill missing) |
| **2026-06** | Current PDF header on `001761087.pdf` | `scripts/cpl_exam/data/001761087_cpl_airplane_sample.pdf` (~119 Q) | Yes (full) |

PDF URL (single file per license, not per CBT period):
https://www.mlit.go.jp/koku/content/001761087.pdf

## Mid revisions (2024-09 … 2026-05)

No separate archived PDF with a different header month found (Wayback CDX unavailable / no local mid snapshots).
**No mid-edition registration in this batch.**

## CBT period labels 2023-11 … 2025-09 (excluding 2024-08)

These are **not** official sample editions. Production rows are thin stubs, e.g.:

- `CPL試験2023年11月問題（サンプル3）：…` with **empty options**, `pending`
- Same pattern through 2025-09

Do **not** invent full sample sets under those year/months.
Optional later cleanup: mark `needs_review` / `duplicate` (out of scope for insert task).

## Paper past exams

Last official period PDF: Reiwa 5 / Sep 2023. Already covered by `cpl_master_csv`. Do not re-import.
