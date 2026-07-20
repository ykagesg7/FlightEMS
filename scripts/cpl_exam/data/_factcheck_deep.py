# -*- coding: utf-8 -*-
"""Deeper fact-check: coverage, truncation, adaptation answers, sample aviation facts."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from import_mlit_sample_to_unified import normalize_text, parse_sample_text  # noqa: E402

DATA = Path(__file__).resolve().parent
rows = json.loads((DATA / "db_mlit_sample_dump.json").read_text(encoding="utf-8"))
gold = parse_sample_text(
    (DATA / "001761087_202606_webfetch.txt").read_text(encoding="utf-8"),
    2026,
    6,
    "001761087.pdf",
)
# Exclude figure stems from gold comparison targets
figure_stems = ("メルカトル図及びランバート図", "沿岸前線に関する説明")
gold = [g for g in gold if not any(s in g["question_text"] for s in figure_stems)]

gold_by_prefix = {normalize_text(g["question_text"])[:50]: g for g in gold}

issues = []
matched_2026 = 0
unmatched_2026 = []

for row in rows:
    y = int(row["y"])
    opts = row["options"]
    if isinstance(opts, str):
        opts = json.loads(opts)
    # truncation signs
    for i, o in enumerate(opts):
        s = str(o).strip()
        if s.endswith(("、", "の", "を", "が", "は", "に", "と", "で", "（", "(")):
            issues.append(
                {
                    "id": row["id"],
                    "issue": "option_looks_truncated",
                    "opt_i": i + 1,
                    "opt": s,
                    "q": row["question_text"][:60],
                }
            )
        if "=== Page" in s or "=== Page" in row["question_text"]:
            issues.append(
                {
                    "id": row["id"],
                    "issue": "page_marker_leak",
                    "q": row["question_text"][:60],
                }
            )

    if y == 2026:
        key = normalize_text(row["question_text"])[:50]
        g = gold_by_prefix.get(key)
        if not g:
            # try softer
            found = None
            nq = normalize_text(row["question_text"])
            for gk, gv in gold_by_prefix.items():
                if nq.startswith(gk) or gk.startswith(nq[:50]):
                    found = gv
                    break
            if not found:
                unmatched_2026.append(row["question_text"][:70])
                continue
            g = found
        matched_2026 += 1
        if g["correct_answer"] != row["correct_answer"]:
            issues.append(
                {
                    "id": row["id"],
                    "issue": "answer_mismatch",
                    "db": row["correct_answer"],
                    "pdf": g["correct_answer"],
                    "q": row["question_text"][:70],
                }
            )
        db_opts = [normalize_text(o) for o in opts]
        pdf_opts = [normalize_text(o) for o in g["options"]]
        if db_opts != pdf_opts:
            issues.append(
                {
                    "id": row["id"],
                    "issue": "options_diff",
                    "db_opts": opts,
                    "pdf_opts": g["options"],
                    "q": row["question_text"][:70],
                }
            )

# Find 見張り義務 adaptation (answer was 5 -> 4)
mihari = [r for r in rows if "見張り義務" in r["question_text"]]
for r in mihari:
    issues.append(
        {
            "id": r["id"],
            "issue": "INFO_mihari_adaptation",
            "ans": r["correct_answer"],
            "opts": r["options"],
            "adaptation": r.get("adaptation"),
            "q": r["question_text"][:100],
        }
    )

# ピトー should NOT be in mlit_sample new set as duplicate of old - OK if absent
pito = [r for r in rows if "ピトー静圧" in r["question_text"]]

report = {
    "rows": len(rows),
    "matched_2026": matched_2026,
    "unmatched_2026": unmatched_2026,
    "issues": [i for i in issues if not str(i["issue"]).startswith("INFO_")],
    "info": [i for i in issues if str(i["issue"]).startswith("INFO_")],
    "pito_count": len(pito),
}
(DATA / "factcheck_deep_report.json").write_text(
    json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
)
print(
    json.dumps(
        {
            "rows": report["rows"],
            "matched_2026": matched_2026,
            "unmatched": len(unmatched_2026),
            "issues": len(report["issues"]),
            "info": len(report["info"]),
        },
        ensure_ascii=False,
    )
)
for i in report["issues"][:20]:
    print("ISSUE", i["issue"], i.get("id"), i.get("q", i.get("opt", ""))[:60])
for u in unmatched_2026[:10]:
    print("UNMATCH", u)
