#!/usr/bin/env python3
"""
新規CPL試験PDFデータをunified_cpl_questionsテーブル用SQLに変換
2025年6月21日に追加された12ファイルの処理
"""

import os
import sys
import json
import re
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any

def extract_questions_from_text(text: str) -> List[Dict[str, Any]]:
    """テキストから問題を抽出（既存関数の簡略版）"""
    
    questions = []
    
    # 問題番号パターンの検索
    patterns = [
        r'問題?\s*(\d+)',  # 問1, 問題1
        r'(\d+)\s*[.．]\s*',  # 1. 
    ]
    
    all_matches = []
    for pattern in patterns:
        matches = list(re.finditer(pattern, text))
        all_matches.extend([(m.start(), m.group(1), m.group(0)) for m in matches])
    
    # 位置でソート
    all_matches.sort(key=lambda x: x[0])
    
    # 重複除去（近い位置の問題番号は同一とみなす）
    unique_matches = []
    for i, (pos, num, match_text) in enumerate(all_matches):
        if i == 0 or pos - all_matches[i-1][0] > 50:  # 50文字以上離れている
            unique_matches.append((pos, num, match_text))
    
    print(f"🔍 Pattern matches found: {len(unique_matches)}")
    
    # 問題コンテンツを抽出
    for i, (pos, question_num, match_text) in enumerate(unique_matches):
        try:
            # 次の問題の開始位置を取得
            next_pos = unique_matches[i + 1][0] if i + 1 < len(unique_matches) else len(text)
            
            # 問題コンテンツを抽出
            content_start = pos
            content_end = min(next_pos, pos + 2000)  # 最大2000文字
            content = text[content_start:content_end].strip()
            
            # 短すぎる内容はスキップ
            if len(content) < 20:
                continue
            
            questions.append({
                'number': int(question_num),
                'content': content,
                'position': pos
            })
            
        except (ValueError, IndexError):
            continue
    
    # 問題番号でソート
    questions.sort(key=lambda x: x['number'])
    
    return questions

def classify_subject(question_text: str) -> str:
    """問題文から科目分類（unified_cpl_questions用）"""
    
    text_lower = question_text.lower()
    
    # 航空工学キーワード
    if any(keyword in text_lower for keyword in [
        'ピトー', '静圧', '計器', '速度計', 'cas', 'ias', 'tas',
        'プロペラ', 'エンジン', '動力', '燃料', '油圧', '電気',
        '翼', '機体', '構造', '材料', '強度', '応力',
        '航空力学', '揚力', '抗力', '失速', 'マッハ',
        '重量', '重心', '荷重', 'バランス'
    ]):
        return '航空工学'
    
    # 航空気象キーワード
    if any(keyword in text_lower for keyword in [
        '気温', '気圧', '湿度', '露点', '雲', '霧', '雨', '雪',
        '風', '乱気流', '雷', '台風', '前線', '高気圧', '低気圧',
        '逆転', '対流', '安定', '不安定', '大気', '気象',
        '視程', 'icao', '標準大気'
    ]):
        return '航空気象'
    
    # 空中航法キーワード
    if any(keyword in text_lower for keyword in [
        '航法', 'gps', 'vor', 'dme', 'ils', 'rnav',
        '磁方位', '真方位', '偏差', '自差', 'コンパス',
        '地図', 'チャート', '座標', '経度', '緯度',
        'crm', '人的要因', '疲労', 'ヒューマンエラー'
    ]):
        return '空中航法'
    
    # 航空通信キーワード
    if any(keyword in text_lower for keyword in [
        '管制', 'atc', '交信', '無線', '周波数', 'vhf', 'hf',
        'トランスポンダ', 'squawk', 'レーダー',
        '飛行計画', 'fir', 'コールサイン', '管制圏',
        '進入', '出発', '着陸', '離陸'
    ]):
        return '航空通信'
    
    # 航空法規キーワード
    if any(keyword in text_lower for keyword in [
        '航空法', '規則', '条約', 'icao', '国際',
        '免許', '資格', '医学適性', '身体検査',
        '飛行規則', 'vfr', 'ifr', '最低気象条件',
        '禁止区域', '制限区域', '危険区域',
        '航空機登録', '耐空証明'
    ]):
        return '航空法規'
    
    # デフォルト（最も一般的な科目）
    return '航空工学'

def classify_sub_category(question_text: str, main_subject: str) -> str:
    """サブカテゴリ分類"""
    
    text_lower = question_text.lower()
    
    if main_subject == '航空工学':
        if any(keyword in text_lower for keyword in ['ピトー', '計器', '速度計', '高度計']):
            return '航空計器'
        elif any(keyword in text_lower for keyword in ['プロペラ', 'エンジン', '動力']):
            return '動力装置'
        elif any(keyword in text_lower for keyword in ['翼', '機体', '構造']):
            return '航空機構造'
        elif any(keyword in text_lower for keyword in ['揚力', '抗力', '航空力学']):
            return '航空力学'
        else:
            return '航空機装備'
    
    elif main_subject == '航空気象':
        if any(keyword in text_lower for keyword in ['大気', '気温', '気圧']):
            return '大気の物理'
        elif any(keyword in text_lower for keyword in ['風', '前線', '高気圧']):
            return '大気の運動'
        elif any(keyword in text_lower for keyword in ['雲', '乱気流', '雷']):
            return '高層気象と気象障害'
        else:
            return '気象情報'
    
    elif main_subject == '空中航法':
        if any(keyword in text_lower for keyword in ['vor', 'dme', 'gps', '航法']):
            return '航法'
        elif any(keyword in text_lower for keyword in ['crm', '人的要因']):
            return '人間の能力及び限界に関する一般知識'
        else:
            return '運航方式に関する一般知識'
    
    elif main_subject == '航空通信':
        if any(keyword in text_lower for keyword in ['管制', 'atc']):
            return '管制業務'
        else:
            return '航空交通業務'
    
    elif main_subject == '航空法規':
        if any(keyword in text_lower for keyword in ['条約', 'icao', '国際']):
            return '国際条約'
        else:
            return '航空法及び航空法施行規則'
    
    return main_subject

def estimate_difficulty(question_text: str) -> int:
    """難易度推定（1-5）"""
    
    text_length = len(question_text)
    text_lower = question_text.lower()
    
    # 基本難易度
    difficulty = 3
    
    # 長い問題文は難易度が高い
    if text_length > 400:
        difficulty += 1
    elif text_length < 150:
        difficulty -= 1
    
    # 複雑なキーワードがある場合
    complex_keywords = ['計算', '図表', '複数', '組み合わせ', '～（ｄ）', 'いくつ']
    if any(keyword in text_lower for keyword in complex_keywords):
        difficulty += 1
    
    # 基本的なキーワードがある場合
    basic_keywords = ['正しい', '誤り', 'どれか', '説明']
    if all(keyword in text_lower for keyword in basic_keywords):
        difficulty -= 1
    
    return max(1, min(5, difficulty))

def calculate_importance_score(subject: str, difficulty: int, text_length: int) -> float:
    """重要度スコア計算（1.0-10.0）"""
    
    # 基本スコア
    base_score = 5.0
    
    # 科目による重み
    subject_weights = {
        '航空工学': 1.2,
        '航空気象': 1.1,
        '空中航法': 1.0,
        '航空通信': 0.9,
        '航空法規': 0.8
    }
    
    base_score *= subject_weights.get(subject, 1.0)
    
    # 難易度による調整
    base_score += (difficulty - 3) * 0.5
    
    # 文章長による調整
    if text_length > 300:
        base_score += 0.3
    elif text_length < 100:
        base_score -= 0.3
    
    return round(max(1.0, min(10.0, base_score)), 1)

def generate_tags(question_text: str, subject: str) -> List[str]:
    """タグ生成"""
    
    tags = ['CPL', '2024年', subject]
    
    text_lower = question_text.lower()
    
    # 特定キーワードに基づくタグ
    keyword_tags = {
        '計器': ['計器飛行'],
        '気象': ['天候', '気象現象'],
        '管制': ['ATC', '交信'],
        '航法': ['ナビゲーション'],
        '法規': ['規則', '法令']
    }
    
    for keyword, tag_list in keyword_tags.items():
        if keyword in text_lower:
            tags.extend(tag_list)
    
    return list(set(tags))  # 重複除去

def create_unified_insert_sql(questions: List[Dict[str, Any]], source_file: str, year: int, month: int) -> str:
    """unified_cpl_questions用のINSERT SQLを生成"""
    
    if not questions:
        return ""
    
    sql_lines = []
    sql_lines.append(f"-- CPL試験データ投入 ({source_file})")
    sql_lines.append(f"-- 投入件数: {len(questions)} 問")
    sql_lines.append(f"-- 生成日時: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    sql_lines.append("")
    
    sql_lines.append("INSERT INTO unified_cpl_questions (")
    sql_lines.append("    main_subject, sub_subject, detailed_topic,")
    sql_lines.append("    question_text, options, correct_answer, explanation,")
    sql_lines.append("    source_documents, difficulty_level, importance_score,")
    sql_lines.append("    appearance_frequency, verification_status, quality_score,")
    sql_lines.append("    tags, exam_type, created_at, updated_at")
    sql_lines.append(") VALUES")
    
    value_lines = []
    
    for i, question in enumerate(questions):
        question_text = question.get('content', '')
        
        # 科目分類
        main_subject = classify_subject(question_text)
        sub_subject = classify_sub_category(question_text, main_subject)
        
        # 難易度・重要度
        difficulty = estimate_difficulty(question_text)
        importance = calculate_importance_score(main_subject, difficulty, len(question_text))
        
        # タグ生成
        tags = generate_tags(question_text, main_subject)
        
        # ソースメタデータ
        source_metadata = {
            "sources": [
                {
                    "type": "official_exam",
                    "year": year,
                    "month": month,
                    "question_num": question.get('number', i + 1),
                    "file": source_file,
                    "extraction_confidence": 0.9
                }
            ],
            "weight": 3.0,
            "originality": "official"
        }
        
        # SQLエスケープ処理
        def escape_sql(text):
            if text is None:
                return 'NULL'
            return "'" + str(text).replace("'", "''") + "'"
        
        value_line = f"""    (
        {escape_sql(main_subject)},
        {escape_sql(sub_subject)},
        NULL,
        {escape_sql(question_text[:1000])},  -- 最大1000文字に制限
        '[]'::jsonb,  -- 選択肢情報なし
        NULL,  -- 正解なし
        NULL,  -- 解説なし
        '{json.dumps(source_metadata, ensure_ascii=False)}'::jsonb,
        {difficulty},
        {importance},
        1,
        'pending',
        0.90,
        ARRAY{tags},
        'CPL',
        now(),
        now()
    )"""
        
        value_lines.append(value_line)
    
    sql_lines.append(',\n'.join(value_lines))
    sql_lines.append(";")
    
    return '\n'.join(sql_lines)

def process_new_pdfs():
    """新規PDFファイルの処理"""
    
    print("🚀 新規CPL試験PDFデータ処理開始")
    print("=" * 60)
    
    # 新規変換されたMarkdownファイル
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
    scripts_dir = Path("./scripts")
    
    total_questions = 0
    processed_files = 0
    
    for md_file in new_files:
        md_path = converted_md_dir / md_file
        
        if not md_path.exists():
            print(f"⚠️ ファイルが見つかりません: {md_file}")
            continue
        
        print(f"\n📖 処理中: {md_file}")
        
        # 年月を抽出
        import re
        match = re.search(r'(\d{4})(\d{2})_CPLTest', md_file)
        if match:
            year = int(match.group(1))
            month = int(match.group(2))
        else:
            year, month = 2024, 1
        
        # Markdownファイルを読み込み
        with open(md_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 問題を抽出
        questions = extract_questions_from_text(content)
        
        if not questions:
            print(f"   ❌ 問題が抽出できませんでした")
            continue
        
        print(f"   ✅ {len(questions)}問を抽出")
        
        # SQLを生成
        source_file = md_file.replace('real_pdf_', '').replace('.md', '.pdf')
        sql_content = create_unified_insert_sql(questions, source_file, year, month)
        
        # SQLファイルを保存
        sql_file = scripts_dir / f"unified_insert_{source_file.replace('.pdf', '')}.sql"
        
        with open(sql_file, 'w', encoding='utf-8') as f:
            f.write(sql_content)
        
        print(f"   💾 SQL保存: {sql_file.name}")
        
        total_questions += len(questions)
        processed_files += 1
    
    print(f"\n🎉 処理完了!")
    print(f"   処理ファイル数: {processed_files}")
    print(f"   総問題数: {total_questions}")
    print(f"   平均問題数: {total_questions/max(processed_files, 1):.1f}問/ファイル")

if __name__ == "__main__":
    process_new_pdfs() 