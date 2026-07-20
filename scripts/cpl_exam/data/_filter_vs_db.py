# -*- coding: utf-8 -*-
"""Filter insert JSON against DB prefixes, then emit apply batches."""
import json
import re
from pathlib import Path

DATA = Path(__file__).resolve().parent

raw = Path(
    r"C:\Users\yusuke\.cursor\projects\c-Users-yusuke-Desktop-project-FlightAcademyTsx\agent-tools\304500fc-cfdb-4028-bdf5-f8849ef8d977.txt"
).read_text(encoding="utf-8")

# File may be raw MCP JSON envelope
try:
    envelope = json.loads(raw)
    text = envelope.get("result", raw)
except json.JSONDecodeError:
    text = raw

m = re.search(
    r"<untrusted-data-[0-9a-f-]+>\s*\n(\[.*?\])\s*\n</untrusted-data-",
    text,
    re.S,
)
if not m:
    raise SystemExit("could not find untrusted JSON payload")
payload = m.group(1)

rows = json.loads(payload)
prefixes = {re.sub(r"\s+", " ", r["p"]).strip().lower()[:40] for r in rows if r.get("p")}
print("db_prefixes", len(prefixes))


def norm_prefix(s: str) -> str:
    s = s.translate(str.maketrans({"　": " ", "（": "(", "）": ")"}))
    s = re.sub(r"\s+", " ", s).strip().lower()
    return s[:40]


def filter_qs(path: Path):
    qs = json.loads(path.read_text(encoding="utf-8"))
    kept = []
    skipped = []
    for q in qs:
        p = norm_prefix(q["question_text"])
        if any(p.startswith(ep) or ep.startswith(p) for ep in prefixes if len(ep) >= 15):
            skipped.append(q)
        else:
            kept.append(q)
            prefixes.add(p)
    path.write_text(json.dumps(kept, ensure_ascii=False, indent=2), encoding="utf-8")
    return kept, skipped


k26, s26 = filter_qs(DATA / "mlit_sample_insert_202606.json")
k24, s24 = filter_qs(DATA / "mlit_sample_insert_202408.json")
report = {
    "after_db_prefix_filter": {"2026-06": len(k26), "2024-08": len(k24)},
    "skipped_vs_db": {"2026-06": len(s26), "2024-08": len(s24)},
    "skip_prefixes_2026": [q["question_text"][:60] for q in s26[:30]],
    "skip_prefixes_2024": [q["question_text"][:60] for q in s24[:30]],
}
(DATA / "mlit_sample_dedupe_vs_db.json").write_text(
    json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
)
print(json.dumps(report["after_db_prefix_filter"], ensure_ascii=False))
print("skipped", report["skipped_vs_db"])
