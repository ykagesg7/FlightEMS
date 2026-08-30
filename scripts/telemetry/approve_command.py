"""Classify weekly telemetry Slack approval commands (phase 2c).

Fail-closed: unknown commands, stale weeks, non-docs PRs, and empty L1
allowlist do not merge or mutate code. Does not emit Slack @mentions.
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
COMMAND_RE = re.compile(
    r"^(APPROVE-DOC|HOLD|SKIP T-\d{2}|REJECT T-\d{2}|APPROVE T-\d{2})$"
)
BRANCH_RE = re.compile(r"^telemetry/(\d{4}-W\d{2})$")
WEEK_RE = re.compile(r"^\d{4}-W\d{2}$")
ALLOWED_FILES = frozenset(
    {
        "docs/ops/Weekly_Telemetry_Review.md",
        "docs/04_Operations_Guide.md",
    }
)
MENTION_RE = re.compile(r"(?<![A-Za-z0-9_])@|</?@[A-Z0-9]+>")
ROOT = Path(__file__).resolve().parents[2]
APPROVERS_PATH = ROOT / "scripts" / "telemetry" / "approvers.json"
ALLOWLIST_PATH = ROOT / "scripts" / "telemetry" / "l1_allowlist.json"


def parse_iso_week(label: str) -> tuple[date, date]:
    if not WEEK_RE.fullmatch(label):
        raise ValueError(f"ISO week must look like 2026-W34, got {label!r}")
    year_s, week_s = label.split("-W", 1)
    start = date.fromisocalendar(int(year_s), int(week_s), 1)
    end = date.fromisocalendar(int(year_s), int(week_s), 7)
    return start, end


def approval_window(week: str) -> tuple[datetime, datetime]:
    """Review Tuesday 00:00 UTC .. next Tuesday 00:00 UTC (09:00 JST)."""
    _start, end = parse_iso_week(week)
    review_tue = end + timedelta(days=2)
    window_start = datetime(review_tue.year, review_tue.month, review_tue.day, tzinfo=timezone.utc)
    return window_start, window_start + timedelta(days=7)


def week_from_branch(branch: str) -> str | None:
    match = BRANCH_RE.fullmatch(branch.strip())
    return match.group(1) if match else None


def normalize_command(text: str) -> str:
    return text.replace("\u00a0", " ").strip()


def parse_command(text: str) -> str | None:
    command = normalize_command(text)
    if not COMMAND_RE.fullmatch(command):
        return None
    return command


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def load_approvers(path: Path = APPROVERS_PATH) -> dict[str, list[str]]:
    data = load_json(path)
    github = [str(x) for x in data.get("github") or []]
    slack = [str(x) for x in data.get("slack") or []]
    return {"github": github, "slack": slack}


def load_l1_allowlist(path: Path = ALLOWLIST_PATH) -> set[str]:
    data = load_json(path)
    return {str(x) for x in data.get("allow") or []}


def actor_allowed(
    *,
    slack_user: str,
    github_actor: str,
    approvers: dict[str, list[str]],
) -> bool:
    slack_user = slack_user.strip()
    github_actor = github_actor.strip()
    if slack_user:
        return slack_user in approvers["slack"]
    if github_actor:
        return github_actor in approvers["github"]
    return False


def files_are_docs_only(files: list[str]) -> bool:
    if not files:
        return False
    return all(path.replace("\\", "/") in ALLOWED_FILES for path in files)


def ack_text(action: str) -> str:
    messages = {
        "merge_doc": "記録: 正本PRをマージしました。",
        "merge_failed": (
            "記録: 正本PRをマージできませんでした。"
            "GitHubでPRを確認し、Ready for review 後に APPROVE-DOC を再送してください。"
        ),
        "already_merged": "記録: 対象PRは既にマージ済みです。",
        "record_hold": "記録: 今週は実行しません。",
        "record_skip": "記録: スキップとして残します。",
        "record_reject": "記録: 提案は採用しません。",
        "l1_denied": "記録: 許可リストに無いため実行しません。",
        "stale": "記録: 火曜を跨いだため無効です。",
        "refuse": "記録: 条件を満たさないため実行しません。",
    }
    text = messages.get(action, messages["refuse"])
    if MENTION_RE.search(text) or "<@" in text:
        raise ValueError("ack refused to emit a Slack mention")
    if text.strip() == "APPROVE-DOC":
        raise ValueError("ack must not be an approval command")
    return text


def classify(
    *,
    command: str,
    now: datetime,
    slack_user: str = "",
    github_actor: str = "",
    branch: str = "",
    files: list[str] | None = None,
    pr_state: str = "",
    approvers: dict[str, list[str]] | None = None,
    l1_allow: set[str] | None = None,
) -> dict[str, Any]:
    parsed = parse_command(command)
    if parsed is None:
        return _result("refuse", "command_mismatch", command=command)

    approvers = approvers if approvers is not None else load_approvers()
    l1_allow = l1_allow if l1_allow is not None else load_l1_allowlist()
    if not actor_allowed(slack_user=slack_user, github_actor=github_actor, approvers=approvers):
        return _result("refuse", "actor_not_allowed", command=parsed)

    task_id = parsed.split()[-1] if parsed.startswith(("APPROVE T-", "SKIP T-", "REJECT T-")) else None
    week = week_from_branch(branch) if branch else None

    if parsed == "HOLD":
        return _result("record_hold", "hold", command=parsed, week=week)
    if parsed.startswith("SKIP "):
        return _result("record_skip", "skip", command=parsed, week=week, task_id=task_id)
    if parsed.startswith("REJECT "):
        return _result("record_reject", "reject", command=parsed, week=week, task_id=task_id)
    if parsed.startswith("APPROVE T-"):
        assert task_id is not None
        if task_id not in l1_allow:
            return _result("l1_denied", "not_on_allowlist", command=parsed, week=week, task_id=task_id)
        return _result("l1_denied", "allowlist_has_no_runner", command=parsed, week=week, task_id=task_id)

    # APPROVE-DOC
    if not week:
        return _result("refuse", "missing_telemetry_branch", command=parsed)
    start, end = approval_window(week)
    if not (start <= now < end):
        return _result("stale", "outside_review_window", command=parsed, week=week)
    state = pr_state.strip().upper()
    if state == "MERGED":
        return _result("already_merged", "pr_already_merged", command=parsed, week=week)
    if state and state != "OPEN":
        return _result("refuse", f"pr_state_{state.lower()}", command=parsed, week=week)
    if not files_are_docs_only(files or []):
        return _result("refuse", "not_docs_only", command=parsed, week=week)
    return _result("merge_doc", "docs_pr_ok", command=parsed, week=week, ack="")


def _result(
    action: str,
    reason: str,
    *,
    command: str,
    week: str | None = None,
    task_id: str | None = None,
    ack: str | None = None,
) -> dict[str, Any]:
    ack_message = ack_text(action) if ack is None else ack
    return {
        "ok": action
        in {
            "merge_doc",
            "already_merged",
            "record_hold",
            "record_skip",
            "record_reject",
            "l1_denied",
        },
        "action": action,
        "reason": reason,
        "ack": ack_message,
        "command": command,
        "week": week,
        "task_id": task_id,
    }


def post_slack_ack(text: str, thread_ts: str = "") -> None:
    if not thread_ts:
        print("slack ack skipped (no thread_ts)", file=sys.stderr)
        return
    webhook = os.environ.get("SLACK_WEBHOOK_URL", "").strip()
    token = os.environ.get("SLACK_BOT_TOKEN", "").strip()
    channel = os.environ.get("SLACK_CHANNEL_ID", CHANNEL_ID).strip() or CHANNEL_ID
    if MENTION_RE.search(text) or "<@" in text:
        raise RuntimeError("refusing to post a Slack mention")
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
        print("slack ack skipped (no token/webhook)", file=sys.stderr)
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


def self_test() -> None:
    approvers = {"github": ["ykagesg7"], "slack": ["U0928GWP3AA"]}
    allow: set[str] = set()
    review = datetime(2026, 8, 25, 1, 0, tzinfo=timezone.utc)
    files = ["docs/ops/Weekly_Telemetry_Review.md"]

    hold = classify(
        command="  HOLD  ",
        now=review,
        github_actor="ykagesg7",
        approvers=approvers,
        l1_allow=allow,
    )
    assert hold["action"] == "record_hold"

    denied = classify(
        command="APPROVE T-03",
        now=review,
        slack_user="U0928GWP3AA",
        branch="telemetry/2026-W34",
        files=files,
        approvers=approvers,
        l1_allow=allow,
    )
    assert denied["action"] == "l1_denied"
    assert denied["task_id"] == "T-03"

    merge = classify(
        command="APPROVE-DOC",
        now=review,
        slack_user="U0928GWP3AA",
        branch="telemetry/2026-W34",
        files=files,
        pr_state="OPEN",
        approvers=approvers,
        l1_allow=allow,
    )
    assert merge["action"] == "merge_doc"
    assert merge["week"] == "2026-W34"

    stale = classify(
        command="APPROVE-DOC",
        now=datetime(2026, 9, 1, 0, 0, tzinfo=timezone.utc),
        slack_user="U0928GWP3AA",
        branch="telemetry/2026-W34",
        files=files,
        pr_state="OPEN",
        approvers=approvers,
        l1_allow=allow,
    )
    assert stale["action"] == "stale"

    early = classify(
        command="APPROVE-DOC",
        now=datetime(2026, 8, 24, 23, 0, tzinfo=timezone.utc),
        slack_user="U0928GWP3AA",
        branch="telemetry/2026-W34",
        files=files,
        pr_state="OPEN",
        approvers=approvers,
        l1_allow=allow,
    )
    assert early["action"] == "stale"

    dirty = classify(
        command="APPROVE-DOC",
        now=review,
        slack_user="U0928GWP3AA",
        branch="telemetry/2026-W34",
        files=files + ["src/App.tsx"],
        pr_state="OPEN",
        approvers=approvers,
        l1_allow=allow,
    )
    assert dirty["action"] == "refuse"
    assert dirty["reason"] == "not_docs_only"

    bot = classify(
        command="APPROVE-DOC",
        now=review,
        slack_user="U092F515HNG",
        branch="telemetry/2026-W34",
        files=files,
        pr_state="OPEN",
        approvers=approvers,
        l1_allow=allow,
    )
    assert bot["action"] == "refuse"

    assert parse_command("approve-doc") is None
    assert parse_command("APPROVE-DOC please") is None
    assert parse_command("APPROVE-DOC") == "APPROVE-DOC"
    ack = ack_text("merge_doc")
    failed = ack_text("merge_failed")
    assert "APPROVE-DOC" not in ack
    assert "APPROVE-DOC" not in failed
    assert "@" not in ack
    assert merge["ack"] == ""
    start, end = approval_window("2026-W34")
    assert start == datetime(2026, 8, 25, tzinfo=timezone.utc)
    assert end == datetime(2026, 9, 1, tzinfo=timezone.utc)
    loaded = load_approvers()
    assert "ykagesg7" in loaded["github"]
    assert "U0928GWP3AA" in loaded["slack"]
    assert load_l1_allowlist() == set()
    print("self-test ok")


def main() -> int:
    parser = argparse.ArgumentParser(description="Classify telemetry approval commands")
    parser.add_argument("--command", default="")
    parser.add_argument("--slack-user", default="")
    parser.add_argument("--github-actor", default="")
    parser.add_argument("--branch", default="")
    parser.add_argument("--files-json", default="[]")
    parser.add_argument("--pr-state", default="")
    parser.add_argument("--now", default="")
    parser.add_argument("--post-ack", action="store_true")
    parser.add_argument("--ack-text", default="")
    parser.add_argument("--print-ack", choices=["merge_doc", "merge_failed"], default="")
    parser.add_argument("--thread-ts", default="")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        self_test()
        return 0
    if args.print_ack:
        sys.stdout.write(ack_text(args.print_ack) + "\n")
        return 0
    if args.ack_text:
        post_slack_ack(args.ack_text, thread_ts=args.thread_ts)
        return 0
    if not args.command:
        raise SystemExit("need --command, --ack-text, or --self-test")

    if args.now:
        now = datetime.fromisoformat(args.now.replace("Z", "+00:00"))
        if now.tzinfo is None:
            now = now.replace(tzinfo=timezone.utc)
    else:
        now = datetime.now(timezone.utc)

    files = json.loads(args.files_json)
    if not isinstance(files, list) or not all(isinstance(x, str) for x in files):
        raise SystemExit("--files-json must be a JSON array of strings")

    result = classify(
        command=args.command,
        now=now,
        slack_user=args.slack_user,
        github_actor=args.github_actor,
        branch=args.branch,
        files=files,
        pr_state=args.pr_state,
    )
    sys.stdout.write(json.dumps(result, ensure_ascii=False) + "\n")
    if args.post_ack:
        post_slack_ack(str(result["ack"]), thread_ts=args.thread_ts)
    if result["reason"] == "command_mismatch":
        return 1
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"error: {exc}", file=sys.stderr)
        raise SystemExit(1)
