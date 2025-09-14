#!/usr/bin/env python3
"""
SupabaseMCPを使用してCPL試験データを一括投入
"""

import re
import time
from pathlib import Path

def read_sql_file(file_path: Path) -> str:
    """SQLファイルを読み込み"""
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()

def extract_values_from_sql(sql_content: str) -> list:
    """INSERT文からVALUES部分を抽出"""
    insert_match = re.search(r'INSERT INTO exam_questions_metadata.*?VALUES\s*(.*?);', sql_content, re.DOTALL)
    if insert_match:
        values_part = insert_match.group(1)
        # 各レコードを分離
        records = re.findall(r'\(.*?\)(?=,\s*\(|\s*;)', values_part, re.DOTALL)
        return records
    return []

def create_batch_insert_sql(records: list, start_idx: int, batch_size: int) -> str:
    """バッチ用のINSERT SQL文を作成"""
    end_idx = min(start_idx + batch_size, len(records))
    batch_records = records[start_idx:end_idx]
    
    if not batch_records:
        return ""
    
    sql = '''INSERT INTO exam_questions_metadata (
        exam_year, exam_month, question_number, subject_category, sub_category,
        difficulty_level, appearance_frequency, importance_score, source_document,
        markdown_content, question_text, options, correct_answer, explanation, tags
    ) VALUES ''' + ','.join(batch_records) + ';'
    
    return sql

def main():
    """メイン実行関数"""
    print("🚀 CPL試験データ一括投入開始")
    print("=" * 60)
    
    # SQLファイルを読み込み
    sql_file = Path("./scripts/real_exam_data_insert.sql")
    
    if not sql_file.exists():
        print(f"❌ SQLファイルが見つかりません: {sql_file}")
        return
    
    sql_content = read_sql_file(sql_file)
    records = extract_values_from_sql(sql_content)
    
    print(f"📊 総レコード数: {len(records)}")
    
    # 投入済みの数を確認
    already_imported = 3  # 最初の3問は既に投入済み
    remaining_records = records[already_imported:]
    
    print(f"📊 投入済み: {already_imported}問")
    print(f"📊 残り: {len(remaining_records)}問")
    
    # バッチサイズ
    batch_size = 20
    total_batches = (len(remaining_records) + batch_size - 1) // batch_size
    
    print(f"📊 バッチ数: {total_batches} (1バッチ={batch_size}件)")
    print("")
    
    # 各バッチのSQL文を生成
    for batch_num in range(total_batches):
        start_idx = batch_num * batch_size
        batch_sql = create_batch_insert_sql(remaining_records, start_idx, batch_size)
        
        if batch_sql:
            batch_file = Path(f"./scripts/bulk_batch_{batch_num + 1:02d}.sql")
            
            with open(batch_file, 'w', encoding='utf-8') as f:
                f.write(f"-- バッチ {batch_num + 1}/{total_batches}\n")
                f.write(f"-- レコード範囲: {already_imported + start_idx + 1}-{already_imported + min(start_idx + batch_size, len(remaining_records))}\n\n")
                f.write(batch_sql)
            
            print(f"✅ バッチ {batch_num + 1:2d}: {batch_file.name} ({len(batch_sql):,} 文字)")
    
    print("")
    print("🎯 次のステップ:")
    print("   1. 各バッチファイルをSupabaseMCPで順次実行")
    print("   2. 全データ投入後に分析処理を実行")

if __name__ == "__main__":
    main() 