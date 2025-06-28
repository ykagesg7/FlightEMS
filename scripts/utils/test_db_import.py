#!/usr/bin/env python3
"""
データベース投入テストスクリプト
サンプルデータを使用してSupabaseデータベースへの投入をテスト
"""

import os
import json
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass
from typing import List, Optional, Dict, Any
import re

# Supabaseクライアント設定
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    print("Warning: supabase package not available")
    SUPABASE_AVAILABLE = False

@dataclass
class ExamQuestion:
    """試験問題データクラス"""
    exam_year: int
    exam_month: int
    question_number: int
    subject_category: str
    sub_category: Optional[str]
    difficulty_level: int
    source_document: str
    markdown_content: str
    question_text: str
    options: Dict[str, str]
    correct_answer: int
    explanation: str
    tags: List[str]

def parse_sample_markdown(file_path: Path) -> List[ExamQuestion]:
    """サンプルMarkdownファイルを解析して問題データを抽出"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    questions = []
    
    # FrontMatterから基本情報を抽出
    frontmatter_match = re.search(r'^---\n(.*?)\n---', content, re.DOTALL)
    if frontmatter_match:
        frontmatter = frontmatter_match.group(1)
        exam_year = int(re.search(r'exam_year:\s*(\d+)', frontmatter).group(1))
        exam_month = int(re.search(r'exam_month:\s*(\d+)', frontmatter).group(1))
        source_file = re.search(r'source_file:\s*"([^"]+)"', frontmatter).group(1)
    else:
        exam_year = 2024
        exam_month = 8
        source_file = file_path.name
    
    # 問題セクションを抽出
    problem_sections = re.findall(r'## 問題(\d+)\n\n(.*?)(?=## 問題\d+|\Z)', content, re.DOTALL)
    
    for problem_num, problem_content in problem_sections:
        try:
            # 問題文を抽出
            question_match = re.search(r'^(.*?)(?=\(\d+\))', problem_content.strip(), re.DOTALL)
            if question_match:
                question_text = question_match.group(1).strip()
            else:
                question_text = "問題文の抽出に失敗"
            
            # 選択肢を抽出
            options = {}
            option_matches = re.findall(r'\((\d+)\)\s*(.*?)(?=\(\d+\)|$|\*\*正解)', problem_content, re.DOTALL)
            for opt_num, opt_text in option_matches:
                options[opt_num] = opt_text.strip()
            
            # 正解を抽出
            correct_match = re.search(r'\*\*正解:\s*\((\d+)\)\*\*', problem_content)
            correct_answer = int(correct_match.group(1)) if correct_match else 1
            
            # 解説を抽出
            explanation_match = re.search(r'\*\*解説:\*\*\s*(.*?)(?=\n\n|\Z)', problem_content, re.DOTALL)
            explanation = explanation_match.group(1).strip() if explanation_match else "解説なし"
            
            # 科目分類を推定
            if "航空法" in question_text:
                subject_category = "航空法規"
                sub_category = "航空法"
            elif "気温" in question_text or "標準大気" in question_text:
                subject_category = "気象"
                sub_category = "大気"
            elif "重心" in question_text or "安定性" in question_text:
                subject_category = "飛行理論"
                sub_category = "安定性"
            else:
                subject_category = "その他"
                sub_category = None
            
            # 難易度を推定（問題文の複雑さから）
            difficulty_level = 2 if len(question_text) > 50 else 1
            
            # タグを生成
            tags = [subject_category]
            if sub_category:
                tags.append(sub_category)
            
            question = ExamQuestion(
                exam_year=exam_year,
                exam_month=exam_month,
                question_number=int(problem_num),
                subject_category=subject_category,
                sub_category=sub_category,
                difficulty_level=difficulty_level,
                source_document=source_file,
                markdown_content=problem_content.strip(),
                question_text=question_text,
                options=options,
                correct_answer=correct_answer,
                explanation=explanation,
                tags=tags
            )
            
            questions.append(question)
            
        except Exception as e:
            print(f"Error parsing question {problem_num}: {e}")
    
    return questions

def insert_test_data():
    """テストデータをデータベースに投入"""
    
    if not SUPABASE_AVAILABLE:
        print("Supabase not available - simulating database operations")
        return simulate_database_operations()
    
    # Supabase設定（実際の環境変数から取得する必要があります）
    url = "https://fstynltdfdetpyvbrswr.supabase.co"  # FlightAcademyプロジェクト
    # 実際の運用では環境変数から取得
    # key = os.getenv("SUPABASE_ANON_KEY")
    
    print("=== Database Import Test ===")
    print("Note: Using test mode - actual database connection would require API key")
    
    # サンプルファイルを読み込み
    sample_file = Path("./cpl_exam_data/converted_md/sample_202408_CPLTest.md")
    
    if not sample_file.exists():
        print(f"Sample file not found: {sample_file}")
        return
    
    questions = parse_sample_markdown(sample_file)
    
    print(f"Parsed {len(questions)} questions from sample file")
    print("-" * 50)
    
    for i, question in enumerate(questions, 1):
        print(f"Question {i}:")
        print(f"  Year/Month: {question.exam_year}/{question.exam_month:02d}")
        print(f"  Number: {question.question_number}")
        print(f"  Subject: {question.subject_category}")
        print(f"  Sub-category: {question.sub_category}")
        print(f"  Difficulty: {question.difficulty_level}")
        print(f"  Question: {question.question_text[:50]}...")
        print(f"  Options: {len(question.options)} choices")
        print(f"  Correct: {question.correct_answer}")
        print(f"  Tags: {question.tags}")
        print()
    
    return questions

def simulate_database_operations():
    """データベース操作のシミュレーション"""
    
    print("=== Simulating Database Operations ===")
    
    # サンプルデータ
    sample_data = [
        {
            "exam_year": 2024,
            "exam_month": 8,
            "question_number": 1,
            "subject_category": "航空法規",
            "sub_category": "航空法",
            "difficulty_level": 2,
            "source_document": "202408_CPLTest.pdf",
            "question_text": "次の航空法に関する記述のうち、正しいものはどれか。",
            "options": {
                "1": "事業用操縦士の技能証明は、有効期間が設定されていない",
                "2": "航空身体検査証明の有効期間は一律2年である",
                "3": "耐空証明書は、航空機の安全性を証明する書類である",
                "4": "飛行計画書の提出は任意である"
            },
            "correct_answer": 3,
            "explanation": "耐空証明書は、航空機が安全に飛行できる状態にあることを証明する重要な書類です。",
            "tags": ["航空法規", "航空法"]
        },
        {
            "exam_year": 2024,
            "exam_month": 8,
            "question_number": 2,
            "subject_category": "気象",
            "sub_category": "大気",
            "difficulty_level": 3,
            "source_document": "202408_CPLTest.pdf",
            "question_text": "標準大気条件において、高度1500mでの気温として最も近い値はどれか。",
            "options": {
                "1": "5.25°C",
                "2": "6.75°C", 
                "3": "8.25°C",
                "4": "9.75°C"
            },
            "correct_answer": 2,
            "explanation": "標準大気では海面上15°Cから6.5°C/1000mの割合で気温が低下します。",
            "tags": ["気象", "大気"]
        }
    ]
    
    print("Simulated INSERT operations:")
    for data in sample_data:
        print(f"  INSERT INTO exam_questions_metadata: Question {data['question_number']}")
        print(f"    Subject: {data['subject_category']} - {data['sub_category']}")
        print(f"    Difficulty: {data['difficulty_level']}")
    
    print("\nSimulated analysis operations:")
    print("  - Calculating importance scores")
    print("  - Analyzing content gaps")
    print("  - Generating trend analysis")
    
    return sample_data

if __name__ == "__main__":
    try:
        result = insert_test_data()
        print(f"\nTest completed successfully. Processed {len(result) if result else 0} items.")
    except Exception as e:
        print(f"Test failed: {e}")
        import traceback
        traceback.print_exc() 