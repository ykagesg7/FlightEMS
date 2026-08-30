"""Format GA4 ISO-week JSON as Slack mrkdwn (facts only).

Does not mention users/bots (@). Does not emit approval commands as a
standalone line. Optional --post uses SLACK_BOT_TOKEN or SLACK_WEBHOOK_URL.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

CHANNEL_ID = "C0BQ5R19QDV"
SLACK_WORKSPACE = "flightacademyhq"
MENTION_RE = re.compile(r"(?<![A-Za-z0-9_])@|</?@[A-Z0-9]+>")


def _int(value: Any) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


def _delta(now: int, prev: int) -> str:
    diff = now - prev
    sign = "+" if diff > 0 else ""
    return f"{now}（直前ISO {prev}、差 {sign}{diff}）"


def _dim(row: dict[str, Any], index: int = 0) -> str:
    dims = row.get("d") or []
    if index >= len(dims):
        return "(none)"
    return str(dims[index])


def _metric(row: dict[str, Any], index: int = 0) -> int:
    mets = row.get("m") or []
    if index >= len(mets):
        return 0
    return _int(mets[index])


def _sanitize(text: str) -> str:
    text = text.replace("＠", "@")
    text = MENTION_RE.sub("(at)", text)
    text = text.replace("<@", "(at)")
    return text


def slack_permalink(channel_id: str, message_ts: str, workspace: str = SLACK_WORKSPACE) -> str:
    ts_for_url = message_ts.replace(".", "")
    return f"https://{workspace}.slack.com/archives/{channel_id}/p{ts_for_url}"


def thread_reply_hint(permalink: str) -> str:
    return f"スレッド: <{permalink}|この投稿へ返信（週次レビュー・承認）>"


def format_slack_mrkdwn(
    report: dict[str, Any],
    run_url: str = "",
    thread_permalink: str = "",
) -> str:
    week = str(report.get("week") or "unknown")
    start = str(report.get("startDate") or "?")
    end = str(report.get("endDate") or "?")
    prev = str(report.get("prevWeek") or "?")
    totals = report.get("totals") or {}
    prev_totals = report.get("prevTotals") or {}
    users = _int(totals.get("activeUsers"))
    sessions = _int(totals.get("sessions"))
    pv = _int(totals.get("screenPageViews"))
    engaged = _int(totals.get("engagedSessions"))
    p_users = _int(prev_totals.get("activeUsers"))
    p_sessions = _int(prev_totals.get("sessions"))
    p_pv = _int(prev_totals.get("screenPageViews"))
    p_engaged = _int(prev_totals.get("engagedSessions"))

    daily_bits: list[str] = []
    for row in report.get("daily") or []:
        day = _dim(row)
        sess = _metric(row, 1)
        views = _metric(row, 2)
        if sess or views:
            daily_bits.append(f"{day} セッション {sess} / PV {views}")

    pages: list[str] = []
    for row in (report.get("pages") or [])[:3]:
        pages.append(f"`{_sanitize(_dim(row))}` PV {_metric(row)}")

    events: list[str] = []
    for row in report.get("events") or []:
        events.append(f"`{_sanitize(_dim(row))}` {_metric(row)}")

    lines = [
        f"*週次テレメトリ GA4 ISO {week}* `{start}`-`{end}`（Asia/Tokyo）",
        f"id: telemetry-notify {week}",
        f"users {_delta(users, p_users)}",
        f"sessions {_delta(sessions, p_sessions)}",
        f"PV {_delta(pv, p_pv)}",
        f"engaged {_delta(engaged, p_engaged)}",
        f"直前ISO週: {prev}（正本の土曜窓 W32/W33 とは比べない）",
    ]
    if daily_bits:
        lines.append("日次（非ゼロ）: " + "; ".join(daily_bits[:7]))
    if pages:
        lines.append("上位ページ: " + " | ".join(pages))
    if events:
        lines.append("イベント: " + " | ".join(events))
    else:
        lines.append("イベント: なし")
    if run_url:
        lines.append(f"Actions: <{run_url}|実行ログ>")
    if thread_permalink:
        lines.append(thread_reply_hint(thread_permalink))
    lines.append("Sentry: 2a では未取得。週次レビューで追記する。")
    lines.append(
        "正本転記: 火曜レビューの当該 ISO 週のみ。この投稿は承認コマンドではない。"
    )
    lines.append(
        "次: このスレッドで Cursor エージェントをメンションして週次レビュー"
        "（この投稿ではメンションしない）。"
    )
    lines.append(
        "承認例（スレッド返信・一行・大文字）: "
        "`APPROVE-DOC` / `HOLD` / `SKIP T-xx`"
    )
    text = "\n".join(lines)
    if MENTION_RE.search(text) or "<@" in text:
        raise ValueError("formatter refused to emit a Slack mention")
    return text


def find_report_json(root: Path) -> Path:
    direct = root / "ga4-iso-week.json"
    if direct.is_file():
        return direct
    matches = sorted(root.rglob("ga4-iso-week.json"))
    if not matches:
        raise FileNotFoundError(f"ga4-iso-week.json not under {root}")
    return matches[0]


def post_slack(text: str) -> str | None:
    """Post facts. Returns message_ts when using chat.postMessage."""
    webhook = os.environ.get("SLACK_WEBHOOK_URL", "").strip()
    token = os.environ.get("SLACK_BOT_TOKEN", "").strip()
    channel = os.environ.get("SLACK_CHANNEL_ID", CHANNEL_ID).strip() or CHANNEL_ID
    workspace = os.environ.get("SLACK_WORKSPACE", SLACK_WORKSPACE).strip() or SLACK_WORKSPACE
    payload: dict[str, Any]
    url: str
    headers = {"Content-Type": "application/json; charset=utf-8"}
    if token:
        url = "https://slack.com/api/chat.postMessage"
        headers["Authorization"] = f"Bearer {token}"
        payload = {
            "channel": channel,
            "text": text,
            "unfurl_links": False,
            "unfurl_media": False,
        }
    elif webhook:
        url = webhook
        payload = {"text": text, "unfurl_links": False, "unfurl_media": False}
    else:
        raise RuntimeError("set SLACK_WEBHOOK_URL or SLACK_BOT_TOKEN")

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", "replace")[:400]
        raise RuntimeError(f"Slack HTTP {exc.code}: {detail}") from exc

    if webhook:
        if body.strip() != "ok":
            raise RuntimeError(f"webhook response: {body[:200]}")
        return None

    parsed = json.loads(body)
    if not parsed.get("ok"):
        raise RuntimeError(f"chat.postMessage: {parsed.get('error')}")
    message_ts = str(parsed.get("ts") or "")
    if not message_ts:
        return None

    permalink = slack_permalink(channel, message_ts, workspace=workspace)
    updated = text + "\n" + thread_reply_hint(permalink)
    update_payload = {
        "channel": channel,
        "ts": message_ts,
        "text": updated,
        "unfurl_links": False,
        "unfurl_media": False,
    }
    update_req = urllib.request.Request(
        "https://slack.com/api/chat.update",
        data=json.dumps(update_payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": f"Bearer {token}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(update_req, timeout=30) as resp:
            update_body = resp.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", "replace")[:400]
        raise RuntimeError(f"Slack update HTTP {exc.code}: {detail}") from exc
    update_parsed = json.loads(update_body)
    if not update_parsed.get("ok"):
        raise RuntimeError(f"chat.update: {update_parsed.get('error')}")
    return message_ts


def self_test() -> None:
    sample = {
        "week": "2026-W33",
        "startDate": "2026-08-10",
        "endDate": "2026-08-16",
        "prevWeek": "2026-W32",
        "totals": {"activeUsers": 1, "sessions": 4, "screenPageViews": 25, "engagedSessions": 3},
        "prevTotals": {
            "activeUsers": 7,
            "sessions": 12,
            "screenPageViews": 62,
            "engagedSessions": 6,
        },
        "daily": [{"d": ["20260810"], "m": ["1", "2", "11", "2"]}],
        "pages": [{"d": ["/@not-a-mention"], "m": ["9", "1", "2"]}],
        "events": [{"d": ["chunk_recovery_reload"], "m": ["1", "1"]}],
    }
    text = format_slack_mrkdwn(sample, run_url="https://example.invalid/run")
    assert "telemetry-notify 2026-W33" in text
    assert "週次テレメトリ" in text
    assert "メンションしない" in text
    link = slack_permalink(CHANNEL_ID, "1787621958.649089")
    assert link.endswith("/p1787621958649089")
    with_link = format_slack_mrkdwn(
        sample,
        run_url="https://example.invalid/run",
        thread_permalink=link,
    )
    assert "この投稿へ返信" in with_link
    assert "@not-a-mention" not in text
    assert "(at)not-a-mention" in text
    assert "<@" not in text
    assert not MENTION_RE.search(text)
    assert "APPROVE-DOC" in text
    assert not text.strip().startswith("APPROVE-DOC")
    print("self-test ok")


def main() -> int:
    parser = argparse.ArgumentParser(description="Format/post GA4 Slack facts")
    parser.add_argument("--in", dest="infile", help="ga4-iso-week.json")
    parser.add_argument("--dir", help="Directory to search for ga4-iso-week.json")
    parser.add_argument("--run-url", default="", help="GitHub Actions run URL")
    parser.add_argument("--thread-permalink", default="", help="Optional Slack thread permalink")
    parser.add_argument("--post", action="store_true")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        self_test()
        return 0

    if args.infile:
        path = Path(args.infile)
    elif args.dir:
        path = find_report_json(Path(args.dir))
    else:
        raise SystemExit("need --in, --dir, or --self-test")

    report = json.loads(path.read_text(encoding="utf-8"))
    text = format_slack_mrkdwn(
        report,
        run_url=args.run_url,
        thread_permalink=args.thread_permalink,
    )
    if args.post:
        post_slack(text)
        print("posted", file=sys.stderr)
    else:
        sys.stdout.write(text + "\n")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"error: {exc}", file=sys.stderr)
        raise SystemExit(1)
