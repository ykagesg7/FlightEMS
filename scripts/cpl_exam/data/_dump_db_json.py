# -*- coding: utf-8 -*-
import json
import re
from pathlib import Path

raw = Path(
    r"C:\Users\yusuke\.cursor\projects\c-Users-yusuke-Desktop-project-FlightAcademyTsx\agent-tools\60d8036d-887f-4057-992b-2682512f915c.txt"
).read_text(encoding="utf-8")
env = json.loads(raw)
text = env["result"]
m = re.search(
    r"<untrusted-data-[0-9a-f-]+>\s*\n(\[.*?\])\s*\n</untrusted-data-",
    text,
    re.S,
)
rows = json.loads(m.group(1))
out = Path(
    r"c:\Users\yusuke\Desktop\project\FlightAcademyTsx\scripts\cpl_exam\data\db_mlit_sample_dump.json"
)
out.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
print(len(rows), out)
