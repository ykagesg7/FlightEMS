# -*- coding: utf-8 -*-
"""Emit batched SQL files for MCP apply (10 inserts each)."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from import_mlit_sample_to_unified import question_to_insert_sql

DATA = Path(__file__).resolve().parent
OUT = DATA / "apply_batches"
OUT.mkdir(exist_ok=True)

# clear old
for p in OUT.glob("*.sql"):
    p.unlink()

all_q = []
for name, edition in [
    ("mlit_sample_insert_202606.json", "202606"),
    ("mlit_sample_insert_202408.json", "202408"),
]:
    qs = json.loads((DATA / name).read_text(encoding="utf-8"))
    for q in qs:
        q["_edition"] = edition
        all_q.append(q)

batch_size = 8
paths = []
for i in range(0, len(all_q), batch_size):
    batch = all_q[i : i + batch_size]
    n = i // batch_size
    path = OUT / f"batch_{n:03d}.sql"
    lines = [question_to_insert_sql(q) for q in batch]
    path.write_text("\n".join(lines), encoding="utf-8")
    paths.append(str(path))

manifest = {"total": len(all_q), "batches": len(paths), "batch_size": batch_size, "paths": paths}
(OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(manifest, ensure_ascii=False))
