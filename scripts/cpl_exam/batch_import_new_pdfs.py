#!/usr/bin/env python3
"""
新規CPL試験PDFデータの段階的データベース投入
2025年6月21日に追加された12ファイルの処理
"""

import os
import sys
import json
import re
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any
import time

try:
    from supabase import create_client, Client
    from dotenv import load_dotenv
except ImportError:
    print("ERROR: Required packages not installed. Please install with:")
    print("pip install supabase python-dotenv")
    sys.exit(1)

def load_supabase_client() -> Client:
    """Supabaseクライアントを初期化"""
    
    load_dotenv('.env.local')
    
    url = os.getenv('VITE_SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not url or not key:
        print("ERROR: Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local")
        sys.exit(1)
    
    return create_client(url, key)

def extract_questions_from_markdown(md_file: Path) -> List[Dict[str, Any]]:
    """Markdownファイルから問題を抽出（改良版）"""
    
    if not md_file.exists():
        print(f"❌ File not found: {md_file}")
        return []
    
    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # ヘッダー情報の抽出
    year_match = re.search(r'exam_year:\s*(\d{4})', content)
    month_match = re.search(r'exam_month:\s*(\d+)', content)
    
    year = int(year_match.group(1)) if year_match else 2024
    month = int(month_match.group(1)) if month_match else 1
    
    # 問題セクションを抽出
    problem_sections = re.findall(r'### 問題(\d+)\s*```\s*(.*?)\s*```', content, re.DOTALL)
    
    questions = []
    
    for question_num, question_content in problem_sections:
        try:
            # 問題番号
            num = int(question_num)
            
            # 問題文を抽出（最初の100文字程度を要約として使用）
            lines = question_content.strip().split('\n')
            clean_lines = [line.strip() for line in lines if line.strip() and not line.startswith('**')]
            
            if not clean_lines:
                continue
            
            # 問題文の構築
            question_text = ' '.join(clean_lines[:3])  # 最初の3行を使用
            question_text = re.sub(r'\s+', ' ', question_text)  # 空白を正規化
            question_text = question_text[:500]  # 500文字に制限
            
            if len(question_text) < 20:  # 短すぎる問題はスキップ
                continue
            
            questions.append({
                'number': num,
                'content': question_content,
                'question_text': question_text,
                'year': year,
                'month': month
            })
            
        except (ValueError, IndexError) as e:
            print(f"   ⚠️ 問題{question_num}の解析エラー: {e}")
            continue
    
    # 問題番号でソート
    questions.sort(key=lambda x: x['number'])
    
    return questions

def classify_subject(question_text: str) -> str:
    """問題文から科目分類（簡略版）"""
    
    text_lower = question_text.lower()
    
    # 航空工学キーワード
    if any(keyword in text_lower for keyword in [
        'エンジン', '滑油', 'ピトー', '計器', '速度計', 'プロペラ', '翼', '機体', '燃料'
    ]):
        return '航空工学'
    
    # 航空気象キーワード
    if any(keyword in text_lower for keyword in [
        '気温', '気圧', '風', '雲', '気象', '大気', '前線'
    ]):
        return '航空気象'
    
    # 空中航法キーワード
    if any(keyword in text_lower for keyword in [
        '航法', 'gps', 'vor', '磁方位', 'crm', '人的要因'
    ]):
        return '空中航法'
    
    # 航空通信キーワード
    if any(keyword in text_lower for keyword in [
        '管制', '交信', '無線', 'atc', '周波数', '通信機'
    ]):
        return '航空通信'
    
    # 航空法規キーワード
    if any(keyword in text_lower for keyword in [
        '航空法', '規則', '条約', '免許', '資格', '禁止区域'
    ]):
        return '航空法規'
    
    return '航空工学'  # デフォルト

def classify_sub_category(question_text: str, main_subject: str) -> str:
    """サブカテゴリ分類（簡略版）"""
    
    text_lower = question_text.lower()
    
    if main_subject == '航空工学':
        if any(keyword in text_lower for keyword in ['エンジン', '滑油', 'プロペラ']):
            return '動力装置'
        elif any(keyword in text_lower for keyword in ['計器', 'ピトー', '速度計']):
            return '航空計器'
        else:
            return '航空機装備'
    
    elif main_subject == '航空気象':
        return '気象情報'
    
    elif main_subject == '空中航法':
        if 'crm' in text_lower or '人的要因' in text_lower:
            return '人間の能力及び限界に関する一般知識'
        else:
            return '航法'
    
    elif main_subject == '航空通信':
        if '管制' in text_lower:
            return '管制業務'
        else:
            return '航空交通業務'
    
    elif main_subject == '航空法規':
        if '条約' in text_lower or 'icao' in text_lower:
            return '国際条約'
        else:
            return '航空法及び航空法施行規則'
    
    return main_subject

def insert_questions_batch(supabase: Client, questions: List[Dict[str, Any]], source_file: str) -> int:
    """問題をバッチでデータベースに投入"""
    
    inserted_count = 0
    batch_size = 10  # 小さなバッチサイズ
    
    for i in range(0, len(questions), batch_size):
        batch = questions[i:i + batch_size]
        
        batch_data = []
        
        for question in batch:
            # 科目分類
            main_subject = classify_subject(question['question_text'])
            sub_subject = classify_sub_category(question['question_text'], main_subject)
            
            # ソースメタデータ
            source_metadata = {
                "sources": [
                    {
                        "type": "official_exam",
                        "year": question['year'],
                        "month": question['month'],
                        "question_num": question['number'],
                        "file": source_file,
                        "extraction_confidence": 0.9
                    }
                ],
                "weight": 3.0,
                "originality": "official"
            }
            
            # タグ生成
            tags = [main_subject, f"{question['year']}年", 'CPL']
            
            question_data = {
                'main_subject': main_subject,
                'sub_subject': sub_subject,
                'detailed_topic': None,
                'question_text': question['question_text'],
                'options': [],
                'correct_answer': None,
                'explanation': None,
                'source_documents': source_metadata,
                'difficulty_level': 3,
                'importance_score': 6.0,
                'appearance_frequency': 1,
                'verification_status': 'pending',
                'quality_score': 0.85,
                'tags': tags,
                'exam_type': 'CPL'
            }
            
            batch_data.append(question_data)
        
        try:
            # バッチ投入
            result = supabase.table('unified_cpl_questions').insert(batch_data).execute()
            
            if result.data:
                inserted_count += len(result.data)
                print(f"   ✅ バッチ{i//batch_size + 1}: {len(result.data)}問投入成功")
            else:
                print(f"   ❌ バッチ{i//batch_size + 1}: 投入失敗")
            
            # レート制限対策
            time.sleep(0.5)
            
        except Exception as e:
            print(f"   ❌ バッチ{i//batch_size + 1}投入エラー: {e}")
            continue
    
    return inserted_count

def process_new_pdf_files():
    """新規PDFファイルの処理メイン関数"""
    
    print("🚀 新規CPL試験PDFデータのデータベース投入開始")
    print("=" * 60)
    
    # Supabaseクライアント初期化
    try:
        supabase = load_supabase_client()
        print("✅ Supabase接続成功")
    except Exception as e:
        print(f"❌ Supabase接続失敗: {e}")
        return
    
    # 新規ファイルリスト
    new_files = [
        'real_pdf_202311_CPLTest.md',
        'real_pdf_202401_CPLTest.md',
        'real_pdf_202403_CPLTest.md',
        'real_pdf_202405_CPLTest.md',
        'real_pdf_202407_CPLTest.md',
        'real_pdf_202409_CPLTest.md',
        'real_pdf_202411_CPLTest.md',
        'real_pdf_202501_CPLTest.md',
        'real_pdf_202503_CPLTest.md',
        'real_pdf_202505_CPLTest.md',
        'real_pdf_202507_CPLTest.md',
        'real_pdf_202509_CPLTest.md'
    ]
    
    converted_md_dir = Path("./cpl_exam_data/converted_md")
    
    total_inserted = 0
    processed_files = 0
    
    for md_file in new_files:
        md_path = converted_md_dir / md_file
        
        if not md_path.exists():
            print(f"⚠️ ファイルが見つかりません: {md_file}")
            continue
        
        print(f"\n📖 処理中: {md_file}")
        
        # 問題を抽出
        questions = extract_questions_from_markdown(md_path)
        
        if not questions:
            print(f"   ❌ 問題が抽出できませんでした")
            continue
        
        print(f"   📊 {len(questions)}問を抽出")
        
        # データベースに投入
        source_file = md_file.replace('real_pdf_', '').replace('.md', '.pdf')
        inserted_count = insert_questions_batch(supabase, questions, source_file)
        
        print(f"   💾 {inserted_count}問をデータベースに投入")
        
        total_inserted += inserted_count
        processed_files += 1
        
        # ファイル間の待機
        time.sleep(2)
    
    print(f"\n🎉 処理完了!")
    print(f"   処理ファイル数: {processed_files}")
    print(f"   総投入問題数: {total_inserted}")
    
    # 最終確認
    try:
        result = supabase.table('unified_cpl_questions').select('id', count='exact').execute()
        total_count = result.count
        print(f"   データベース総問題数: {total_count}")
    except Exception as e:
        print(f"   総数確認エラー: {e}")

if __name__ == "__main__":
    process_new_pdf_files() 