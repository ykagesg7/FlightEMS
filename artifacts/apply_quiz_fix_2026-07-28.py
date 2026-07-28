"""Apply scripts/sql/fix_question_issue_reports_2026-07-28.sql via Supabase REST (service role)."""
from __future__ import annotations

import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
env_text = (ROOT / ".env.local").read_text(encoding="utf-8")


def env_get(key: str) -> str:
    m = re.search(rf"^{re.escape(key)}=(.+)$", env_text, re.M)
    if not m:
        raise SystemExit(f"missing {key} in .env.local")
    return m.group(1).strip().strip('"').strip("'")


URL = env_get("VITE_SUPABASE_URL").rstrip("/")
KEY = env_get("SUPABASE_SERVICE_ROLE_KEY")


def patch(table: str, row_id: str, payload: dict) -> None:
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{URL}/rest/v1/{table}?id=eq.{row_id}",
        data=body,
        headers={
            "apikey": KEY,
            "Authorization": f"Bearer {KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
        method="PATCH",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            if resp.status not in (200, 204):
                raise RuntimeError(f"HTTP {resp.status}")
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")
        raise RuntimeError(f"PATCH {table} {row_id}: {e.code} {detail}") from e


def main() -> None:
    updates: list[tuple[str, str, dict]] = [
        (
            "unified_cpl_questions",
            "21d4d155-f7f2-49b9-8639-ceb1bc7779f6",
            {
                "question_text": "フェール・セーフ構造の基本方式として正しい組み合わせはどれか。（各方式の説明の組合せ）",
                "options": [
                    "ある部材が破壊したとき、その部材の代わりに予備の部材が荷重を受け持つ構造をバックアップ構造（冗長構造）という。",
                    "一部の部材が破損したとき、損傷部材が担っていた荷重を残りの健全な部材が負担する構造をロード・ドロッピング構造という。",
                    "破損するまでの疲労寿命を設計上の限界とし、その前に交換・点検する安全度の考え方をセーフ・ライフ構造という。",
                    "強い表板と弱い芯材を層状に接合した板構造をサンドイッチ構造という。",
                ],
                "correct_answer": 1,
                "explanation": "正答は①です。バックアップ（冗長）構造は予備部材で荷重を引き継ぐ方式です。②はロード・ドロッピング（荷重の再分配）、③はセーフ・ライフ（寿命管理）、④はサンドイッチ板の説明であり、いずれも①の定義とは異なります。",
                "verification_status": "verified",
            },
        ),
        (
            "unified_cpl_questions",
            "29922041-ccf3-4547-963b-b50488761117",
            {
                "question_text": (
                    "空電に関する説明（a）～（c）のうち、正しいものはいくつあるか。\n\n"
                    "(a) スタティック・ディスチャージャは避雷針の一種で、航空機への落雷を防止する。\n"
                    "(b) 機体に帯電した静電気がコロナ放電する際に無線機器に雑音を与える。\n"
                    "(c) 航空機の可動部分は、1カ所に帯電しないように全部接続されており、全体を機体に完全に接続し部分的な帯電を防止している。"
                ),
                "verification_status": "verified",
            },
        ),
        (
            "unified_cpl_questions",
            "add46ee7-5e67-40f4-8d50-69a271d46931",
            {
                "question_text": (
                    "空電に関する説明（a）～（c）のうち、正しいものはいくつあるか。\n\n"
                    "(a) スタティック・ディスチャージャは避雷針の一種で、航空機への落雷を防止する。\n"
                    "(b) 機体に帯電した静電気がコロナ放電する際に無線機器に雑音を与える。\n"
                    "(c) 航空機の可動部分は、1カ所に帯電しないように全部接続されており部分的な帯電を防止している。"
                ),
                "options": ["1つ", "2つ", "3つ", "なし"],
                "correct_answer": 2,
                "verification_status": "verified",
            },
        ),
        (
            "unified_cpl_questions",
            "71bf3095-f42b-40e1-a1ad-7d12bf750e9c",
            {
                "explanation": (
                    "飛行機普通Nの離陸距離は、離陸滑走開始地点から、空中に浮揚した後、障害物高さ50フィート（15m）に達するまでの水平距離です"
                    "（耐空性審査要領・飛行規程の性能表と同じ基準）。参考：着陸距離も同様に着陸滑走路面上の所定点から50ft（15m）高さまでの水平距離で定義されます。"
                    "輸送Tなど大型機では離陸・着陸性能の詳細要件がさらに厳しく定められますが、本問の正答は③です。"
                ),
                "verification_status": "verified",
            },
        ),
        (
            "unified_cpl_questions",
            "755c72e2-b4cc-49cf-875c-410a181e34ce",
            {
                "explanation": (
                    "正しいのは(a)(b)(d)の3つです。(a)薄い翼型は失速・抗力急増が起きやすい、(b)前縁半径が大きいと流れが付着しやすく失速迎え角が大きくなりやすい、"
                    "(d)キャンバーが大きいほど同迎え角での揚力係数は一般に大きくなります。(c)対称翼は迎え角ゼロ付近では揚力係数はほぼゼロであり、「ある程度の揚力係数をもつ」は誤りです。"
                ),
                "verification_status": "verified",
            },
        ),
        (
            "unified_cpl_questions",
            "cb71baba-879b-450e-83fb-fd0325f354cb",
            {
                "question_text": "効果的なリーダーシップの重要な要素は何ですか？ ",
                "correct_answer": 1,
                "verification_status": "verified",
            },
        ),
        (
            "unified_cpl_questions",
            "e8371176-b3cc-4e13-8700-6e481cb1e09a",
            {
                "explanation": (
                    "正しいのは(a)(c)(d)の3つです。(a)航空運送事業機の副操縦士としての操縦、(c)報酬を受けない無償運航、(d)航空運送・航空機使用事業以外の有償運航は、"
                    "別表の事業用操縦士の業務範囲に含まれます。(b)は航空運送事業機の機長としての操縦であり、事業用ではなく熟練操縦士（定期運送用）の範囲です。"
                ),
                "verification_status": "verified",
            },
        ),
    ]

    report_ids = [
        "649f743f-96d1-4335-bf6d-a190362a29aa",
        "5ec78515-07fd-4af1-b6e2-046c0559e970",
        "b381cbcc-ceff-49b1-b5fe-5736a659cbe5",
        "2b7562f9-18cc-4459-8eb0-13467fe67550",
        "2052c951-b33e-44b9-9ee0-8a260192d4e5",
        "346d3152-7765-451c-9cbd-0a0ff05fc775",
        "0a137004-8f08-4ede-af6f-ae11c2bc0a6e",
    ]
    note = "2026-07-28: Fact-checked; see scripts/sql/fix_question_issue_reports_2026-07-28.sql."

    for table, row_id, payload in updates:
        patch(table, row_id, payload)
        print("ok", table, row_id)

    for rid in report_ids:
        patch(
            "question_issue_reports",
            rid,
            {"status": "resolved", "admin_note": note},
        )
        print("ok report", rid)


if __name__ == "__main__":
    try:
        main()
    except RuntimeError as exc:
        print(exc, file=sys.stderr)
        sys.exit(1)
