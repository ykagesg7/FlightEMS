#!/usr/bin/env python3
"""
実際のCPL試験PDFデータをSupabaseに投入
202408_CPLTest.pdfから抽出された100問をデータベースに保存
"""

import re
import json
from datetime import datetime, date
from pathlib import Path
from typing import List, Dict, Any, Optional

def parse_real_markdown_questions(markdown_file: Path) -> List[Dict[str, Any]]:
    """実際のMarkdownファイルから問題を抽出"""
    
    if not markdown_file.exists():
        print(f"❌ Markdown file not found: {markdown_file}")
        return []
    
    print(f"📖 Reading: {markdown_file}")
    
    with open(markdown_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    questions = []
    
    # 問題セクションを抽出
    problem_sections = re.findall(r'### 問題(\d+)\s*```\s*(.*?)\s*```', content, re.DOTALL)
    
    for question_num, question_content in problem_sections:
        
        # 問題番号と内容を解析
        lines = question_content.strip().split('\n')
        
        if len(lines) < 2:
            continue
            
        # 例題番号と問題文を抽出
        example_line = lines[0].strip()  # "例題１"
        question_text_lines = []
        options = []
        correct_answer = None
        
        parsing_question = True
        
        for i, line in enumerate(lines[1:], 1):
            line = line.strip()
            
            if not line:
                continue
            
            # 選択肢のパターン検出
            option_match = re.match(r'（(\d+)）\s*(.+)', line)
            if option_match:
                parsing_question = False
                option_num = int(option_match.group(1))
                option_text = option_match.group(2)
                options.append({
                    'number': option_num,
                    'text': option_text
                })
                continue
            
            # 正答のパターン検出
            answer_match = re.match(r'正答（(\d+)）', line)
            if answer_match:
                correct_answer = int(answer_match.group(1))
                continue
            
            # 問題文の一部
            if parsing_question:
                question_text_lines.append(line)
        
        if not question_text_lines:
            continue
        
        question_text = '\n'.join(question_text_lines)
        
        # 科目分類の推定
        subject_category = classify_subject(question_text)
        sub_category = classify_sub_category(question_text, subject_category)
        
        # 難易度の推定（文字数とオプション複雑度に基づく）
        difficulty = estimate_difficulty(question_text, options)
        
        # 重要度スコアの計算
        importance_score = calculate_importance_score(
            subject_category, difficulty, len(question_text)
        )
        
        question_data = {
            'exam_year': 2024,
            'exam_month': 8,
            'question_number': int(question_num),
            'subject_category': subject_category,
            'sub_category': sub_category,
            'difficulty_level': difficulty,
            'appearance_frequency': 1,  # 初回出現
            'importance_score': importance_score,
            'source_document': '202408_CPLTest.pdf',
            'markdown_content': question_content,
            'question_text': question_text,
            'options': json.dumps(options, ensure_ascii=False),
            'correct_answer': correct_answer,
            'explanation': None,  # PDFには解説が含まれていない
            'tags': generate_tags(question_text, subject_category)
        }
        
        questions.append(question_data)
    
    print(f"✅ Parsed {len(questions)} questions")
    return questions

def classify_subject(question_text: str) -> str:
    """問題文から科目を分類"""
    
    text_lower = question_text.lower()
    
    # 航空工学関連キーワード
    if any(keyword in text_lower for keyword in [
        'ピトー', 'エンジン', '翼', '安定性', '油圧', '地面効果', 
        'ジャイロ', 'マス・バランス', 'プロペラ', '層流', '乱流'
    ]):
        return '航空工学'
    
    # 航空機体・発動機関連
    if any(keyword in text_lower for keyword in [
        '発動機', 'エンジン', '燃料', '潤滑', '冷却'
    ]):
        return '航空機体・発動機'
    
    # 航空気象関連
    if any(keyword in text_lower for keyword in [
        '気象', '風', '雲', '大気', '気圧', '前線'
    ]):
        return '航空気象'
    
    # 航空法規関連
    if any(keyword in text_lower for keyword in [
        '法', '規則', '許可', '免許', '届出', '報告'
    ]):
        return '航空法規'
    
    # 航空通信関連
    if any(keyword in text_lower for keyword in [
        '通信', '無線', '管制', 'atc', 'vhf'
    ]):
        return '航空通信'
    
    # 航行・航法関連
    if any(keyword in text_lower for keyword in [
        '航法', '計器', 'gps', 'vor', 'ndb', '方位'
    ]):
        return '航行・航法'
    
    return '航空工学'  # デフォルト

def classify_sub_category(question_text: str, subject_category: str) -> Optional[str]:
    """サブカテゴリの分類"""
    
    text_lower = question_text.lower()
    
    if subject_category == '航空工学':
        if any(keyword in text_lower for keyword in ['ピトー', '速度']):
            return 'ピトー静圧系統'
        elif any(keyword in text_lower for keyword in ['プロペラ', 'トルク']):
            return 'プロペラ効果'
        elif any(keyword in text_lower for keyword in ['翼', '失速']):
            return '翼理論'
        elif any(keyword in text_lower for keyword in ['安定性', '動安定']):
            return '安定性・操縦性'
        elif any(keyword in text_lower for keyword in ['油圧', 'バルブ']):
            return '油圧系統'
        elif any(keyword in text_lower for keyword in ['地面効果']):
            return '地面効果'
    
    return None

def estimate_difficulty(question_text: str, options: List[Dict]) -> int:
    """難易度を推定（1-5段階）"""
    
    score = 3  # 基準点
    
    # 文字数による調整
    if len(question_text) > 200:
        score += 1
    elif len(question_text) < 100:
        score -= 1
    
    # 選択肢の複雑度
    if len(options) > 4:
        score += 1
    
    # 複雑な用語の使用
    complex_terms = ['縦横比', 'ジャイロ効果', 'シーケンス・バルブ', '動安定']
    if any(term in question_text for term in complex_terms):
        score += 1
    
    return max(1, min(5, score))

def calculate_importance_score(subject_category: str, difficulty: int, text_length: int) -> float:
    """重要度スコアを計算"""
    
    # 基準スコア
    base_score = 5.0
    
    # 科目重要度
    subject_weights = {
        '航空工学': 1.2,
        '航空法規': 1.1,
        '航空気象': 1.0,
        '航行・航法': 1.0,
        '航空機体・発動機': 0.9,
        '航空通信': 0.8
    }
    
    weight = subject_weights.get(subject_category, 1.0)
    
    # 難易度調整
    difficulty_factor = 1.0 + (difficulty - 3) * 0.1
    
    # 最新性（2024年8月）
    recency_factor = 1.2
    
    score = base_score * weight * difficulty_factor * recency_factor
    
    return round(score, 1)

def generate_tags(question_text: str, subject_category: str) -> List[str]:
    """問題文からタグを生成"""
    
    tags = [subject_category, 'CPL', '2024年8月']
    
    # キーワードベースのタグ
    keyword_tags = {
        'ピトー': ['計器', '速度計測'],
        'プロペラ': ['推進系統', '回転効果'],
        '翼': ['空力', '失速'],
        '安定性': ['飛行特性', '制御'],
        '油圧': ['系統', '制御装置'],
        '地面効果': ['低高度飛行', '着陸'],
        'ジャイロ': ['計器', '姿勢'],
        '気象': ['天候', '大気現象']
    }
    
    for keyword, additional_tags in keyword_tags.items():
        if keyword in question_text:
            tags.extend(additional_tags)
    
    return list(set(tags))

def create_supabase_insert_sql(questions: List[Dict[str, Any]]) -> str:
    """Supabase用のINSERT SQLを生成"""
    
    if not questions:
        return ""
    
    sql_lines = []
    sql_lines.append("-- 実際のCPL試験データ投入 (202408_CPLTest.pdf)")
    sql_lines.append("-- 投入件数: {} 問".format(len(questions)))
    sql_lines.append("-- 生成日時: {}".format(datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
    sql_lines.append("")
    
    # exam_questions_metadata テーブルへの投入
    sql_lines.append("INSERT INTO exam_questions_metadata (")
    sql_lines.append("    exam_year, exam_month, question_number, subject_category, sub_category,")
    sql_lines.append("    difficulty_level, appearance_frequency, importance_score, source_document,")
    sql_lines.append("    markdown_content, question_text, options, correct_answer, explanation, tags")
    sql_lines.append(") VALUES")
    
    value_lines = []
    for i, q in enumerate(questions):
        # SQLインジェクション対策（シンプルなエスケープ）
        def escape_sql_string(s):
            if s is None:
                return 'NULL'
            return "'" + str(s).replace("'", "''") + "'"
        
        def escape_sql_array(arr):
            if arr is None:
                return 'NULL'
            escaped_items = [escape_sql_string(item) for item in arr]
            return "ARRAY[" + ", ".join(escaped_items) + "]"
        
        values = [
            str(q['exam_year']),
            str(q['exam_month']),
            str(q['question_number']),
            escape_sql_string(q['subject_category']),
            escape_sql_string(q['sub_category']),
            str(q['difficulty_level']),
            str(q['appearance_frequency']),
            str(q['importance_score']),
            escape_sql_string(q['source_document']),
            escape_sql_string(q['markdown_content']),
            escape_sql_string(q['question_text']),
            escape_sql_string(q['options']),
            str(q['correct_answer']) if q['correct_answer'] else 'NULL',
            escape_sql_string(q['explanation']),
            escape_sql_array(q['tags'])
        ]
        
        value_line = "    (" + ", ".join(values) + ")"
        if i < len(questions) - 1:
            value_line += ","
        else:
            value_line += ";"
        
        value_lines.append(value_line)
    
    sql_lines.extend(value_lines)
    sql_lines.append("")
    sql_lines.append("-- データ投入完了")
    
    return "\n".join(sql_lines)

def main():
    """メイン実行関数"""
    
    print("🚀 実際のCPL試験データ投入開始")
    print("=" * 60)
    
    # 変換されたMarkdownファイルを読み込み
    markdown_file = Path("./cpl_exam_data/converted_md/real_pdf_202408_CPLTest.md")
    
    if not markdown_file.exists():
        print(f"❌ Markdownファイルが見つかりません: {markdown_file}")
        return
    
    # 問題データを解析
    questions = parse_real_markdown_questions(markdown_file)
    
    if not questions:
        print("❌ 問題データが抽出できませんでした")
        return
    
    print(f"✅ {len(questions)}問のデータを解析完了")
    
    # 科目別統計
    subject_count = {}
    difficulty_count = {}
    
    for q in questions:
        subject = q['subject_category']
        difficulty = q['difficulty_level']
        
        subject_count[subject] = subject_count.get(subject, 0) + 1
        difficulty_count[difficulty] = difficulty_count.get(difficulty, 0) + 1
    
    print("\n📊 科目別統計:")
    for subject, count in sorted(subject_count.items()):
        print(f"   {subject}: {count}問")
    
    print("\n📈 難易度別統計:")
    for difficulty, count in sorted(difficulty_count.items()):
        print(f"   レベル{difficulty}: {count}問")
    
    # SQL文を生成
    sql_content = create_supabase_insert_sql(questions)
    
    # SQLファイルに保存
    sql_file = Path("./scripts/real_exam_data_insert.sql")
    
    with open(sql_file, 'w', encoding='utf-8') as f:
        f.write(sql_content)
    
    print(f"\n💾 SQL文を保存: {sql_file}")
    print(f"📊 ファイルサイズ: {len(sql_content):,} 文字")
    
    # サンプルデータを表示
    print(f"\n📋 サンプルデータ (問題1):")
    print("-" * 40)
    sample = questions[0]
    print(f"問題番号: {sample['question_number']}")
    print(f"科目: {sample['subject_category']}")
    print(f"サブカテゴリ: {sample['sub_category']}")
    print(f"難易度: {sample['difficulty_level']}")
    print(f"重要度: {sample['importance_score']}")
    print(f"タグ: {sample['tags']}")
    print(f"問題文: {sample['question_text'][:100]}...")
    
    print(f"\n🎯 次のステップ:")
    print(f"   1. {sql_file} をSupabaseで実行")
    print(f"   2. 出題傾向分析の実行")
    print(f"   3. コンテンツ推奨システムの実行")

if __name__ == "__main__":
    main() 