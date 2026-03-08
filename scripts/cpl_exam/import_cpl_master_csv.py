#!/usr/bin/env python3
"""
4ChoiceQuiz CPL Master CSV を unified_cpl_questions へ取り込む
重複排除、正規化、レポート出力を実施
"""

import csv
import json
import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

try:
    from supabase import create_client, Client
    from dotenv import load_dotenv
except ImportError:
    print("ERROR: pip install supabase python-dotenv")
    sys.exit(1)

# 科目コード → main_subject
CODE_TO_MAIN: Dict[str, str] = {
    "AD": "航空工学",
    "CM": "航空通信",
    "NV": "空中航法",
    "RG": "航空法規",
    "WX": "航空気象",
}

# 重要度 S/A/B/C → importance_score
IMPORTANCE_MAP: Dict[str, float] = {"S": 10.0, "A": 8.0, "B": 6.0, "C": 4.0}

SUB_SUBJECT_ALIASES: Dict[str, str] = {
    "空力の基礎理論/二次元翼（翼型に関する理論）": "空力の基礎理論/二次元翼",
    "空力の基礎理論/三次元翼（翼平面形に関する理論）": "空力の基礎理論/三次元翼",
    "エア・データー表示計器/ピトー静圧系統": "エア・データー表示計器/ピトー・スタティック系統",
    "ピトー静圧系統": "エア・データー表示計器/ピトー・スタティック系統",
    "安定性": "空力の基礎理論/安定性",
    "揚力": "空力の基礎理論/揚力",
    "抗力": "空力の基礎理論/抗力",
    "翼理論": "空力の基礎理論/三次元翼",
    "プロペラ効果": "空力の基礎理論/プロペラ",
    "航法計算": "航法に関する一般知識/航法計算",
    "低気圧": "高気圧と低気圧/低気圧の種類",
    "前線": "前線/前線の種類と気象状態",
    "気団": "気団/気団の分類と性質",
    "大気組成": "大気の基礎/大気",
    "標準大気": "大気の基礎/大気",
    "水蒸気": "大気の基礎/水分",
    "露点温度": "大気の基礎/水分",
    "偏西風": "風/風系",
    "温暖前線": "前線/前線の種類と気象状態",
    "航空交通管制": "航空交通業務概論/航空交通業務",
    "航空情報業務": "航空情報業務/総合航空情報パッケージ",
}


def load_supabase_client() -> Client:
    script_dir = Path(__file__).resolve().parent
    project_root = script_dir.parent.parent  # scripts/cpl_exam -> project root
    for name in (".env.local", ".env"):
        p = project_root / name
        if p.exists():
            load_dotenv(str(p))
            break
    url = os.getenv("VITE_SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("ERROR: Set VITE_SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in .env.local")
        print("  SUPABASE_SERVICE_ROLE_KEY: Supabase Dashboard > Project Settings > API > service_role secret")
        sys.exit(1)
    return create_client(url, key)


def normalize_text(s: str) -> str:
    if not s or not isinstance(s, str):
        return ""
    s = s.replace("\r\n", "\n").replace("\r", "\n")
    s = re.sub(r"[ \t\u3000]+", " ", s)
    s = re.sub(r"\n+", " ", s)
    return s.strip()


def parse_no(no: str, subject_code: str) -> Dict[str, Any]:
    """201705_AD_001 → year, month, question_no"""
    m = re.match(r"(\d{4})(\d{2})_\w+_(\d+)", no)
    if m:
        return {"year": int(m.group(1)), "month": int(m.group(2)), "question_no": int(m.group(3))}
    return {"year": 0, "month": 0, "question_no": 0}


def load_csv_rows(path: Path) -> List[Dict[str, str]]:
    rows: List[Dict[str, str]] = []
    with open(path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if not row.get("No") or not row.get("問題文"):
                continue
            rows.append(row)
    return rows


def normalize_sub_subject(value: str, max_length: int = 100) -> str:
    normalized = normalize_text(value).replace("／", "/")
    normalized = re.sub(r"\s*/\s*", "/", normalized)
    normalized = re.sub(r"^[アイウエオカキクケコ]\s+", "", normalized)
    normalized = re.sub(r"[（(]AIP[)）]", "", normalized)
    normalized = re.sub(r"[（(][アイウエオカキクケコ][)）]\s*", "", normalized)
    normalized = re.sub(r"\s+", " ", normalized).strip() or "その他"
    normalized = SUB_SUBJECT_ALIASES.get(normalized, normalized)
    return normalized[:max_length].strip()


def row_to_record(row: Dict[str, str], subject_code: str, source_file: str) -> Optional[Dict[str, Any]]:
    no = row.get("No", "")
    if subject_code == "NV" and no == "202209_NV_005":
        row = {
            **row,
            "問題文": "変針点Bから変針点Cに向けオンコースで飛行中、CHは112度、TASは110kt、GSは130ktであった。このときの風向（磁方位）と風速に最も近いものはどれか。（※TC=100, VAR=6W, DEV=1E）",
            "選択肢1": "235° / 30kt",
            "選択肢2": "250° / 24kt",
            "選択肢3": "330° / 25kt",
            "選択肢4": "350° / 25kt",
            "正解No": "2",
            "解説": "CH=112度から真方位(TH)を求めると TH = 112 + 1(DEV) - 6(VAR) = 107度。進路(TC)100度に対して機首を右に7度向けているため、風は右から。TAS110に対しGS130と速いため追い風です。フライトコンピューターでベクトル計算すると、真風向約248度、風速約25kt。磁方位に変換(VAR 6W)すると約254度となり、250° / 24ktが最も近くなります。",
            "大分類": "航法",
            "中・小分類": "航法の実施/機位の確認",
            "重要語句": "実測風の計算",
            "重要度": "B",
            "タイプ": "計算",
        }
    question_text = normalize_text(row.get("問題文", ""))
    opt1 = (row.get("選択肢1") or "").strip()
    opt2 = (row.get("選択肢2") or "").strip()
    opt3 = (row.get("選択肢3") or "").strip()
    opt4 = (row.get("選択肢4") or "").strip()
    try:
        correct = int(row.get("正解No", "1"))
    except ValueError:
        correct = 1
    if correct < 1 or correct > 4:
        correct = 1

    main_subject = CODE_TO_MAIN.get(subject_code, "航空工学")
    sub_subject = normalize_sub_subject(row.get("中・小分類") or "")
    importance_raw = (row.get("重要度") or "B").strip().upper()
    importance_score = IMPORTANCE_MAP.get(importance_raw[:1], 6.0)
    q_type = (row.get("タイプ") or "").strip()
    keyword = (row.get("重要語句") or "").strip()

    options = [opt1, opt2, opt3, opt4]
    if not all(options):
        return None

    meta = parse_no(no, subject_code)
    source_docs = {
        "sources": [
            {
                "type": "cpl_master_csv",
                "year": meta["year"],
                "month": meta["month"],
                "question_no": meta["question_no"],
                "subject_code": subject_code,
                "file": source_file,
            }
        ],
        "weight": 2.0,
        "originality": "official",
    }

    tags: List[str] = ["CPL", main_subject]
    if keyword:
        tags.append(keyword)
    if q_type:
        tags.append(q_type)

    return {
        "main_subject": main_subject,
        "sub_subject": sub_subject,
        "question_text": question_text,
        "options": options,
        "correct_answer": correct,
        "explanation": (row.get("解説") or "").strip() or None,
        "source_documents": source_docs,
        "difficulty_level": 3,
        "importance_score": importance_score,
        "appearance_frequency": 1,
        "verification_status": "verified",
        "tags": tags,
        "exam_type": "CPL",
    }


def dedup_in_memory(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen: Set[Tuple[str, str, str, int]] = set()
    out: List[Dict[str, Any]] = []
    for r in records:
        key = (r["main_subject"], r["sub_subject"], r["question_text"], r["correct_answer"])
        if key in seen:
            continue
        seen.add(key)
        out.append(r)
    return out


def fetch_existing_keys(supabase: Optional[Client]) -> Set[Tuple[str, str, str, int]]:
    """既存DBの (main_subject, sub_subject, question_text, correct_answer) を取得"""
    keys: Set[Tuple[str, str, str, int]] = set()
    if not supabase:
        return keys
    try:
        page_size = 1000
        offset = 0
        while True:
            result = (
                supabase.table("unified_cpl_questions")
                .select("main_subject,sub_subject,question_text,correct_answer")
                .range(offset, offset + page_size - 1)
                .execute()
            )
            rows = result.data or []
            if not rows:
                break
            for row in rows:
                raw_answer = row.get("correct_answer", 1)
                if raw_answer is None:
                    continue
                try:
                    correct_answer = int(raw_answer)
                except (TypeError, ValueError):
                    continue
                keys.add(
                    (
                        str(row.get("main_subject", "")),
                        str(row.get("sub_subject", "")),
                        str(row.get("question_text", "")),
                        correct_answer,
                    )
                )
            if len(rows) < page_size:
                break
            offset += page_size
    except Exception as e:
        print(f"WARN: 既存データ取得失敗（重複チェック省略）: {e}")
    return keys


def escape_sql(s: str) -> str:
    if s is None:
        return "NULL"
    t = str(s).replace("\\", "\\\\").replace("'", "''").replace("\r", " ").replace("\n", " ")
    return "'" + t + "'"


def record_to_sql(r: Dict[str, Any], use_on_conflict: bool = False) -> str:
    opts = json.dumps(r["options"], ensure_ascii=False)
    src = json.dumps(r["source_documents"], ensure_ascii=False)
    tags_arr = "ARRAY[" + ",".join(escape_sql(t) for t in r["tags"]) + "]"
    expl = escape_sql(r["explanation"]) if r.get("explanation") else "NULL"
    base = (
        f"INSERT INTO unified_cpl_questions (main_subject, sub_subject, question_text, options, correct_answer, "
        f"explanation, source_documents, difficulty_level, importance_score, appearance_frequency, "
        f"verification_status, tags, exam_type) VALUES ("
        f"{escape_sql(r['main_subject'])}, {escape_sql(r['sub_subject'])}, {escape_sql(r['question_text'])}, "
        f"{escape_sql(opts)}::jsonb, {r['correct_answer']}, {expl}, "
        f"{escape_sql(src)}::jsonb, {r['difficulty_level']}, {r['importance_score']}, "
        f"{r['appearance_frequency']}, {escape_sql(r['verification_status'])}, {tags_arr}, {escape_sql(r['exam_type'])})"
    )
    if use_on_conflict:
        return base + " ON CONFLICT (main_subject, sub_subject, question_text, correct_answer) DO NOTHING"
    return base


def insert_batch(
    supabase: Client,
    batch: List[Dict[str, Any]],
) -> Tuple[int, int]:
    inserted, skipped = 0, 0
    if not batch:
        return 0, 0
    try:
        result = supabase.table("unified_cpl_questions").insert(batch).execute()
        if result.data:
            inserted = len(result.data)
    except Exception as e:
        if "duplicate" in str(e).lower() or "unique" in str(e).lower():
            skipped = len(batch)
        else:
            for r in batch:
                try:
                    supabase.table("unified_cpl_questions").insert(r).execute()
                    inserted += 1
                except Exception as e2:
                    skipped += 1
                    print(f"  ERR: {e2}")
    return inserted, skipped


def main() -> None:
    import argparse
    parser = argparse.ArgumentParser(description="CPL Master CSV を Supabase へ投入")
    parser.add_argument("--csv-dir", type=str, default=r"C:\Users\y_kag\Desktop\4ChoiceQuiz\problem\01_CPL\Master2017-2023")
    parser.add_argument("--dry-run", action="store_true", help="投入せず検証のみ")
    parser.add_argument("--limit", type=int, default=0, help="1ファイルあたりの最大投入数（0=無制限）")
    parser.add_argument("--files", type=str, nargs="*", default=["AD", "CM", "NV", "RG", "WX"])
    parser.add_argument("--output-validation", type=str, metavar="FILE", help="dry-run時に先頭N件をJSON出力（検証用）")
    parser.add_argument("--output-sql", type=str, metavar="FILE", help="投入用SQLをファイル出力（MCP等で実行可能）")
    parser.add_argument("--output-json", type=str, metavar="FILE", help="全レコードをJSON出力（Node等でinsert用）")
    parser.add_argument("--sql-use-on-conflict", action="store_true", help="SQLにON CONFLICT DO NOTHINGを付与（UNIQUE制約が必要）")
    args = parser.parse_args()

    csv_dir = Path(args.csv_dir)
    if not csv_dir.exists():
        print(f"ERROR: CSV dir not found: {csv_dir}")
        sys.exit(1)

    print("CPL Master CSV 取込")
    print("=" * 50)
    if args.dry_run:
        print("DRY RUN: 投入しません")
    supabase = load_supabase_client()
    existing_keys = fetch_existing_keys(supabase)
    print(f"既存 DB 件数: {len(existing_keys)}")

    total_new, total_skip, total_dup_csv, total_dup_db = 0, 0, 0, 0
    sql_lines: List[str] = []
    json_records: List[Dict[str, Any]] = []
    file_map = {"AD": "_master_AD.csv", "CM": "_master_CM.csv", "NV": "_master_NV.csv", "RG": "_master_RG.csv", "WX": "_master_WX.csv"}

    for code in args.files:
        fname = file_map.get(code, f"_master_{code}.csv")
        path = csv_dir / fname
        if not path.exists():
            print(f"SKIP: {fname} not found")
            continue

        rows = load_csv_rows(path)
        records: List[Dict[str, Any]] = []
        for row in rows:
            r = row_to_record(row, code, fname)
            if r:
                records.append(r)

        before = len(records)
        records = dedup_in_memory(records)
        total_dup_csv += before - len(records)

        to_insert: List[Dict[str, Any]] = []
        dup_db_this = 0
        for r in records:
            key = (r["main_subject"], r["sub_subject"], r["question_text"], r["correct_answer"])
            if key in existing_keys:
                dup_db_this += 1
                total_dup_db += 1
                continue
            to_insert.append(r)
            if args.limit and len(to_insert) >= args.limit:
                break

        print(f"\n{code} ({fname}): 読込{len(rows)} → 正規化{len(records)} → 新規{len(to_insert)} (DB重複{dup_db_this})")

        if not to_insert:
            continue

        if args.dry_run:
            print(f"  [DRY] 投入予定: {len(to_insert)}件")
            total_new += len(to_insert)
            if args.output_validation and to_insert:
                out_path = Path(args.output_validation)
                sample = to_insert[:5]
                with open(out_path, "w", encoding="utf-8") as f:
                    json.dump(sample, f, ensure_ascii=False, indent=2)
                print(f"  [DRY] 検証用JSON: {out_path} ({len(sample)}件)")
                args.output_validation = None  # 1ファイル分のみ出力
            if args.output_sql:
                for r in to_insert:
                    sql_lines.append(record_to_sql(r, use_on_conflict=args.sql_use_on_conflict))
            continue

        batch_size = 50
        for i in range(0, len(to_insert), batch_size):
            batch = to_insert[i : i + batch_size]
            ins, sk = insert_batch(supabase, batch)
            total_new += ins
            total_skip += sk
            for r in batch:
                existing_keys.add((r["main_subject"], r["sub_subject"], r["question_text"], r["correct_answer"]))

        import time
        time.sleep(0.5)

    print("\n" + "=" * 50)
    print(f"新規投入: {total_new}, スキップ: {total_skip}")
    print(f"CSV内重複除外: {total_dup_csv}, DB重複除外: {total_dup_db}")

    if args.output_sql and sql_lines:
        out_path = Path(args.output_sql)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write("\n".join(sql_lines))
        print(f"SQL出力: {out_path} ({len(sql_lines)}件)")
    if args.output_json and json_records:
        out_path = Path(args.output_json)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(json_records, f, ensure_ascii=False, indent=2)
        print(f"JSON出力: {out_path} ({len(json_records)}件)")


if __name__ == "__main__":
    main()
