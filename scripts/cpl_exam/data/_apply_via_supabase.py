# -*- coding: utf-8 -*-
"""Apply filtered MLIT sample questions via Supabase service role."""
from __future__ import annotations

import json
import sys
from pathlib import Path

from dotenv import load_dotenv
import os

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from import_mlit_sample_to_unified import to_source_documents  # noqa: E402

load_dotenv(ROOT / ".env.local")
url = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
if not url or not key:
    raise SystemExit("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")

from supabase import create_client

client = create_client(url, key)
DATA = Path(__file__).resolve().parent

inserted = 0
errors = []
for name in ("mlit_sample_insert_202606.json", "mlit_sample_insert_202408.json"):
    qs = json.loads((DATA / name).read_text(encoding="utf-8"))
    for q in qs:
        row = {
            "main_subject": q["main_subject"],
            "sub_subject": q["sub_subject"],
            "question_text": q["question_text"],
            "options": q["options"],
            "correct_answer": q["correct_answer"],
            "explanation": None,
            "source_documents": to_source_documents(q),
            "difficulty_level": 3,
            "importance_score": 6.0,
            "appearance_frequency": 1,
            "verification_status": "pending" if q.get("has_figure") else "verified",
            "tags": [
                "CPL",
                "例題集",
                f"{q['year']}年{q['month']}月",
                q["main_subject"],
                "mlit_sample",
            ]
            + (["要図"] if q.get("has_figure") else []),
            "exam_type": "CPL",
            "applicable_exams": ["CPL"],
        }
        try:
            client.table("unified_cpl_questions").insert(row).execute()
            inserted += 1
        except Exception as e:
            errors.append({"q": q["question_text"][:60], "err": str(e)})

print(json.dumps({"inserted": inserted, "errors": len(errors), "error_samples": errors[:5]}, ensure_ascii=False))
(DATA / "apply_result.json").write_text(
    json.dumps({"inserted": inserted, "errors": errors}, ensure_ascii=False, indent=2),
    encoding="utf-8",
)
