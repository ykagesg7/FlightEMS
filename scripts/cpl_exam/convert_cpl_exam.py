#!/usr/bin/env python3
"""
CPL学科試験PDFからMarkdown変換スクリプト
MarkItDownライブラリを使用してCPL試験PDFを構造化されたMarkdownに変換する

Usage:
    python scripts/convert_cpl_exam.py --input ./cpl_exam_data/raw_pdfs --output ./cpl_exam_data/converted_md
"""

import os
import sys
import argparse
import hashlib
import json
from pathlib import Path
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict
from datetime import datetime

try:
    from markitdown import MarkItDown
except ImportError:
    print("ERROR: markitdown not installed. Please install with: pip install markitdown")
    sys.exit(1)

@dataclass
class ConversionResult:
    """変換結果を格納するデータクラス"""
    source_file: str
    output_file: str
    file_size: int
    checksum: str
    status: str  # 'success', 'error', 'skipped'
    error_message: Optional[str] = None
    conversion_time: Optional[float] = None
    created_at: str = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()

@dataclass
class QualityReport:
    """変換品質レポート"""
    has_proper_structure: bool = False
    question_count: int = 0
    encoding_issues: List[str] = None
    missing_sections: List[str] = None
    confidence_score: float = 0.0
    
    def __post_init__(self):
        if self.encoding_issues is None:
            self.encoding_issues = []
        if self.missing_sections is None:
            self.missing_sections = []

class CPLExamConverter:
    """CPL試験PDF変換メインクラス"""
    
    def __init__(self, input_dir: str, output_dir: str, force_overwrite: bool = False):
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir)
        self.force_overwrite = force_overwrite
        self.md_converter = MarkItDown()
        self.conversion_log = []
        
        # 出力ディレクトリの作成
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def calculate_file_checksum(self, file_path: Path) -> str:
        """ファイルのSHA256チェックサムを計算"""
        hash_sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()
    
    def convert_single_pdf(self, pdf_path: Path) -> ConversionResult:
        """単一PDFファイルをMarkdownに変換"""
        start_time = datetime.now()
        
        try:
            # 出力ファイルパスの決定
            relative_path = pdf_path.relative_to(self.input_dir)
            output_path = self.output_dir / relative_path.with_suffix('.md')
            
            # 既存ファイルのスキップチェック
            if output_path.exists() and not self.force_overwrite:
                return ConversionResult(
                    source_file=str(pdf_path),
                    output_file=str(output_path),
                    file_size=pdf_path.stat().st_size,
                    checksum=self.calculate_file_checksum(pdf_path),
                    status='skipped',
                    error_message='File already exists (use --force to overwrite)'
                )
            
            # 出力ディレクトリの作成
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            # PDF読み込み・変換
            with open(pdf_path, 'rb') as f:
                result = self.md_converter.convert(f)
                markdown_content = result.text_content
            
            # 変換されたMarkdownの前処理
            processed_content = self.preprocess_markdown(markdown_content, pdf_path)
            
            # ファイル保存
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(processed_content)
            
            # 変換時間計算
            conversion_time = (datetime.now() - start_time).total_seconds()
            
            return ConversionResult(
                source_file=str(pdf_path),
                output_file=str(output_path),
                file_size=pdf_path.stat().st_size,
                checksum=self.calculate_file_checksum(pdf_path),
                status='success',
                conversion_time=conversion_time
            )
            
        except Exception as e:
            return ConversionResult(
                source_file=str(pdf_path),
                output_file='',
                file_size=pdf_path.stat().st_size if pdf_path.exists() else 0,
                checksum='',
                status='error',
                error_message=str(e)
            )
    
    def preprocess_markdown(self, content: str, source_path: Path) -> str:
        """Markdownコンテンツの前処理・構造化"""
        
        # メタデータヘッダーの追加
        metadata = self.extract_metadata_from_filename(source_path)
        header = f"""---
title: "{metadata.get('title', source_path.stem)}"
exam_year: {metadata.get('year', 'unknown')}
exam_month: {metadata.get('month', 'unknown')}
source_file: "{source_path.name}"
converted_at: "{datetime.now().isoformat()}"
---

# {metadata.get('title', source_path.stem)}

"""
        
        # 基本的なクリーンアップ
        lines = content.split('\n')
        cleaned_lines = []
        
        for line in lines:
            # 空行の正規化
            if line.strip() == '':
                cleaned_lines.append('')
                continue
            
            # 問題番号の正規化
            line = self.normalize_question_numbers(line)
            
            # 選択肢の正規化
            line = self.normalize_answer_choices(line)
            
            cleaned_lines.append(line)
        
        # 重複空行の除去
        processed_lines = []
        prev_empty = False
        for line in cleaned_lines:
            if line.strip() == '':
                if not prev_empty:
                    processed_lines.append(line)
                prev_empty = True
            else:
                processed_lines.append(line)
                prev_empty = False
        
        return header + '\n'.join(processed_lines)
    
    def extract_metadata_from_filename(self, file_path: Path) -> Dict[str, str]:
        """ファイル名からメタデータを抽出"""
        filename = file_path.stem
        metadata = {}
        
        # CPL_YYYYMM.pdf のようなパターンを想定
        import re
        
        # 年月の抽出
        year_month_match = re.search(r'(\d{4})(\d{2})', filename)
        if year_month_match:
            metadata['year'] = year_month_match.group(1)
            metadata['month'] = year_month_match.group(2)
            metadata['title'] = f"CPL学科試験 {metadata['year']}年{metadata['month']}月"
        else:
            metadata['title'] = filename
        
        return metadata
    
    def normalize_question_numbers(self, line: str) -> str:
        """問題番号の正規化"""
        import re
        
        # "問1", "問題1", "1.", "1)" などを統一
        patterns = [
            (r'^問題?(\d+)[.)]?\s*', r'## 問題\1\n\n'),
            (r'^(\d+)[.)] ', r'## 問題\1\n\n'),
        ]
        
        for pattern, replacement in patterns:
            if re.match(pattern, line.strip()):
                return re.sub(pattern, replacement, line.strip())
        
        return line
    
    def normalize_answer_choices(self, line: str) -> str:
        """選択肢の正規化"""
        import re
        
        # "(1)", "1)", "a)", "A." などを統一
        choice_pattern = r'^[(]?([1-4abcdABCD])[.)]?\s+'
        if re.match(choice_pattern, line.strip()):
            match = re.match(choice_pattern, line.strip())
            choice_num = match.group(1)
            remaining = line.strip()[match.end():]
            return f"({choice_num}) {remaining}"
        
        return line
    
    def batch_convert(self) -> List[ConversionResult]:
        """ディレクトリ内の全PDFファイルを一括変換"""
        pdf_files = list(self.input_dir.glob("**/*.pdf"))
        
        if not pdf_files:
            print(f"WARNING: No PDF files found in {self.input_dir}")
            return []
        
        print(f"Found {len(pdf_files)} PDF files to convert...")
        
        results = []
        for i, pdf_file in enumerate(pdf_files, 1):
            print(f"Converting [{i}/{len(pdf_files)}]: {pdf_file.name}")
            result = self.convert_single_pdf(pdf_file)
            results.append(result)
            self.conversion_log.append(result)
            
            # 結果の表示
            if result.status == 'success':
                print(f"  ✓ Success: {result.output_file}")
            elif result.status == 'skipped':
                print(f"  ⚠ Skipped: {result.error_message}")
            else:
                print(f"  ✗ Error: {result.error_message}")
        
        return results
    
    def save_conversion_log(self, log_path: Optional[Path] = None) -> None:
        """変換ログをJSONファイルに保存"""
        if log_path is None:
            log_path = self.output_dir / "conversion_log.json"
        
        log_data = {
            "conversion_summary": {
                "total_files": len(self.conversion_log),
                "successful": len([r for r in self.conversion_log if r.status == 'success']),
                "failed": len([r for r in self.conversion_log if r.status == 'error']),
                "skipped": len([r for r in self.conversion_log if r.status == 'skipped']),
                "timestamp": datetime.now().isoformat()
            },
            "results": [asdict(result) for result in self.conversion_log]
        }
        
        with open(log_path, 'w', encoding='utf-8') as f:
            json.dump(log_data, f, indent=2, ensure_ascii=False)
        
        print(f"Conversion log saved to: {log_path}")

def main():
    parser = argparse.ArgumentParser(description='Convert CPL exam PDFs to Markdown')
    parser.add_argument('--input', '-i', required=True, help='Input directory containing PDF files')
    parser.add_argument('--output', '-o', required=True, help='Output directory for Markdown files')
    parser.add_argument('--force', '-f', action='store_true', help='Overwrite existing files')
    parser.add_argument('--log', '-l', help='Path to save conversion log (default: output_dir/conversion_log.json)')
    
    args = parser.parse_args()
    
    # 入力ディレクトリの存在確認
    input_path = Path(args.input)
    if not input_path.exists():
        print(f"ERROR: Input directory does not exist: {input_path}")
        sys.exit(1)
    
    # 変換実行
    converter = CPLExamConverter(
        input_dir=args.input,
        output_dir=args.output,
        force_overwrite=args.force
    )
    
    print("Starting CPL exam PDF conversion...")
    print(f"Input directory: {input_path}")
    print(f"Output directory: {converter.output_dir}")
    print(f"Force overwrite: {args.force}")
    print("-" * 50)
    
    results = converter.batch_convert()
    
    # ログ保存
    log_path = Path(args.log) if args.log else None
    converter.save_conversion_log(log_path)
    
    # サマリー表示
    successful = len([r for r in results if r.status == 'success'])
    failed = len([r for r in results if r.status == 'error'])
    skipped = len([r for r in results if r.status == 'skipped'])
    
    print("-" * 50)
    print(f"Conversion completed!")
    print(f"Total files: {len(results)}")
    print(f"Successful: {successful}")
    print(f"Failed: {failed}")
    print(f"Skipped: {skipped}")
    
    if failed > 0:
        print("\nFailed files:")
        for result in results:
            if result.status == 'error':
                print(f"  {result.source_file}: {result.error_message}")

if __name__ == "__main__":
    main() 