#!/usr/bin/env python3
"""
CPL試験データ投入スクリプト
変換されたMarkdownファイルを解析し、Supabaseデータベースに投入する

Usage:
    python scripts/import_exam_data.py --source ./cpl_exam_data/converted_md --config .env.local
"""

import os
import sys
import argparse
import re
import json
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime

try:
    from supabase import create_client, Client
    from dotenv import load_dotenv
except ImportError:
    print("ERROR: Required packages not installed. Please install with:")
    print("pip install supabase python-dotenv")
    sys.exit(1)

@dataclass
class ExamQuestion:
    """試験問題データクラス"""
    exam_year: int
    exam_month: int
    question_number: int
    subject_category: str
    sub_category: Optional[str]
    difficulty_level: int
    question_text: str
    options: Dict[str, str]  # {'1': '選択肢1', '2': '選択肢2', ...}
    correct_answer: int
    explanation: str
    source_document: str
    markdown_content: str
    tags: List[str] = None
    
    def __post_init__(self):
        if self.tags is None:
            self.tags = []

class ExamDataParser:
    """試験データ解析クラス"""
    
    def __init__(self):
        # 科目分類ルール
        self.subject_classification_rules = {
            '航法': ['航法', 'ナビゲーション', 'GPS', 'VOR', 'ADF', 'DME', '推測航法', '電波航法'],
            '航空法規': ['航空法', '法規', '規則', 'AIP', '許可', '認可', '資格', '技能証明', '身体検査', '耐空証明'],
            '気象': ['気象', '天気', '雲', '風', '気圧', '気温', '湿度', '乱気流', '着氷', '雷雨', '霧'],
            '機体': ['機体', 'エンジン', '構造', '装備', '計器', '操縦系統', '降着装置', '燃料', '電気'],
            '通信': ['通信', '無線', 'VHF', 'HF', 'ATC', '管制', '交信', 'トランスポンダ'],
            '空港・管制': ['空港', '管制', '滑走路', '誘導路', '管制塔', 'ATIS', 'ILS', 'PAR'],
            '航空工学': ['空力', '性能', '重量', '重心', '安定性', '操縦性', '失速', '旋回'],
            '飛行理論': ['飛行', '操縦', '離陸', '着陸', '上昇', '降下', '水平飛行', '旋回']
        }
    
    def parse_markdown_file(self, file_path: Path) -> List[ExamQuestion]:
        """Markdownファイルから試験問題を抽出"""
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # メタデータの抽出
        metadata = self.extract_metadata(content)
        
        # 問題の抽出
        questions = self.extract_questions(content, metadata, file_path.name)
        
        return questions
    
    def extract_metadata(self, content: str) -> Dict:
        """Markdownヘッダーからメタデータを抽出"""
        metadata = {}
        
        # YAML フロントマターの抽出
        yaml_pattern = r'^---\s*\n(.*?)\n---\s*\n'
        yaml_match = re.search(yaml_pattern, content, re.DOTALL)
        
        if yaml_match:
            yaml_content = yaml_match.group(1)
            for line in yaml_content.split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip()
                    value = value.strip().strip('"')
                    
                    # 数値変換
                    if value.isdigit():
                        value = int(value)
                    
                    metadata[key] = value
        
        return metadata
    
    def extract_questions(self, content: str, metadata: Dict, source_file: str) -> List[ExamQuestion]:
        """コンテンツから問題を抽出"""
        questions = []
        
        # 問題パターンの検索
        question_pattern = r'##\s*問題(\d+)\s*\n\n(.*?)(?=##\s*問題\d+|$)'
        question_matches = re.findall(question_pattern, content, re.DOTALL)
        
        for question_num, question_content in question_matches:
            try:
                question = self.parse_single_question(
                    int(question_num),
                    question_content,
                    metadata,
                    source_file
                )
                if question:
                    questions.append(question)
            except Exception as e:
                print(f"Warning: Failed to parse question {question_num}: {e}")
                continue
        
        return questions
    
    def parse_single_question(self, question_num: int, content: str, metadata: Dict, source_file: str) -> Optional[ExamQuestion]:
        """単一問題の解析"""
        
        lines = content.strip().split('\n')
        question_text = ""
        options = {}
        correct_answer = None
        explanation = ""
        
        current_section = "question"
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # 選択肢の検出
            choice_match = re.match(r'\(([1-4])\)\s*(.*)', line)
            if choice_match:
                choice_num = choice_match.group(1)
                choice_text = choice_match.group(2)
                options[choice_num] = choice_text
                current_section = "options"
                continue
            
            # 正解の検出
            if line.startswith('**正解:'):
                correct_match = re.search(r'\((\d+)\)', line)
                if correct_match:
                    correct_answer = int(correct_match.group(1))
                current_section = "answer"
                continue
            
            # 解説の検出
            if line.startswith('**解説:'):
                explanation = line.replace('**解説:', '').replace('**', '').strip()
                current_section = "explanation"
                continue
            
            # セクション別コンテンツの蓄積
            if current_section == "question":
                question_text += line + " "
            elif current_section == "explanation" and not line.startswith('**'):
                explanation += " " + line
        
        # 必須フィールドの検証
        if not question_text or not options or correct_answer is None:
            return None
        
        # 科目分類
        subject_category = self.classify_subject(question_text + " " + explanation)
        sub_category = self.classify_sub_category(question_text + " " + explanation, subject_category)
        
        # 難易度推定
        difficulty_level = self.estimate_difficulty(question_text, options, explanation)
        
        return ExamQuestion(
            exam_year=metadata.get('exam_year', 2024),
            exam_month=metadata.get('exam_month', 1),
            question_number=question_num,
            subject_category=subject_category,
            sub_category=sub_category,
            difficulty_level=difficulty_level,
            question_text=question_text.strip(),
            options=options,
            correct_answer=correct_answer,
            explanation=explanation.strip(),
            source_document=source_file,
            markdown_content=content,
            tags=self.generate_tags(question_text, explanation)
        )
    
    def classify_subject(self, text: str) -> str:
        """問題文から科目を分類"""
        text_lower = text.lower()
        
        for subject, keywords in self.subject_classification_rules.items():
            for keyword in keywords:
                if keyword.lower() in text_lower:
                    return subject
        
        return 'その他'
    
    def classify_sub_category(self, text: str, subject: str) -> Optional[str]:
        """詳細分野の分類"""
        text_lower = text.lower()
        
        # 主科目別のサブカテゴリ分類ルール
        sub_category_rules = {
            '航法': {
                '電波航法': ['vor', 'adf', 'dme', 'gps', 'ils'],
                '推測航法': ['推測', '方位', '距離', '位置'],
                '天測航法': ['天測', '太陽', '星']
            },
            '航空法規': {
                '技能証明': ['技能証明', '免許', 'ライセンス'],
                '身体検査': ['身体検査', '健康', '体調'],
                '耐空証明': ['耐空証明', '機体', '安全性']
            },
            '気象': {
                '一般気象': ['気圧', '気温', '湿度'],
                '危険気象': ['乱気流', '着氷', '雷雨', '霧'],
                '気象図': ['天気図', '等圧線']
            }
        }
        
        if subject in sub_category_rules:
            for sub_cat, keywords in sub_category_rules[subject].items():
                for keyword in keywords:
                    if keyword in text_lower:
                        return sub_cat
        
        return None
    
    def estimate_difficulty(self, question_text: str, options: Dict, explanation: str) -> int:
        """難易度推定（1-5）"""
        difficulty_score = 3  # デフォルト
        
        # 計算が必要な問題は難易度高
        if re.search(r'\d+.*[+\-*/].*\d+|計算|求め', question_text + explanation):
            difficulty_score += 1
        
        # 複数の概念が組み合わさっている問題は難易度高
        concept_count = len(re.findall(r'かつ|および|さらに|一方', question_text))
        if concept_count > 1:
            difficulty_score += 1
        
        # 説明が長い問題は難易度高
        if len(explanation) > 100:
            difficulty_score += 1
        
        # 数値が含まれる問題は難易度やや高
        if re.search(r'\d+', question_text):
            difficulty_score += 0.5
        
        return min(5, max(1, int(difficulty_score)))
    
    def generate_tags(self, question_text: str, explanation: str) -> List[str]:
        """問題のタグ生成"""
        text = (question_text + " " + explanation).lower()
        tags = []
        
        # 技術的キーワード
        tech_keywords = ['計算', '数値', '図表', '実技', '理論', '法規', '安全']
        for keyword in tech_keywords:
            if keyword in text:
                tags.append(keyword)
        
        # 難易度タグ
        if '基本' in text or '基礎' in text:
            tags.append('基本')
        elif '応用' in text or '複雑' in text:
            tags.append('応用')
        
        return tags

class ExamDataImporter:
    """Supabaseデータ投入クラス"""
    
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
    
    def import_questions(self, questions: List[ExamQuestion]) -> Dict[str, int]:
        """問題データをSupabaseに投入"""
        results = {'success': 0, 'failed': 0, 'skipped': 0}
        
        for question in questions:
            try:
                # 重複チェック
                existing = self.supabase.table('exam_questions_metadata').select('id').eq(
                    'exam_year', question.exam_year
                ).eq(
                    'exam_month', question.exam_month
                ).eq(
                    'question_number', question.question_number
                ).execute()
                
                if existing.data:
                    print(f"Skipping existing question: {question.exam_year}/{question.exam_month} Q{question.question_number}")
                    results['skipped'] += 1
                    continue
                
                # データ投入
                insert_data = {
                    'exam_year': question.exam_year,
                    'exam_month': question.exam_month,
                    'question_number': question.question_number,
                    'subject_category': question.subject_category,
                    'sub_category': question.sub_category,
                    'difficulty_level': question.difficulty_level,
                    'question_text': question.question_text,
                    'options': question.options,
                    'correct_answer': question.correct_answer,
                    'explanation': question.explanation,
                    'source_document': question.source_document,
                    'markdown_content': question.markdown_content,
                    'tags': question.tags
                }
                
                result = self.supabase.table('exam_questions_metadata').insert(insert_data).execute()
                
                if result.data:
                    print(f"✓ Imported: {question.exam_year}/{question.exam_month} Q{question.question_number} ({question.subject_category})")
                    results['success'] += 1
                else:
                    print(f"✗ Failed to import: {question.exam_year}/{question.exam_month} Q{question.question_number}")
                    results['failed'] += 1
                
            except Exception as e:
                print(f"✗ Error importing question {question.question_number}: {e}")
                results['failed'] += 1
        
        return results

def main():
    parser = argparse.ArgumentParser(description='Import CPL exam data to Supabase')
    parser.add_argument('--source', '-s', required=True, help='Source directory with converted Markdown files')
    parser.add_argument('--config', '-c', default='.env.local', help='Environment config file')
    parser.add_argument('--dry-run', action='store_true', help='Parse data but do not import to database')
    
    args = parser.parse_args()
    
    # 環境変数の読み込み
    if Path(args.config).exists():
        load_dotenv(args.config)
    else:
        print(f"Warning: Config file {args.config} not found, using environment variables")
    
    # Supabase接続
    supabase_url = os.getenv('VITE_SUPABASE_URL')
    supabase_key = os.getenv('VITE_SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_key:
        print("ERROR: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set")
        sys.exit(1)
    
    supabase = create_client(supabase_url, supabase_key)
    
    # データ解析
    source_path = Path(args.source)
    if not source_path.exists():
        print(f"ERROR: Source directory does not exist: {source_path}")
        sys.exit(1)
    
    parser = ExamDataParser()
    importer = ExamDataImporter(supabase)
    
    print(f"Parsing exam data from: {source_path}")
    print(f"Dry run mode: {args.dry_run}")
    print("-" * 50)
    
    all_questions = []
    md_files = list(source_path.glob("**/*.md"))
    
    if not md_files:
        print("No Markdown files found in source directory")
        return
    
    # ファイル解析
    for md_file in md_files:
        print(f"Parsing: {md_file.name}")
        try:
            questions = parser.parse_markdown_file(md_file)
            all_questions.extend(questions)
            print(f"  Found {len(questions)} questions")
        except Exception as e:
            print(f"  Error parsing {md_file.name}: {e}")
    
    print(f"\nTotal questions parsed: {len(all_questions)}")
    
    # 統計情報
    if all_questions:
        subjects = {}
        difficulties = {}
        
        for q in all_questions:
            subjects[q.subject_category] = subjects.get(q.subject_category, 0) + 1
            difficulties[q.difficulty_level] = difficulties.get(q.difficulty_level, 0) + 1
        
        print("\nSubject distribution:")
        for subject, count in subjects.items():
            print(f"  {subject}: {count}")
        
        print("\nDifficulty distribution:")
        for level, count in difficulties.items():
            print(f"  Level {level}: {count}")
    
    # データベース投入
    if not args.dry_run and all_questions:
        print("\n" + "-" * 50)
        print("Importing to database...")
        results = importer.import_questions(all_questions)
        
        print(f"\nImport completed:")
        print(f"  Success: {results['success']}")
        print(f"  Failed: {results['failed']}")
        print(f"  Skipped: {results['skipped']}")
    elif args.dry_run:
        print("\nDry run completed - no data imported")

if __name__ == "__main__":
    main() 