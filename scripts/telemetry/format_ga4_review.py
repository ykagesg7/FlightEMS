"""Build the Facts block of the weekly telemetry review from GA4 JSON."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any

TZ = timezone(timedelta(hours=9), name="Asia/Tokyo")


def _int(value: Any) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


def _dim(row: dict[str, Any], index: int = 0) -> str:
    dims = row.get("d") or []
    if index >= len(dims):
        return "(なし)"
    return str(dims[index])


def _metric(row: dict[str, Any], index: int = 0) -> int:
    mets = row.get("m") or []
    if index >= len(mets):
        return 0
    return _int(mets[index])


def format_review_facts(report: dict[str, Any], review_date: date) -> str:
    week = str(report.get("week") or "YYYY-Wnn")
    start = str(report.get("startDate") or "?")
    end = str(report.get("endDate") or "?")
    prev = str(report.get("prevWeek") or "?")
    totals = report.get("totals") or {}
    prev_totals = report.get("prevTotals") or {}

    daily_lines: list[str] = []
    for row in report.get("daily") or []:
        day = _dim(row)
        users = _metric(row, 0)
        sess = _metric(row, 1)
        views = _metric(row, 2)
        if sess or views or users:
            daily_lines.append(f"{day}: users {users} / sess {sess} / PV {views}")

    page_lines: list[str] = []
    for row in (report.get("pages") or [])[:8]:
        page_lines.append(f"`{_dim(row)}` PV {_metric(row)}")

    event_lines: list[str] = []
    for row in report.get("events") or []:
        event_lines.append(f"`{_dim(row)}` {_metric(row)}")

    source_lines: list[str] = []
    for row in (report.get("source") or [])[:5]:
        source_lines.append(f"{_dim(row, 0)} / {_dim(row, 1)} sess {_metric(row)}")

    device_lines: list[str] = []
    for row in report.get("device") or []:
        device_lines.append(f"{_dim(row)} sess {_metric(row)}")

    facts_daily = "、".join(daily_lines) if daily_lines else "（非ゼロ日なし）"
    facts_pages = "、".join(page_lines) if page_lines else "（なし）"
    facts_events = "、".join(event_lines) if event_lines else "なし"
    facts_source = "、".join(source_lines) if source_lines else "（なし）"
    facts_device = "、".join(device_lines) if device_lines else "（なし）"

    return "\n".join(
        [
            f"### {week}（{start}〜{end} / レビュー {review_date.isoformat()}）",
            "",
            "**データ取得**: GitHub Actions `weekly-telemetry-ga4` artifact / Sentry MCP",
            f"**比較**: 直前 ISO 週 {prev} のみ（旧土曜窓とは比べない）",
            "",
            "#### 現状（Facts）",
            "",
            "| 指標 | 今週 | 直前 ISO 週 |",
            "|------|-----:|------------:|",
            f"| activeUsers | **{_int(totals.get('activeUsers'))}** | {_int(prev_totals.get('activeUsers'))} |",
            f"| sessions | **{_int(totals.get('sessions'))}** | {_int(prev_totals.get('sessions'))} |",
            f"| screenPageViews | **{_int(totals.get('screenPageViews'))}** | {_int(prev_totals.get('screenPageViews'))} |",
            f"| engagedSessions | **{_int(totals.get('engagedSessions'))}** | {_int(prev_totals.get('engagedSessions'))} |",
            "",
            f"- **日次**: {facts_daily}",
            f"- **上位ページ**: {facts_pages}",
            f"- **流入**: {facts_source}",
            f"- **端末**: {facts_device}",
            f"- **イベント**: {facts_events}",
            "- **Sentry**: （MCP で 7d unresolved / FLIGHT-ACADEMY-4 を追記）",
            "",
            "#### 課題（Issues）",
            "",
            "- …",
            "",
            "#### 解決案（Actions）",
            "",
            "- [ ] …",
            "- ボード更新: T-xx …",
            "",
            "#### メモ / 生データ",
            "",
            f"- Actions artifact `ga4-{week}`（正本には生 JSON を貼らない）",
            "",
        ]
    )


def self_test() -> None:
    sample = {
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
        "source": [],
        "device": [],
    }
    text = format_review_facts(sample, date(2026, 8, 25))
    assert "### 2026-W34" in text
    assert "レビュー 2026-08-25" in text
    assert "旧土曜窓とは比べない" in text
    assert "**2**" in text
    print("self-test ok")


def main() -> int:
    parser = argparse.ArgumentParser(description="GA4 JSON to weekly review Facts markdown")
    parser.add_argument("--in", dest="infile", help="ga4-iso-week.json")
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
    sys.stdout.write(format_review_facts(report, review))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"error: {exc}", file=sys.stderr)
        raise SystemExit(1)
