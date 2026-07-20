# -*- coding: utf-8 -*-
"""
Import MLIT CPL airplane sample editions into unified_cpl_questions SQL.

Confirmed editions:
  - 2026-06: scripts/cpl_exam/data/001761087_202606_webfetch.txt
  - 2024-08: scripts/cpl_exam/real_exam_data_insert.sql (restore)

Does NOT assign CBT period year/months (2023-11..2025-09 except real 2024-08 sample).
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
DATA = Path(__file__).resolve().parent / "data"
SQL_DIR = ROOT / "scripts" / "database"

SUBJECT_HEADERS = {
    "航空工学": "航空工学",
    "空中航法": "空中航法",
    "航空気象": "航空気象",
    "航空通信": "航空通信",
    "航空法規": "航空法規",
}

NFKC_TABLE = str.maketrans(
    {
        "０": "0",
        "１": "1",
        "２": "2",
        "３": "3",
        "４": "4",
        "５": "5",
        "６": "6",
        "７": "7",
        "８": "8",
        "９": "9",
        "（": "(",
        "）": ")",
        "　": " ",
    }
)


def normalize_text(s: str) -> str:
    s = s.translate(NFKC_TABLE)
    s = re.sub(r"=== Page \d+ ===", " ", s)
    s = re.sub(r"\s+", " ", s)
    return s.strip().lower()


def clean_display_text(s: str) -> str:
    """Remove PDF extraction artifacts from stored question/option text."""
    s = re.sub(r"\s*=== Page \d+ ===\s*", " ", s)
    s = re.sub(r"[ \t]+", " ", s)
    return s.strip()


def text_hash(s: str) -> str:
    return hashlib.sha256(normalize_text(s).encode("utf-8")).hexdigest()


def sql_escape(s: str) -> str:
    return s.replace("'", "''")


def strip_markdown_noise(text: str) -> str:
    """Convert GFM table cells that hold options/answers into plain lines; drop junk rows."""
    lines: list[str] = []
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith("|"):
            # e.g. | （３）３つ | |  or | 正答（１） | |
            cell = stripped.strip("|").split("|")[0].strip()
            if cell.startswith("---") or not cell:
                continue
            if re.match(r"[（(][1-5１-５][）)]", cell) or cell.startswith("正答"):
                lines.append(cell)
            continue
        if stripped.startswith("---"):
            continue
        lines.append(line)
    return "\n".join(lines)


def parse_sample_text(text: str, year: int, month: int, file_name: str) -> list[dict[str, Any]]:
    text = strip_markdown_noise(text)
    # Split by subject headers (full-width year line may precede first subject)
    # Patterns like: ## ２０２６年６月 航空工学（P１２）  or ## 空中航法（P１９）
    parts: list[tuple[str, str]] = []
    header_re = re.compile(
        r"^##\s*(?:[０-９0-9]+年[０-９0-9]+月\s*)?(航空工学|空中航法|航空気象|航空通信|航空法規)",
        re.M,
    )
    matches = list(header_re.finditer(text))
    if not matches:
        raise ValueError("No subject headers found in sample text")

    for i, m in enumerate(matches):
        subject = m.group(1)
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        parts.append((subject, text[start:end]))

    questions: list[dict[str, Any]] = []
    for subject, body in parts:
        # Split on 例題N (allow space)
        blocks = re.split(r"例題\s*([0-9０-９]+)\s*", body)
        # blocks: [preamble, num1, content1, num2, content2, ...]
        for j in range(1, len(blocks), 2):
            num_raw = blocks[j].translate(NFKC_TABLE)
            content = blocks[j + 1]
            q = parse_one_question(content, int(num_raw), subject, year, month, file_name)
            if q:
                questions.append(q)
    return questions


def parse_one_question(
    content: str,
    question_no: int,
    subject: str,
    year: int,
    month: int,
    file_name: str,
) -> dict[str, Any] | None:
    content = content.strip()
    # Cut at next accidental subject header leftovers
    content = re.split(r"\n##\s+", content, maxsplit=1)[0].strip()

    ans_m = re.search(r"正答\s*[（(]\s*([1-5１-５])\s*[）)]", content)
    if not ans_m:
        return None
    correct = int(ans_m.group(1).translate(NFKC_TABLE))
    before_ans = content[: ans_m.start()].strip()

    # Extract numbered options （１）... — keep the last contiguous run 1..k
    opt_matches = list(
        re.finditer(
            r"[（(]([1-5１-５])[）)]\s*(.+?)(?=(?:[（(][1-5１-５][）)]|正答|$))",
            before_ans,
            re.S,
        )
    )
    options_raw: list[tuple[int, str]] = []
    for m in opt_matches:
        n = int(m.group(1).translate(NFKC_TABLE))
        txt = re.sub(r"\s+", " ", m.group(2)).strip()
        options_raw.append((n, txt))

    options_raw = select_final_option_run(options_raw)
    if len(options_raw) < 2:
        return None

    # Stem = text before the final option run (last （1） that starts that run)
    opt1_positions = [m.start() for m in re.finditer(r"[（(][1１][）)]", before_ans)]
    if not opt1_positions:
        return None
    stem_end = opt1_positions[-1]
    stem = re.sub(r"\s+", " ", before_ans[:stem_end]).strip()

    by_num = {n: t for n, t in options_raw}
    max_n = max(by_num)
    if any(i not in by_num for i in range(1, max_n + 1)):
        options = [t for _, t in sorted(options_raw, key=lambda x: x[0])]
    else:
        options = [by_num[i] for i in range(1, max_n + 1)]

    adapted = adapt_to_four_choices(stem, options, correct, question_no, subject)
    if adapted is None:
        return None

    stem2, options2, correct2, adaptation = adapted
    stem2 = clean_display_text(stem2)
    options2 = [clean_display_text(o) for o in options2]
    has_figure = "下図" in stem2 or "次図" in stem2 or "図に" in stem2

    return {
        "main_subject": subject,
        "sub_subject": "CBT例題/未分類",
        "question_text": stem2,
        "options": options2,
        "correct_answer": correct2,
        "year": year,
        "month": month,
        "question_no": question_no,
        "file": file_name,
        "choice_adaptation": adaptation,
        "has_figure": has_figure,
        "text_hash": text_hash(stem2),
    }


def select_final_option_run(options_raw: list[tuple[int, str]]) -> list[tuple[int, str]]:
    """Keep the last run of options numbered 1..k (k>=2)."""
    if not options_raw:
        return []
    # Group into runs where numbers reset to 1
    runs: list[list[tuple[int, str]]] = []
    current: list[tuple[int, str]] = []
    for n, t in options_raw:
        if n == 1 and current:
            runs.append(current)
            current = []
        current.append((n, t))
    if current:
        runs.append(current)
    # Prefer last run that looks like MCQ (has 2+ options, starts at 1)
    for run in reversed(runs):
        nums = [n for n, _ in run]
        if nums and nums[0] == 1 and len(run) >= 2:
            return run
    return runs[-1] if runs else []


def adapt_to_four_choices(
    stem: str,
    options: list[str],
    correct: int,
    question_no: int,
    subject: str,
) -> tuple[str, list[str], int, dict[str, Any] | None] | None:
    if len(options) == 4 and 1 <= correct <= 4:
        return stem, options, correct, None

    if len(options) == 5:
        # Drop 「無し」/ option 5 when correct is 1-4
        last = options[4]
        is_nashi = "無し" in last or "なし" in last or last.strip() in {"無", "なし", "無し"}

        if correct <= 4:
            if is_nashi or True:
                adaptation = {
                    "from_count": 5,
                    "dropped_index": 5,
                    "dropped_text": last,
                    "reason": "drop_fifth_for_four_choice_ui",
                    "correct_unchanged": True,
                }
                return stem, options[:4], correct, adaptation

        if correct == 5:
            # Manual rule: drop「4つ」and map 無し → (4)
            # Used for 見張り義務 count question (法規 例題14)
            dropped = options[3]  # 「4つ」
            new_opts = options[:3] + [options[4]]
            adaptation = {
                "from_count": 5,
                "dropped_index": 4,
                "dropped_text": dropped,
                "reason": "answer_was_nashi_drop_yottsu_remap_nashi_to_4",
                "correct_before": 5,
                "correct_after": 4,
                "question_hint": f"{subject}#{question_no}",
            }
            return stem, new_opts, 4, adaptation

    # Fewer than 4: pad not allowed
    if len(options) < 4:
        return None
    # More than 5: unexpected
    return None


def parse_202408_sql(sql_path: Path) -> list[dict[str, Any]]:
    """Parse real_exam_data_insert.sql via markdown_content blocks (full 例題 text)."""
    text = sql_path.read_text(encoding="utf-8")
    questions: list[dict[str, Any]] = []
    seen: set[str] = set()

    row_starts = [m.start() for m in re.finditer(r"\(2024,\s*8,\s*\d+", text)]
    for i, start in enumerate(row_starts):
        end = row_starts[i + 1] if i + 1 < len(row_starts) else len(text)
        chunk = text[start:end]

        head = re.match(
            r"\(2024,\s*8,\s*(\d+),\s*'([^']*)'",
            chunk,
        )
        if not head:
            continue
        qnum = int(head.group(1))
        subject = head.group(2)
        if subject not in SUBJECT_HEADERS:
            subject = "航空工学"

        # markdown_content is the quoted block that starts with 例題
        md_m = re.search(r"'202408_CPLTest\.pdf',\s*'(例題.*?)'\s*,\s*'", chunk, re.S)
        if not md_m:
            continue
        md = md_m.group(1).replace("''", "'")
        # Reuse one-question parser (content after 例題N line)
        body_m = re.match(r"例題\s*[0-9０-９]+\s*\n?(.*)", md, re.S)
        content = body_m.group(1) if body_m else md
        q = parse_one_question(content, qnum, subject, 2024, 8, "202408_CPLTest.pdf")
        if not q:
            continue
        # SQL subject column can be wrong relative to content; keep SQL subject
        q["main_subject"] = subject
        q["text_hash"] = text_hash(q["question_text"])
        if q["text_hash"] in seen:
            continue
        seen.add(q["text_hash"])
        questions.append(q)
    return questions


def load_existing_hashes(path: Path | None) -> set[str]:
    if not path or not path.exists():
        return set()
    data = json.loads(path.read_text(encoding="utf-8"))
    hashes: set[str] = set()
    prefixes: list[str] = []
    if isinstance(data, list):
        for row in data:
            if isinstance(row, str):
                hashes.add(text_hash(row))
                prefixes.append(normalize_text(row)[:60])
            elif isinstance(row, dict):
                if "h" in row:
                    hashes.add(row["h"])
                elif "q" in row:
                    hashes.add(text_hash(row["q"]))
                    prefixes.append(normalize_text(row["q"])[:60])
                elif "question_text" in row:
                    hashes.add(text_hash(row["question_text"]))
                    prefixes.append(normalize_text(row["question_text"])[:60])
    # stash prefixes on function attribute for soft match
    load_existing_hashes.prefixes = prefixes  # type: ignore[attr-defined]
    return hashes


def is_soft_duplicate(question_text: str, prefixes: list[str]) -> bool:
    n = normalize_text(question_text)
    for p in prefixes:
        if not p:
            continue
        if n.startswith(p) or p.startswith(n[:60]) or p in n:
            return True
    return False


def fetch_existing_hashes_via_env() -> set[str]:
    """Optional: pull all question texts from Supabase if service role is configured."""
    try:
        from dotenv import load_dotenv
        import os

        load_dotenv(ROOT / ".env.local")
        url = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")
        if not url or not key:
            return set()
        from supabase import create_client

        client = create_client(url, key)
        hashes: set[str] = set()
        start = 0
        page = 1000
        while True:
            res = (
                client.table("unified_cpl_questions")
                .select("question_text")
                .range(start, start + page - 1)
                .execute()
            )
            rows = res.data or []
            if not rows:
                break
            for r in rows:
                hashes.add(text_hash(r["question_text"] or ""))
            if len(rows) < page:
                break
            start += page
        return hashes
    except Exception as e:
        print(f"[warn] supabase fetch skipped: {e}", file=sys.stderr)
        return set()


def to_source_documents(q: dict[str, Any]) -> dict[str, Any]:
    src: dict[str, Any] = {
        "type": "mlit_sample",
        "year": q["year"],
        "month": q["month"],
        "question_no": q["question_no"],
        "main_subject": q["main_subject"],
        "file": q["file"],
        "edition": "CPL-airplane-sample",
    }
    doc: dict[str, Any] = {
        "sources": [src],
        "weight": 2.0,
        "originality": "official",
        "choice_adaptation": q.get("choice_adaptation"),
    }
    if q.get("has_figure"):
        doc["notes"] = "figure_in_original_pdf"
    return doc


def question_to_insert_sql(q: dict[str, Any]) -> str:
    opts = json.dumps(q["options"], ensure_ascii=False)
    src = json.dumps(to_source_documents(q), ensure_ascii=False)
    tags = ["CPL", "例題集", f"{q['year']}年{q['month']}月", q["main_subject"], "mlit_sample"]
    if q.get("has_figure"):
        tags.append("要図")
    tags_sql = "ARRAY[" + ", ".join(f"'{sql_escape(t)}'" for t in tags) + "]::text[]"
    status = "pending" if q.get("has_figure") else "verified"
    return f"""INSERT INTO unified_cpl_questions (
  main_subject, sub_subject, question_text, options, correct_answer,
  explanation, source_documents, difficulty_level, importance_score,
  appearance_frequency, verification_status, tags, exam_type, applicable_exams
) VALUES (
  '{sql_escape(q['main_subject'])}',
  '{sql_escape(q['sub_subject'])}',
  '{sql_escape(q['question_text'])}',
  '{sql_escape(opts)}'::jsonb,
  {q['correct_answer']},
  NULL,
  '{sql_escape(src)}'::jsonb,
  3,
  6.0,
  1,
  '{status}',
  {tags_sql},
  'CPL',
  ARRAY['CPL']::text[]
);"""


def write_sql(path: Path, questions: list[dict[str, Any]], title: str) -> None:
    lines = [
        f"-- {title}",
        f"-- Generated by import_mlit_sample_to_unified.py",
        f"-- Count: {len(questions)}",
        "BEGIN;",
        "",
    ]
    for q in questions:
        lines.append(question_to_insert_sql(q))
        lines.append("")
    lines.append("COMMIT;")
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--existing-json",
        type=Path,
        default=DATA / "existing_202408_stems.json",
    )
    parser.add_argument("--skip-supabase", action="store_true")
    args = parser.parse_args()

    text_2026 = (DATA / "001761087_202606_webfetch.txt").read_text(encoding="utf-8")
    q2026 = parse_sample_text(text_2026, 2026, 6, "001761087.pdf")
    q2024 = parse_202408_sql(ROOT / "scripts" / "cpl_exam" / "real_exam_data_insert.sql")

    existing = set()
    load_existing_hashes.prefixes = []  # type: ignore[attr-defined]
    existing |= load_existing_hashes(args.existing_json)
    if not args.skip_supabase:
        existing |= fetch_existing_hashes_via_env()
    prefixes: list[str] = getattr(load_existing_hashes, "prefixes", [])

    # Prefer 2026 as canonical when texts collide between editions
    seen_batch: set[str] = set()
    insert_2026: list[dict[str, Any]] = []
    skip_2026 = []
    for q in q2026:
        h = q["text_hash"]
        if h in existing or h in seen_batch or is_soft_duplicate(q["question_text"], prefixes):
            skip_2026.append(
                {
                    "reason": "duplicate",
                    "year": 2026,
                    "no": q["question_no"],
                    "subject": q["main_subject"],
                    "prefix": q["question_text"][:80],
                }
            )
            continue
        seen_batch.add(h)
        insert_2026.append(q)

    insert_2024: list[dict[str, Any]] = []
    skip_2024 = []
    for q in q2024:
        h = q["text_hash"]
        if h in existing or h in seen_batch or is_soft_duplicate(q["question_text"], prefixes):
            skip_2024.append(
                {
                    "reason": "duplicate",
                    "year": 2024,
                    "no": q["question_no"],
                    "subject": q["main_subject"],
                    "prefix": q["question_text"][:80],
                }
            )
            continue
        seen_batch.add(h)
        insert_2024.append(q)

    SQL_DIR.mkdir(parents=True, exist_ok=True)
    p2026 = SQL_DIR / "20260720_unified_cpl_questions_mlit_sample_202606.sql"
    p2024 = SQL_DIR / "20260720_unified_cpl_questions_mlit_sample_202408_backfill.sql"
    write_sql(p2026, insert_2026, "MLIT sample CPL airplane 2026-06")
    write_sql(p2024, insert_2024, "MLIT sample CPL airplane 2024-08 backfill")

    report = {
        "inventory": {
            "confirmed_editions": ["2024-08", "2026-06"],
            "mid_revisions": [],
            "cbt_periods_not_registered": "2023-11..2025-09 stubs are not official sample editions",
        },
        "parsed": {"2026-06": len(q2026), "2024-08": len(q2024)},
        "insert": {"2026-06": len(insert_2026), "2024-08": len(insert_2024)},
        "skipped": {"2026-06": skip_2026, "2024-08": skip_2024},
        "adaptations": [
            {
                "year": q["year"],
                "month": q["month"],
                "no": q["question_no"],
                "subject": q["main_subject"],
                "adaptation": q["choice_adaptation"],
            }
            for q in insert_2026 + insert_2024
            if q.get("choice_adaptation")
        ],
        "existing_hash_count": len(existing),
        "sql_files": [str(p2026.relative_to(ROOT)), str(p2024.relative_to(ROOT))],
    }
    report_path = DATA / "mlit_sample_import_report.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    # Intermediate JSON for apply step
    (DATA / "mlit_sample_insert_202606.json").write_text(
        json.dumps(insert_2026, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (DATA / "mlit_sample_insert_202408.json").write_text(
        json.dumps(insert_2024, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(json.dumps({k: report[k] for k in ("parsed", "insert", "existing_hash_count")}, ensure_ascii=False))
    print(f"report={report_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
