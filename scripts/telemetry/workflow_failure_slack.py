"""Post Slack alert when a weekly-telemetry GitHub Actions workflow fails.

Uses SLACK_WEBHOOK_URL or SLACK_BOT_TOKEN (same as notify/approve). Skips
quietly when neither is set. Does not emit @mentions.
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

CHANNEL_ID = "C0BQ5R19QDV"
TZ = timezone(timedelta(hours=9), name="Asia/Tokyo")
MENTION_RE = re.compile(r"(?<![A-Za-z0-9_])@|</?@[A-Z0-9]+>")
def last_completed_iso_week(today: date) -> str:
    weekday = today.isoweekday()
    last_sunday = today if weekday == 7 else today - timedelta(days=weekday)
    start = last_sunday - timedelta(days=6)
    iso = start.isocalendar()
    return f"{iso.year}-W{iso.week:02d}"


def default_week_label() -> str:
    return last_completed_iso_week(datetime_now_tokyo().date())


def datetime_now_tokyo() -> datetime:
    return datetime.now(TZ)


def _sanitize(text: str) -> str:
    if MENTION_RE.search(text) or "<@" in text:
        raise ValueError("refusing to emit a Slack mention")
    return text


def format_failure_message(
    *,
    workflow_name: str,
    week: str,
    run_url: str,
    failed_steps: list[str],
) -> str:
    week_part = week if week else "（ログで ISO 週を確認）"
    steps_part = ", ".join(failed_steps) if failed_steps else "（失敗ステップ未取得）"
    lines = [
        f"*週次テレメトリ CI 失敗* — {workflow_name}",
        f"ISO 週（推定）: `{week_part}`",
        f"失敗ステップ: {steps_part}",
        f"Actions: <{run_url}|実行ログ>",
        "対応: ログを確認し、必要なら workflow_dispatch で再実行。",
        "（この投稿は承認コマンドではない。L0 は一行 `APPROVE-DOC` のみ。）",
    ]
    return _sanitize("\n".join(lines))


def post_slack(text: str, thread_ts: str = "") -> None:
    webhook = os.environ.get("SLACK_WEBHOOK_URL", "").strip()
    token = os.environ.get("SLACK_BOT_TOKEN", "").strip()
    channel = os.environ.get("SLACK_CHANNEL_ID", CHANNEL_ID).strip() or CHANNEL_ID
    payload: dict[str, Any]
    headers = {"Content-Type": "application/json; charset=utf-8"}
    if webhook:
        url = webhook
        payload = {"text": text, "unfurl_links": False, "unfurl_media": False}
        if thread_ts:
            payload["thread_ts"] = thread_ts
    elif token:
        url = "https://slack.com/api/chat.postMessage"
        headers["Authorization"] = f"Bearer {token}"
        payload = {
            "channel": channel,
            "text": text,
            "unfurl_links": False,
            "unfurl_media": False,
        }
        if thread_ts:
            payload["thread_ts"] = thread_ts
    else:
        print("slack failure notify skipped (no SLACK_WEBHOOK_URL or SLACK_BOT_TOKEN)", file=sys.stderr)
        return

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
        return
    parsed = json.loads(body)
    if not parsed.get("ok"):
        raise RuntimeError(f"chat.postMessage: {parsed.get('error')}")


def load_jobs_json(path: str) -> list[dict[str, Any]]:
    raw = path if path.startswith("{") or path.startswith("[") else Path(path).read_text(encoding="utf-8")
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return []
    if isinstance(data, list):
        return [j for j in data if isinstance(j, dict)]
    jobs = data.get("jobs") if isinstance(data, dict) else None
    return [j for j in jobs or [] if isinstance(j, dict)]


def parse_failed_steps(jobs_json: str) -> list[str]:
    jobs = load_jobs_json(jobs_json)
    names: list[str] = []
    for job in jobs:
        if not isinstance(job, dict):
            continue
        if job.get("conclusion") != "failure":
            continue
        job_name = str(job.get("name") or "job")
        for step in job.get("steps") or []:
            if not isinstance(step, dict):
                continue
            if step.get("conclusion") == "failure":
                step_name = str(step.get("name") or "step")
                names.append(f"{job_name} / {step_name}")
        if not any(s.get("conclusion") == "failure" for s in (job.get("steps") or []) if isinstance(s, dict)):
            names.append(job_name)
    return names


def self_test() -> None:
    msg = format_failure_message(
        workflow_name="weekly-telemetry-draft-pr",
        week="2026-W39",
        run_url="https://github.com/org/repo/actions/runs/1",
        failed_steps=["draft / Open or reuse docs PR"],
    )
    assert "weekly-telemetry-draft-pr" in msg
    assert "2026-W39" in msg
    assert "APPROVE-DOC" in msg
    assert "@" not in msg
    assert parse_failed_steps('{"jobs":[{"name":"j","conclusion":"failure","steps":[{"name":"s","conclusion":"failure"}]}]}') == [
        "j / s"
    ]
    assert default_week_label().startswith("20")
    print("self-test ok")


def main() -> int:
    parser = argparse.ArgumentParser(description="Slack alert for failed telemetry workflows")
    parser.add_argument("--workflow-name", default="")
    parser.add_argument("--run-url", default="")
    parser.add_argument("--week", default="")
    parser.add_argument("--jobs-json", default="")
    parser.add_argument("--jobs-file", default="")
    parser.add_argument("--post", action="store_true")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        self_test()
        return 0
    if not args.workflow_name.strip() or not args.run_url.strip():
        raise SystemExit("need --workflow-name and --run-url (or --self-test)")

    week = args.week.strip() or default_week_label()
    jobs_source = args.jobs_file.strip() or args.jobs_json.strip() or "[]"
    failed = parse_failed_steps(jobs_source)
    text = format_failure_message(
        workflow_name=args.workflow_name,
        week=week,
        run_url=args.run_url,
        failed_steps=failed,
    )
    sys.stdout.write(text + "\n")
    if args.post:
        post_slack(text)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"error: {exc}", file=sys.stderr)
        raise SystemExit(1)
