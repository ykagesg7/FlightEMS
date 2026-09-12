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


def short_week(week: str) -> str:
    if week.startswith("20") and "-W" in week:
        return week.split("-", 1)[1]
    return week


def _event_count(report: dict[str, Any], name: str) -> int:
    total = 0
    for row in report.get("events") or []:
        if _dim(row) == name:
            total += _metric(row)
    return total


def _quiz_event_count(report: dict[str, Any]) -> int:
    total = 0
    for row in report.get("events") or []:
        if _dim(row).startswith("quiz_"):
            total += _metric(row)
    return total


def _page_pv(report: dict[str, Any], path: str) -> int:
    for row in report.get("pages") or []:
        if _dim(row) == path:
            return _metric(row)
    return 0


def _kebab_pages(report: dict[str, Any]) -> list[str]:
    found: list[str] = []
    for row in report.get("pages") or []:
        path = _dim(row)
        leaf = path.rsplit("/", 1)[-1]
        if "-" in leaf and "_" not in leaf and leaf not in {"airspace-3d"}:
            found.append(f"`{leaf}`")
    return found


def _referral_sessions(report: dict[str, Any]) -> tuple[int, int]:
    referral = 0
    total = 0
    for row in report.get("source") or []:
        sess = _metric(row)
        total += sess
        medium = _dim(row, 1).lower()
        source = _dim(row, 0).lower()
        if medium == "referral" or "accounts.google.com" in source:
            referral += sess
    return referral, total


def machine_board_updates(report: dict[str, Any]) -> dict[str, dict[str, str]]:
    week = str(report.get("week") or "YYYY-Wnn")
    label = short_week(week)
    prev = short_week(str(report.get("prevWeek") or ""))
    users = _int((report.get("totals") or {}).get("activeUsers"))
    prev_users = _int((report.get("prevTotals") or {}).get("activeUsers"))
    referral, source_total = _referral_sessions(report)
    chunk = _event_count(report, "chunk_recovery_reload")
    planning = _page_pv(report, "/planning")
    kebab = _kebab_pages(report)
    quiz = _quiz_event_count(report)
    source_bit = f"{referral}/{source_total} sess" if source_total else "流入行なし"
    kebab_next = (
        f"{label} でも kebab 着地あり（{' / '.join(kebab)}）。リダイレクト継続確認"
        if kebab
        else f"{label} は kebab 着地なし → closed 維持"
    )
    return {
        "T-01": {
            "next": (
                f"Brevo 週間ダイジェスト URL に UTM を検討。"
                f"{label} も referral 主体（{source_bit}）でメール切り出し困難"
            ),
            "mention": label,
        },
        "T-02": {
            "next": (
                f"{label} は **users {users}**"
                + (f"（{prev}: {prev_users}）" if prev else "")
                + "。週次比較はノイズ大"
            ),
            "mention": label,
        },
        "T-03": {
            "next": (
                f"{label} は `/planning` PV {planning}。"
                f"`chunk_recovery_reload` **{chunk}**。Sentry は CI 未取得"
            ),
            "mention": label,
        },
        "T-04": {"next": kebab_next, "mention": label},
        "T-05": {
            "next": (
                f"W36 ベースライン → W37–W38 計測 → W39 判定。"
                f"{label} にも quiz_* イベント **{quiz}**"
            ),
            "mention": None,
        },
    }


def machine_issues_actions(report: dict[str, Any]) -> tuple[list[str], list[str]]:
    week = str(report.get("week") or "YYYY-Wnn")
    label = short_week(week)
    users = _int((report.get("totals") or {}).get("activeUsers"))
    prev_users = _int((report.get("prevTotals") or {}).get("activeUsers"))
    pv = _int((report.get("totals") or {}).get("screenPageViews"))
    prev_pv = _int((report.get("prevTotals") or {}).get("screenPageViews"))
    referral, source_total = _referral_sessions(report)
    chunk = _event_count(report, "chunk_recovery_reload")
    quiz = _quiz_event_count(report)
    kebab = _kebab_pages(report)

    user_delta = "増加" if users > prev_users else "減少" if users < prev_users else "横ばい"
    issues = [
        f"users は直前 ISO 比で{user_delta}（{users} / 前週 {prev_users}）。PV {pv}（前週 {prev_pv}）（T-02）。",
        (
            f"流入は referral 主体（{referral}/{source_total} sess）でメール効果が見えない（T-01）。"
            if source_total
            else "流入行がなくメール効果の切り出しは困難（T-01）。"
        ),
        f"Sentry は CI 未取得。GA 上の `chunk_recovery_reload` は {chunk}（T-03）。",
        (
            f"quiz_* イベント {quiz} — A2-a（T-05）ベースラインにはまだ使えない。"
            if quiz == 0
            else f"quiz_* イベント {quiz}（T-05）。"
        ),
    ]
    actions = [
        "- [ ] T-01: 次のダイジェスト送信前に UTM 付与を実装検討（承認後）。",
        "- [ ] T-03: Desktop Sentry MCP または Issues UI で `FLIGHT-ACADEMY-4` lastSeen を確認。",
        (
            f"- [ ] T-05: W36 までボード維持。{label} は quiz ゼロのためベースライン対象外。"
            if quiz == 0
            else f"- [ ] T-05: {label} の quiz 計測をベースラインに残す。"
        ),
        (
            f"- [x] T-04: {label} でも kebab 着地を再確認 → closed 維持。"
            if kebab
            else f"- [x] T-04: {label} は kebab 着地なし → closed 維持。"
        ),
    ]
    return issues, actions


def format_review_facts(
    report: dict[str, Any],
    review_date: date,
    *,
    run_url: str = "",
) -> str:
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
    issues, actions = machine_issues_actions(report)
    issue_block = "\n".join(f"{i}. {line}" for i, line in enumerate(issues, start=1))
    action_block = "\n".join(actions)
    if run_url:
        data_line = (
            f"**データ取得**: GitHub Actions `weekly-telemetry-ga4` artifact "
            f"[run {run_url.rstrip('/').split('/')[-1]}]({run_url}) / Sentry MCP（未取得）"
        )
    else:
        data_line = (
            "**データ取得**: GitHub Actions `weekly-telemetry-ga4` artifact / Sentry MCP（未取得）"
        )

    return "\n".join(
        [
            f"### {week}（{start}〜{end} / レビュー {review_date.isoformat()}）",
            "",
            data_line,
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
            "- **Sentry**: CI 未取得。7d unresolved / `FLIGHT-ACADEMY-4` lastSeen は未確認。",
            "",
            "#### 課題（Issues）",
            "",
            issue_block,
            "",
            "#### 解決案（Actions）",
            "",
            action_block,
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
    assert "CI 未取得" in text
    assert "T-02" in text
    assert "- …" not in text
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
