#!/usr/bin/env python3
"""
CPL試験PDF一括処理スクリプト

このスクリプトは、cpl_exam_data/raw_pdfs内のすべてのPDFファイルを
順次処理し、Markdown変換からデータベース投入まで自動実行します。

実行方法:
    python scripts/process_all_cpl_pdfs.py

機能:
1. PDFファイル一覧取得
2. 各PDFの変換・構造化処理
3. データベース投入用SQL生成
4. 進捗レポート出力
"""

import os
import sys
import time
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any
import logging

# プロジェクトルートをパスに追加
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

# 既存スクリプトのインポート
from scripts.test_real_pdf_conversion import extract_questions_from_text
from scripts.import_real_exam_data import classify_subject, classify_sub_category, estimate_difficulty, calculate_importance_score, generate_tags, create_supabase_insert_sql

# ログ設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('cpl_exam_data/processing.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class CPLBatchProcessor:
    """CPL試験PDF一括処理クラス"""
    
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.raw_pdfs_dir = self.project_root / "cpl_exam_data" / "raw_pdfs"
        self.converted_md_dir = self.project_root / "cpl_exam_data" / "converted_md"
        self.scripts_dir = self.project_root / "scripts"
        
        # 処理結果保存用
        self.processing_results = []
        self.total_questions = 0
        self.total_files_processed = 0
        self.failed_files = []
        
    def get_pdf_files(self) -> List[Path]:
        """処理対象のPDFファイル一覧を取得"""
        pdf_files = []
        for file_path in self.raw_pdfs_dir.glob("*.pdf"):
            # 既に処理済みかチェック
            md_file = self.converted_md_dir / f"real_pdf_{file_path.stem}.md"
            if not md_file.exists():
                pdf_files.append(file_path)
                logger.info(f"処理対象: {file_path.name}")
            else:
                logger.info(f"スキップ（処理済み）: {file_path.name}")
        
        return sorted(pdf_files)
    
    def process_single_pdf(self, pdf_path: Path) -> Dict[str, Any]:
        """単一PDFファイルの処理"""
        start_time = time.time()
        result = {
            'filename': pdf_path.name,
            'status': 'processing',
            'start_time': datetime.now().isoformat(),
            'file_size_mb': round(pdf_path.stat().st_size / 1024 / 1024, 2),
            'questions_count': 0,
            'error_message': None
        }
        
        try:
            logger.info(f"処理開始: {pdf_path.name}")
            
            # 1. PDF→Markdown変換
            logger.info(f"  1. PDF変換中...")
            markdown_content = self.convert_pdf_to_markdown_alternative(str(pdf_path))
            
            if not markdown_content:
                raise Exception("PDF変換に失敗：空のコンテンツ")
            
            result['extracted_chars'] = len(markdown_content)
            
            # 2. 問題抽出
            logger.info(f"  2. 問題抽出中...")
            questions = extract_questions_from_text(markdown_content)
            result['questions_count'] = len(questions)
            
            if len(questions) == 0:
                logger.warning(f"  警告: 問題が検出されませんでした - {pdf_path.name}")
            
            # 3. Markdownファイル保存
            md_output_path = self.converted_md_dir / f"real_pdf_{pdf_path.stem}.md"
            with open(md_output_path, 'w', encoding='utf-8') as f:
                f.write(markdown_content)
            
            result['markdown_file'] = str(md_output_path.relative_to(self.project_root))
            logger.info(f"  3. Markdown保存完了: {md_output_path.name}")
            
            # 4. データ構造化・SQL生成
            if len(questions) > 0:
                logger.info(f"  4. データ構造化中...")
                
                # 年月の抽出（ファイル名から）
                year, month = self.extract_year_month(pdf_path.name)
                
                # 問題データ分析
                analyzed_questions = self.analyze_questions_batch(questions, year, month, pdf_path.name)
                
                # SQL生成
                sql_content = create_supabase_insert_sql(analyzed_questions)
                
                # SQLファイル保存
                sql_output_path = self.scripts_dir / f"batch_insert_{pdf_path.stem}.sql"
                with open(sql_output_path, 'w', encoding='utf-8') as f:
                    f.write(sql_content)
                
                result['sql_file'] = str(sql_output_path.relative_to(self.project_root))
                result['sql_size_kb'] = round(len(sql_content) / 1024, 2)
                logger.info(f"  4. SQL生成完了: {sql_output_path.name}")
            
            # 処理時間計算
            processing_time = time.time() - start_time
            result['processing_time_seconds'] = round(processing_time, 2)
            result['status'] = 'completed'
            result['end_time'] = datetime.now().isoformat()
            
            logger.info(f"処理完了: {pdf_path.name} ({processing_time:.2f}秒, {len(questions)}問)")
            
        except Exception as e:
            result['status'] = 'failed'
            result['error_message'] = str(e)
            result['end_time'] = datetime.now().isoformat()
            logger.error(f"処理失敗: {pdf_path.name} - {e}")
            self.failed_files.append(pdf_path.name)
        
        return result
    
    def extract_year_month(self, filename: str) -> tuple[int, int]:
        """ファイル名から年月を抽出"""
        import re
        
        # パターン: 202408_CPLTest.pdf -> (2024, 8)
        match = re.search(r'(\d{4})(\d{2})_', filename)
        if match:
            year = int(match.group(1))
            month = int(match.group(2))
            return year, month
        
        # デフォルト値
        return 2024, 1
    
    def convert_pdf_to_markdown_alternative(self, pdf_path: str) -> str:
        """PyPDF2とpdfplumberを使用したPDF変換（代替実装）"""
        import PyPDF2
        import pdfplumber
        
        text_content = ""
        
        try:
            # PyPDF2での基本テキスト抽出
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    text_content += page.extract_text() + "\n"
            
            # pdfplumberでの高精度抽出（補完）
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text and len(page_text) > len(text_content.split('\n')[-10:]):
                        # より多くのテキストが抽出できた場合は置換
                        text_content += page_text + "\n"
        
        except Exception as e:
            logger.error(f"PDF変換エラー: {e}")
            raise
        
        return text_content
    
    def analyze_questions_batch(self, questions: List[Dict[str, Any]], year: int, month: int, source_file: str) -> List[Dict[str, Any]]:
        """問題データの一括分析・構造化"""
        import json
        
        analyzed_questions = []
        
        for i, question in enumerate(questions):
            question_text = question.get('content', '')
            
            # 科目分類
            subject_category = classify_subject(question_text)
            sub_category = classify_sub_category(question_text, subject_category)
            
            # 難易度推定
            difficulty = estimate_difficulty(question_text, [])
            
            # 重要度スコア計算
            importance_score = calculate_importance_score(subject_category, difficulty, len(question_text))
            
            # タグ生成
            tags = generate_tags(question_text, subject_category)
            
            analyzed_question = {
                'exam_year': year,
                'exam_month': month,
                'question_number': question.get('number', i + 1),
                'subject_category': subject_category,
                'sub_category': sub_category,
                'difficulty_level': difficulty,
                'appearance_frequency': 1,
                'importance_score': importance_score,
                'source_document': source_file,
                'markdown_content': question_text,
                'question_text': question_text,
                'options': json.dumps([], ensure_ascii=False),  # 選択肢情報なし
                'correct_answer': None,
                'explanation': None,
                'tags': tags
            }
            
            analyzed_questions.append(analyzed_question)
        
        return analyzed_questions
    
    def process_all_pdfs(self) -> Dict[str, Any]:
        """すべてのPDFファイルを処理"""
        logger.info("=== CPL試験PDF一括処理開始 ===")
        
        pdf_files = self.get_pdf_files()
        
        if not pdf_files:
            logger.info("処理対象のPDFファイルがありません")
            return {'status': 'no_files', 'results': []}
        
        logger.info(f"処理対象ファイル数: {len(pdf_files)}")
        
        batch_start_time = time.time()
        
        # 各PDFファイルを順次処理
        for i, pdf_path in enumerate(pdf_files, 1):
            logger.info(f"\n[{i}/{len(pdf_files)}] {pdf_path.name}")
            
            result = self.process_single_pdf(pdf_path)
            self.processing_results.append(result)
            
            if result['status'] == 'completed':
                self.total_files_processed += 1
                self.total_questions += result['questions_count']
            
            # 進捗表示
            progress = (i / len(pdf_files)) * 100
            logger.info(f"進捗: {progress:.1f}% ({i}/{len(pdf_files)})")
        
        # 処理結果サマリー
        total_time = time.time() - batch_start_time
        summary = self.generate_summary(total_time)
        
        # 結果保存
        self.save_processing_report(summary)
        
        logger.info("=== CPL試験PDF一括処理完了 ===")
        return summary
    
    def generate_summary(self, total_time: float) -> Dict[str, Any]:
        """処理結果サマリーを生成"""
        successful_files = [r for r in self.processing_results if r['status'] == 'completed']
        failed_files = [r for r in self.processing_results if r['status'] == 'failed']
        
        summary = {
            'batch_processing_summary': {
                'start_time': self.processing_results[0]['start_time'] if self.processing_results else None,
                'end_time': datetime.now().isoformat(),
                'total_processing_time_minutes': round(total_time / 60, 2),
                'total_files_attempted': len(self.processing_results),
                'successful_files': len(successful_files),
                'failed_files': len(failed_files),
                'total_questions_extracted': self.total_questions,
                'average_questions_per_file': round(self.total_questions / max(len(successful_files), 1), 1)
            },
            'file_results': self.processing_results,
            'failed_files_list': [f['filename'] for f in failed_files],
            'performance_metrics': {
                'avg_processing_time_per_file': round(
                    sum(r.get('processing_time_seconds', 0) for r in successful_files) / max(len(successful_files), 1), 2
                ),
                'total_markdown_files_created': len(successful_files),
                'total_sql_files_created': len([r for r in successful_files if 'sql_file' in r])
            }
        }
        
        return summary
    
    def save_processing_report(self, summary: Dict[str, Any]):
        """処理レポートを保存"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M")
        
        # JSON形式で詳細レポート保存
        json_report_path = self.project_root / "cpl_exam_data" / f"batch_processing_report_{timestamp}.json"
        with open(json_report_path, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
        
        # Markdown形式でサマリーレポート保存
        md_report_path = self.project_root / "cpl_exam_data" / f"batch_processing_summary_{timestamp}.md"
        self.generate_markdown_report(summary, md_report_path)
        
        logger.info(f"処理レポート保存完了:")
        logger.info(f"  詳細レポート: {json_report_path}")
        logger.info(f"  サマリー: {md_report_path}")
    
    def generate_markdown_report(self, summary: Dict[str, Any], output_path: Path):
        """Markdown形式のレポートを生成"""
        batch_summary = summary['batch_processing_summary']
        
        md_content = f"""# CPL試験PDF一括処理レポート

## 処理サマリー

- **処理開始時刻**: {batch_summary['start_time']}
- **処理終了時刻**: {batch_summary['end_time']}
- **総処理時間**: {batch_summary['total_processing_time_minutes']}分
- **処理対象ファイル数**: {batch_summary['total_files_attempted']}件
- **成功ファイル数**: {batch_summary['successful_files']}件
- **失敗ファイル数**: {batch_summary['failed_files']}件
- **抽出問題総数**: {batch_summary['total_questions_extracted']}問
- **ファイル当たり平均問題数**: {batch_summary['average_questions_per_file']}問

## パフォーマンス指標

- **ファイル当たり平均処理時間**: {summary['performance_metrics']['avg_processing_time_per_file']}秒
- **生成Markdownファイル数**: {summary['performance_metrics']['total_markdown_files_created']}件
- **生成SQLファイル数**: {summary['performance_metrics']['total_sql_files_created']}件

## 処理結果詳細

| ファイル名 | 状態 | 問題数 | 処理時間(秒) | ファイルサイズ(MB) |
|-----------|------|--------|-------------|------------------|
"""
        
        for result in summary['file_results']:
            status_icon = "✅" if result['status'] == 'completed' else "❌"
            md_content += f"| {result['filename']} | {status_icon} {result['status']} | {result['questions_count']} | {result.get('processing_time_seconds', 'N/A')} | {result['file_size_mb']} |\n"
        
        if summary['failed_files_list']:
            md_content += f"\n## 失敗ファイル一覧\n\n"
            for failed_file in summary['failed_files_list']:
                md_content += f"- {failed_file}\n"
        
        md_content += f"\n## 次のステップ\n\n"
        md_content += f"1. 生成されたSQLファイルをSupabaseに投入\n"
        md_content += f"2. 出題傾向分析レポート生成\n"
        md_content += f"3. コンテンツ推奨システム実行\n"
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(md_content)

def main():
    """メイン処理"""
    processor = CPLBatchProcessor()
    summary = processor.process_all_pdfs()
    
    # 結果表示
    batch_summary = summary.get('batch_processing_summary', {})
    print(f"\n=== 処理完了サマリー ===")
    print(f"成功: {batch_summary.get('successful_files', 0)}件")
    print(f"失敗: {batch_summary.get('failed_files', 0)}件")
    print(f"総問題数: {batch_summary.get('total_questions_extracted', 0)}問")
    print(f"処理時間: {batch_summary.get('total_processing_time_minutes', 0)}分")

if __name__ == "__main__":
    main() 