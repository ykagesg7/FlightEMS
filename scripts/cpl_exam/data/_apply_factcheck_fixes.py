# -*- coding: utf-8 -*-
"""Fact-check fixes for mlit_sample rows."""
from __future__ import annotations

import json
import os
import re
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

ROOT = Path(__file__).resolve().parents[3]
DATA = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env.local")
client = create_client(
    os.environ["VITE_SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"],
)

PAGE_RE = re.compile(r"\s*=== Page \d+ ===\s*")


def clean(s: str) -> str:
    s = PAGE_RE.sub(" ", s)
    s = re.sub(r"[ \t]+", " ", s)
    return s.strip()


dump = json.loads((DATA / "db_mlit_sample_dump.json").read_text(encoding="utf-8"))

# 1) Strip page markers
page_ids = []
for row in dump:
    opts = row["options"]
    if isinstance(opts, str):
        opts = json.loads(opts)
    if "=== Page" in row["question_text"] or any("=== Page" in str(o) for o in opts):
        page_ids.append(row["id"])

fixed_page = []
for pid in page_ids:
    row = (
        client.table("unified_cpl_questions")
        .select("id,question_text,options")
        .eq("id", pid)
        .single()
        .execute()
        .data
    )
    if not row:
        continue
    client.table("unified_cpl_questions").update(
        {
            "question_text": clean(row["question_text"]),
            "options": [clean(o) for o in row["options"]],
        }
    ).eq("id", pid).execute()
    fixed_page.append(pid)

# 2) Fix wrong main_subject
subject_fixes = {
    "44866897-24a8-4ac0-9a8b-c89797a4609d": "航空法規",  # 救急用具
    "6f3aa923-674e-46cb-b60b-8525799e8264": "航空法規",  # 飛行場灯火
}
for oid, subj in subject_fixes.items():
    client.table("unified_cpl_questions").update({"main_subject": subj}).eq("id", oid).execute()

# 3) Delete 2024 duplicate of 見張り義務 (keep 2026)
dup_delete = ["ac2a2a97-f6d6-4e26-ab67-0a184023f404"]
for oid in dup_delete:
    client.table("unified_cpl_questions").delete().eq("id", oid).execute()

# 4) Confirm 粗暴な操縦 answer = 1 (航空法85条: 低空/高調音/急降下/迷惑/方法で操縦)
soobo = (
    client.table("unified_cpl_questions")
    .select("id,correct_answer")
    .eq("id", "34c3a810-0925-49c8-8c0f-4e4bd7773e29")
    .single()
    .execute()
    .data
)

figure_gone = {
    "59caa7b7-5311-43e7-8c5e-f8aee193dede",
    "3848a77d-9244-431e-8073-01b9e36d0480",
}
remaining_ids = [
    r["id"] for r in dump if r["id"] not in dup_delete and r["id"] not in figure_gone
]

alive = 0
verified = 0
for i in range(0, len(remaining_ids), 50):
    chunk = remaining_ids[i : i + 50]
    got = (
        client.table("unified_cpl_questions")
        .select("id,verification_status")
        .in_("id", chunk)
        .execute()
        .data
    )
    alive += len(got)
    verified += sum(1 for g in got if g["verification_status"] == "verified")

# ensure no page markers remain
still_page = []
for pid in fixed_page:
    row = (
        client.table("unified_cpl_questions")
        .select("question_text,options")
        .eq("id", pid)
        .single()
        .execute()
        .data
    )
    if row and (
        "=== Page" in row["question_text"]
        or any("=== Page" in str(o) for o in row["options"])
    ):
        still_page.append(pid)

report = {
    "fixed_page_marker_ids": fixed_page,
    "subject_fixes": subject_fixes,
    "deleted_duplicates": dup_delete,
    "soobo_answer": soobo["correct_answer"] if soobo else None,
    "soobo_ok_matches_aviation_act_85": bool(soobo and soobo["correct_answer"] == 1),
    "alive": alive,
    "verified": verified,
    "still_has_page_marker": still_page,
}
(DATA / "factcheck_fix_report.json").write_text(
    json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
)
print(json.dumps(report, ensure_ascii=False, indent=2))
