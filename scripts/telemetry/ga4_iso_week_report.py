"""Fetch GA4 ISO-week (Mon-Sun, Asia/Tokyo) metrics for weekly telemetry.

Credentials (first match):
  1. GA4_SA_JSON — raw service-account JSON (GitHub Actions secret)
  2. GOOGLE_APPLICATION_CREDENTIALS — path to JSON file
  3. %APPDATA%/FlightAcademy/secrets/ga-mcp-readonly.json (local default)

Does not print private keys. Exit 0 on API success even if all metrics are zero.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any

PROPERTY_ID = "532610432"
SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"]
# Japan has no DST; avoid zoneinfo/tzdata (missing on some Windows Pythons).
TZ = timezone(timedelta(hours=9), name="Asia/Tokyo")
LOCAL_SA = (
    Path(os.environ.get("APPDATA", str(Path.home() / "AppData/Roaming")))
    / "FlightAcademy"
    / "secrets"
    / "ga-mcp-readonly.json"
)


def last_completed_iso_week(today: date) -> tuple[str, date, date]:
    """ISO week whose Sunday is the most recent Sunday on or before today."""
    weekday = today.isoweekday()  # Mon=1 .. Sun=7
    last_sunday = today if weekday == 7 else today - timedelta(days=weekday)
    start = last_sunday - timedelta(days=6)
    iso = start.isocalendar()
    label = f"{iso.year}-W{iso.week:02d}"
    return label, start, last_sunday


def previous_iso_week(start: date) -> tuple[str, date, date]:
    prev_start = start - timedelta(days=7)
    prev_end = start - timedelta(days=1)
    iso = prev_start.isocalendar()
    label = f"{iso.year}-W{iso.week:02d}"
    return label, prev_start, prev_end


def parse_iso_week(label: str) -> tuple[date, date]:
    if not re.fullmatch(r"\d{4}-W\d{2}", label):
        raise ValueError(f"ISO week must look like 2026-W33, got {label!r}")
    year_s, week_s = label.split("-W", 1)
    year = int(year_s)
    week = int(week_s)
    start = date.fromisocalendar(year, week, 1)
    end = date.fromisocalendar(year, week, 7)
    return start, end


def load_credentials() -> Any:
    from google.oauth2 import service_account

    raw = os.environ.get("GA4_SA_JSON", "").strip()
    if raw:
        info = json.loads(raw)
        return service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
    path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "").strip()
    if path:
        return service_account.Credentials.from_service_account_file(path, scopes=SCOPES)
    if LOCAL_SA.is_file():
        return service_account.Credentials.from_service_account_file(str(LOCAL_SA), scopes=SCOPES)
    raise FileNotFoundError(
        "No GA4 credentials: set GA4_SA_JSON, GOOGLE_APPLICATION_CREDENTIALS, or local SA JSON"
    )


def run_report(token: str, body: dict[str, Any]) -> dict[str, Any]:
    req = urllib.request.Request(
        f"https://analyticsdata.googleapis.com/v1beta/properties/{PROPERTY_ID}:runReport",
        data=json.dumps(body).encode(),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            payload: dict[str, Any] = json.load(resp)
            return payload
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:800]
        raise RuntimeError(f"GA4 Data API HTTP {exc.code}: {detail}") from exc


def simplify(report: dict[str, Any]) -> list[dict[str, list[str]]]:
    out: list[dict[str, list[str]]] = []
    for row in report.get("rows") or []:
        dims = [str(x.get("value", "")) for x in row.get("dimensionValues") or []]
        mets = [str(x.get("value", "")) for x in row.get("metricValues") or []]
        out.append({"d": dims, "m": mets})
    return out


def totals_from(rows: list[dict[str, list[str]]]) -> dict[str, int]:
    if not rows:
        return {"activeUsers": 0, "sessions": 0, "screenPageViews": 0, "engagedSessions": 0}
    mets = rows[0]["m"]
    return {
        "activeUsers": int(mets[0]),
        "sessions": int(mets[1]),
        "screenPageViews": int(mets[2]),
        "engagedSessions": int(mets[3]),
    }


def self_test() -> None:
    label, start, end = last_completed_iso_week(date(2026, 8, 18))
    assert label == "2026-W33", label
    assert start.isoformat() == "2026-08-10", start
    assert end.isoformat() == "2026-08-16", end
    label, start, end = last_completed_iso_week(date(2026, 8, 25))
    assert label == "2026-W34", label
    assert start.isoformat() == "2026-08-17"
    assert end.isoformat() == "2026-08-23"
    label, start, end = last_completed_iso_week(date(2026, 8, 17))
    assert label == "2026-W33", label
    p_label, p_start, p_end = previous_iso_week(date(2026, 8, 10))
    assert p_label == "2026-W32"
    assert p_start.isoformat() == "2026-08-03"
    assert p_end.isoformat() == "2026-08-09"
    s, e = parse_iso_week("2026-W34")
    assert s.isoformat() == "2026-08-17" and e.isoformat() == "2026-08-23"
    try:
        parse_iso_week("W33")
        raise AssertionError("expected ValueError")
    except ValueError:
        pass
    print("self-test ok")


def build_report(token: str, week_label: str, start: date, end: date) -> dict[str, Any]:
    start_s = start.isoformat()
    end_s = end.isoformat()
    prev_label, prev_start, prev_end = previous_iso_week(start)
    range_this = {"startDate": start_s, "endDate": end_s}
    range_prev = {"startDate": prev_start.isoformat(), "endDate": prev_end.isoformat()}

    tot = run_report(
        token,
        {
            "dateRanges": [range_this],
            "metrics": [
                {"name": "activeUsers"},
                {"name": "sessions"},
                {"name": "screenPageViews"},
                {"name": "engagedSessions"},
            ],
        },
    )
    prev = run_report(
        token,
        {
            "dateRanges": [range_prev],
            "metrics": [
                {"name": "activeUsers"},
                {"name": "sessions"},
                {"name": "screenPageViews"},
                {"name": "engagedSessions"},
            ],
        },
    )
    daily = run_report(
        token,
        {
            "dateRanges": [range_this],
            "dimensions": [{"name": "date"}],
            "metrics": [
                {"name": "activeUsers"},
                {"name": "sessions"},
                {"name": "screenPageViews"},
                {"name": "engagedSessions"},
            ],
            "orderBys": [{"dimension": {"dimensionName": "date"}}],
            "limit": 10,
        },
    )
    pages = run_report(
        token,
        {
            "dateRanges": [range_this],
            "dimensions": [{"name": "pagePath"}],
            "metrics": [
                {"name": "screenPageViews"},
                {"name": "activeUsers"},
                {"name": "sessions"},
            ],
            "orderBys": [{"metric": {"metricName": "screenPageViews"}, "desc": True}],
            "limit": 20,
        },
    )
    articles = run_report(
        token,
        {
            "dateRanges": [range_this],
            "dimensionFilter": {
                "filter": {
                    "fieldName": "pagePath",
                    "stringFilter": {"matchType": "CONTAINS", "value": "/articles", "caseSensitive": False},
                }
            },
            "dimensions": [{"name": "date"}, {"name": "pagePath"}],
            "metrics": [
                {"name": "screenPageViews"},
                {"name": "activeUsers"},
                {"name": "sessions"},
            ],
            "orderBys": [{"dimension": {"dimensionName": "date"}}],
            "limit": 50,
        },
    )
    source = run_report(
        token,
        {
            "dateRanges": [range_this],
            "dimensions": [{"name": "sessionSource"}, {"name": "sessionMedium"}],
            "metrics": [
                {"name": "sessions"},
                {"name": "activeUsers"},
                {"name": "screenPageViews"},
            ],
            "orderBys": [{"metric": {"metricName": "sessions"}, "desc": True}],
            "limit": 15,
        },
    )
    device = run_report(
        token,
        {
            "dateRanges": [range_this],
            "dimensions": [{"name": "deviceCategory"}],
            "metrics": [
                {"name": "sessions"},
                {"name": "activeUsers"},
                {"name": "screenPageViews"},
            ],
            "orderBys": [{"metric": {"metricName": "sessions"}, "desc": True}],
            "limit": 10,
        },
    )
    landing = run_report(
        token,
        {
            "dateRanges": [range_this],
            "dimensions": [{"name": "landingPage"}],
            "metrics": [
                {"name": "sessions"},
                {"name": "activeUsers"},
                {"name": "engagedSessions"},
            ],
            "orderBys": [{"metric": {"metricName": "sessions"}, "desc": True}],
            "limit": 15,
        },
    )
    events = run_report(
        token,
        {
            "dateRanges": [range_this],
            "dimensions": [{"name": "eventName"}],
            "metrics": [{"name": "eventCount"}, {"name": "totalUsers"}],
            "dimensionFilter": {
                "filter": {
                    "fieldName": "eventName",
                    "inListFilter": {
                        "values": [
                            "quiz_hub_view",
                            "quiz_session_start",
                            "quiz_session_complete",
                            "quiz_start",
                            "chunk_recovery_reload",
                            "article_to_quiz_click",
                        ]
                    },
                }
            },
            "orderBys": [{"metric": {"metricName": "eventCount"}, "desc": True}],
            "limit": 20,
        },
    )

    tot_rows = simplify(tot)
    prev_rows = simplify(prev)
    return {
        "week": week_label,
        "timezone": "Asia/Tokyo",
        "startDate": start_s,
        "endDate": end_s,
        "prevWeek": prev_label,
        "prevStartDate": prev_start.isoformat(),
        "prevEndDate": prev_end.isoformat(),
        "fetchedAt": datetime.now(TZ).isoformat(),
        "propertyId": PROPERTY_ID,
        "totals": totals_from(tot_rows),
        "prevTotals": totals_from(prev_rows),
        "daily": simplify(daily),
        "pages": simplify(pages),
        "articles": simplify(articles),
        "source": simplify(source),
        "device": simplify(device),
        "landing": simplify(landing),
        "events": simplify(events),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="GA4 ISO-week telemetry fetch")
    parser.add_argument("--week", help="ISO week like 2026-W33 (default: last completed week in JST)")
    parser.add_argument("--out", help="Write JSON to this path")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        self_test()
        return 0

    today = datetime.now(TZ).date()
    if args.week:
        week_label = args.week.strip()
        start, end = parse_iso_week(week_label)
        iso = start.isocalendar()
        week_label = f"{iso.year}-W{iso.week:02d}"
    else:
        week_label, start, end = last_completed_iso_week(today)

    from google.auth.transport.requests import Request

    creds = load_credentials()
    creds.refresh(Request())
    report = build_report(creds.token, week_label, start, end)

    if args.out:
        out_path = Path(args.out)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    else:
        json.dump(report, sys.stdout, ensure_ascii=False, indent=2)
        sys.stdout.write("\n")

    github_out = os.environ.get("GITHUB_OUTPUT")
    if github_out:
        with Path(github_out).open("a", encoding="utf-8") as handle:
            handle.write(f"week={week_label}\n")
            handle.write(f"startDate={start.isoformat()}\n")
            handle.write(f"endDate={end.isoformat()}\n")

    print(
        f"ok {week_label} {start.isoformat()}..{end.isoformat()} "
        f"users={report['totals']['activeUsers']} sessions={report['totals']['sessions']}",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"error: {exc}", file=sys.stderr)
        raise SystemExit(1)
