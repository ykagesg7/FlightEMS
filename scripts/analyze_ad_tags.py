#!/usr/bin/env python3
"""Analyze AD master CSV for 中・小分類 distribution."""
import csv
from collections import defaultdict
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
AD_PATH = Path(r"c:\Users\y_kag\Desktop\4ChoiceQuiz\problem\01_CPL\01_AD\_master_AD.csv")

def main():
    data = []
    with open(AD_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            data.append(row)

    by_tag = defaultdict(lambda: {"count": 0, "S": 0, "A": 0, "B": 0, "C": 0})
    for row in data:
        tag = row.get("中・小分類", "").strip()
        if tag:
            by_tag[tag]["count"] += 1
            imp = row.get("重要度", "").strip()
            if imp in ["S", "A", "B", "C"]:
                by_tag[tag][imp] += 1

    sorted_tags = sorted(by_tag.items(), key=lambda x: -x[1]["count"])
    out_path = PROJECT_ROOT / "docs" / "ad_tag_distribution.txt"
    with open(out_path, "w", encoding="utf-8") as f:
        for tag, stats in sorted_tags:
            line = f"{tag}|{stats['count']}|S:{stats['S']} A:{stats['A']} B:{stats['B']} C:{stats['C']}\n"
            f.write(line)
    print(f"Written to {out_path}")

if __name__ == "__main__":
    main()
