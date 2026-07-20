# -*- coding: utf-8 -*-
"""Fact-check mlit_sample rows against source PDF text and basic integrity."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from import_mlit_sample_to_unified import (  # noqa: E402
    NFKC_TABLE,
    normalize_text,
    parse_sample_text,
    parse_202408_sql,
    adapt_to_four_choices,
)

DATA = Path(__file__).resolve().parent

# Load source gold from PDF text
gold_2026 = parse_sample_text(
    (DATA / "001761087_202606_webfetch.txt").read_text(encoding="utf-8"),
    2026,
    6,
    "001761087.pdf",
)
gold_by_key: dict[str, dict] = {}
for q in gold_2026:
    gold_by_key[normalize_text(q["question_text"])[:80]] = q

# Load DB dump if provided as JSON argv, else expect apply JSON
db_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DATA / "db_mlit_sample_dump.json"
db_rows = json.loads(db_path.read_text(encoding="utf-8"))

issues = []
ok = 0
for row in db_rows:
    qtext = row["question_text"]
    opts = row["options"]
    ans = row["correct_answer"]
    y = int(row.get("y") or row.get("source_documents", {}).get("sources", [{}])[0].get("year") or 0)
    m = int(row.get("m") or row.get("source_documents", {}).get("sources", [{}])[0].get("month") or 0)

    if not isinstance(opts, list):
        issues.append({"id": row["id"], "issue": "options_not_list", "q": qtext[:60]})
        continue
    if len(opts) != 4:
        issues.append({"id": row["id"], "issue": f"opts_len_{len(opts)}", "q": qtext[:60]})
        continue
    if not (1 <= ans <= 4):
        issues.append({"id": row["id"], "issue": f"bad_ans_{ans}", "q": qtext[:60]})
        continue
    if any(not str(o).strip() for o in opts):
        issues.append({"id": row["id"], "issue": "empty_option", "q": qtext[:60]})
        continue
    # Truncation heuristic: option ends mid-word with dangling particles rarely; check very short
    if any(len(str(o).strip()) < 1 for o in opts):
        issues.append({"id": row["id"], "issue": "short_option", "q": qtext[:60]})
        continue

    key = normalize_text(qtext)[:80]
    gold = gold_by_key.get(key)
    if gold and y == 2026:
        if gold["correct_answer"] != ans:
            issues.append(
                {
                    "id": row["id"],
                    "issue": "answer_mismatch_vs_pdf",
                    "db_ans": ans,
                    "pdf_ans": gold["correct_answer"],
                    "q": qtext[:80],
                    "db_opts": opts,
                    "pdf_opts": gold["options"],
                }
            )
            continue
        # Compare options loosely
        if [normalize_text(o) for o in opts] != [normalize_text(o) for o in gold["options"]]:
            issues.append(
                {
                    "id": row["id"],
                    "issue": "options_mismatch_vs_pdf",
                    "q": qtext[:80],
                    "db_opts": opts,
                    "pdf_opts": gold["options"],
                }
            )
            continue
    ok += 1

# Stem integrity: count-type questions should still contain (a)-(d) in stem
for row in db_rows:
    qt = row["question_text"]
    if "いくつあるか" in qt and not re.search(r"[（(][a-dａ-ｄ]", qt, re.I):
        # might still be ok if statements use different format
        if "（a）" not in qt and "(a)" not in qt and "（ａ）" not in qt:
            issues.append({"id": row["id"], "issue": "count_q_missing_abcd", "q": qt[:100]})

report = {
    "db_rows": len(db_rows),
    "gold_2026": len(gold_2026),
    "ok_checked": ok,
    "issues": issues,
}
out = DATA / "factcheck_report.json"
out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({"db_rows": len(db_rows), "issues": len(issues), "ok": ok}, ensure_ascii=False))
for i in issues[:15]:
    print(i.get("issue"), i.get("id"), i.get("q", "")[:50])
