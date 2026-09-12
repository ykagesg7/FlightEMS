"""Patch Weekly_Telemetry_Review.md with a machine-generated ISO-week section."""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from format_ga4_review import format_review_facts, machine_board_updates, short_week

TZ = timezone(timedelta(hours=9), name="Asia/Tokyo")
LOG_MARKER = "## 週次ログ（新しい週が上）"
CHANGELOG_MARKER = "## 変更履歴"
DOC_DEFAULT = Path("docs/ops/Weekly_Telemetry_Review.md")
HEADER_RE = re.compile(r"^\*\*最終更新\*\*:.*$", re.M)
BOARD_ROW_RE = re.compile(
    r"^\| (T-\d{2}) \| (.+?) \| (.+?) \| (.+?) \| (.+?) \| (.+?) \|$",
    re.M,
)
CHANGELOG_ROW_RE = re.compile(
    r"(\| 日付 \| 内容 \|\n\|------\|------\|\n)",
)


def week_heading_present(doc: str, week: str) -> bool:
    return f"### {week}（" in doc or f"### {week} " in doc


def update_header(doc: str, week: str, review_date: date) -> str:
    line = f"**最終更新**: {review_date.isoformat()}（{week} 正本 L0 マージ待ち）  "
    if HEADER_RE.search(doc):
        return HEADER_RE.sub(line, doc, count=1)
    return doc


def update_board(doc: str, report: dict[str, Any]) -> str:
    updates = machine_board_updates(report)

    def repl(match: re.Match[str]) -> str:
        task_id, issue, priority, state, _next, mention = match.groups()
        patch = updates.get(task_id)
        if not patch:
            return match.group(0)
        next_action = patch["next"]
        new_mention = patch["mention"] if patch["mention"] is not None else mention
        return f"| {task_id} | {issue} | {priority} | {state} | {next_action} | {new_mention} |"

    return BOARD_ROW_RE.sub(repl, doc)


def insert_week_section(doc: str, section: str) -> str:
    marker = f"{LOG_MARKER}\n\n"
    if marker not in doc:
        raise ValueError(f"missing marker: {LOG_MARKER}")
    block = section.rstrip() + "\n\n---\n\n"
    return doc.replace(marker, marker + block, 1)


def update_changelog(doc: str, week: str, review_date: date) -> str:
    label = short_week(week)
    row = (
        f"| {review_date.isoformat()} | 自動追記 **{week}**（フェーズ2b CI）。"
        f"Sentry は CI 未取得。 |\n"
    )
    match = CHANGELOG_ROW_RE.search(doc)
    if not match:
        raise ValueError("missing changelog table header")
    if week in doc[match.end() : match.end() + 200] or label in doc[match.end() : match.end() + 80]:
        if f"**{week}**" in doc[match.end() : match.end() + 200]:
            return doc
    return doc[: match.end()] + row + doc[match.end() :]


def apply_week_review(
    doc: str,
    report: dict[str, Any],
    review_date: date,
    *,
    run_url: str = "",
) -> tuple[str, bool]:
    week = str(report.get("week") or "")
    if not week:
        raise ValueError("report missing week")
    if week_heading_present(doc, week):
        return doc, False
    section = format_review_facts(report, review_date, run_url=run_url)
    updated = update_header(doc, week, review_date)
    updated = update_board(updated, report)
    updated = insert_week_section(updated, section)
    updated = update_changelog(updated, week, review_date)
    return updated, True


def self_test() -> None:
    sample_doc = """# 週次テレメトリ・レビュー（GA4 + Sentry）

**最終更新**: 2026-08-17（old）  

## オープン課題ボード（ローリング）

| ID | 課題 | 優先 | 状態 | 次アクション | 最終言及 |
|----|------|------|------|--------------|----------|
| T-01 | mail | 中 | open | old next | W33 |
| T-02 | vol | 低 | watch | old | W33 |
| T-03 | chunk | 中 | open | old | W33 |
| T-04 | kebab | — | closed | old | W33 |
| T-05 | quiz | 高 | open | W36 ベースライン | W36 計画 |

## 週次ログ（新しい週が上）

### 2026-W33（2026-08-09〜08-15 / レビュー 2026-08-17）

old week

## 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-08-17 | old |
"""
    report = {
        "week": "2026-W34",
        "startDate": "2026-08-17",
        "endDate": "2026-08-23",
        "prevWeek": "2026-W33",
        "totals": {"activeUsers": 2, "sessions": 3, "screenPageViews": 10, "engagedSessions": 1},
        "prevTotals": {
            "activeUsers": 1,
            "sessions": 4,
            "screenPageViews": 25,
            "engagedSessions": 3,
        },
        "daily": [],
        "pages": [{"d": ["/"], "m": ["4"]}],
        "events": [],
        "source": [{"d": ["accounts.google.com", "referral"], "m": ["3"]}],
        "device": [{"d": ["mobile"], "m": ["3"]}],
    }
    updated, changed = apply_week_review(sample_doc, report, date(2026, 8, 25))
    assert changed
    assert "### 2026-W34（2026-08-17〜2026-08-23 / レビュー 2026-08-25）" in updated
    assert updated.find("### 2026-W34") < updated.find("### 2026-W33")
    assert "2026-W34 正本 L0 マージ待ち" in updated
    assert "| T-01 |" in updated and "| W34 |" in updated
    assert "W36 計画" in updated
    assert "自動追記 **2026-W34**" in updated
    again, changed_again = apply_week_review(updated, report, date(2026, 8, 25))
    assert not changed_again
    assert again == updated
    print("self-test ok")


def main() -> int:
    parser = argparse.ArgumentParser(description="Apply GA4 week section to telemetry review")
    parser.add_argument("--in", dest="infile", help="ga4-iso-week.json")
    parser.add_argument("--doc", default=str(DOC_DEFAULT), help="Weekly_Telemetry_Review.md")
    parser.add_argument("--run-url", default="", help="GA4 Actions run URL")
    parser.add_argument("--review-date", help="YYYY-MM-DD (default: today JST)")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        self_test()
        return 0
    if not args.infile:
        raise SystemExit("need --in or --self-test")

    if args.review_date:
        review = date.fromisoformat(args.review_date)
    else:
        review = datetime.now(TZ).date()

    report = json.loads(Path(args.infile).read_text(encoding="utf-8"))
    path = Path(args.doc)
    original = path.read_text(encoding="utf-8")
    updated, changed = apply_week_review(original, report, review, run_url=args.run_url)
    if changed:
        path.write_text(updated, encoding="utf-8")
        print("applied")
    else:
        print("unchanged")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"error: {exc}", file=sys.stderr)
        raise SystemExit(1)
