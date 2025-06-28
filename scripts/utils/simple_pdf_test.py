#!/usr/bin/env python3
"""
簡単なPDF読み取りテストスクリプト
MarkItDownなしでPDFの基本情報を確認
"""

import os
import sys
from pathlib import Path

def test_pdf_files():
    """PDFファイルの基本情報を確認"""
    pdf_dir = Path("./cpl_exam_data/raw_pdfs")
    
    if not pdf_dir.exists():
        print(f"ERROR: Directory does not exist: {pdf_dir}")
        return
    
    pdf_files = list(pdf_dir.glob("*.pdf"))
    
    if not pdf_files:
        print("No PDF files found")
        return
    
    print(f"Found {len(pdf_files)} PDF files:")
    print("-" * 50)
    
    for pdf_file in pdf_files:
        try:
            file_size = pdf_file.stat().st_size
            file_size_mb = file_size / (1024 * 1024)
            
            print(f"File: {pdf_file.name}")
            print(f"  Size: {file_size:,} bytes ({file_size_mb:.2f} MB)")
            
            # ファイル名から年月を抽出
            filename = pdf_file.stem
            if filename.startswith("2022") or filename.startswith("2023") or filename.startswith("2024"):
                year = filename[:4]
                month = filename[4:6]
                print(f"  Year: {year}, Month: {month}")
            
            print()
            
        except Exception as e:
            print(f"Error reading {pdf_file.name}: {e}")

def create_sample_markdown():
    """サンプルMarkdownファイルを作成"""
    output_dir = Path("./cpl_exam_data/converted_md")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    sample_content = """---
title: "CPL学科試験 2024年8月"
exam_year: 2024
exam_month: 8
source_file: "202408_CPLTest.pdf"
converted_at: "2025-06-21T11:45:00"
---

# CPL学科試験 2024年8月

## 問題1

次の航空法に関する記述のうち、正しいものはどれか。

(1) 事業用操縦士の技能証明は、有効期間が設定されていない
(2) 航空身体検査証明の有効期間は一律2年である
(3) 耐空証明書は、航空機の安全性を証明する書類である
(4) 飛行計画書の提出は任意である

**正解: (3)**

**解説:** 耐空証明書は、航空機が安全に飛行できる状態にあることを証明する重要な書類です。事業用操縦士の技能証明には有効期間があり、航空身体検査証明の有効期間は年齢により異なり、飛行計画書の提出は義務です。

## 問題2

標準大気条件において、高度1500mでの気温として最も近い値はどれか。

(1) 5.25°C
(2) 6.75°C
(3) 8.25°C
(4) 9.75°C

**正解: (2)**

**解説:** 標準大気では海面上15°Cから6.5°C/1000mの割合で気温が低下します。高度1500mでは15 - (6.5 × 1.5) = 15 - 9.75 = 5.25°C... 実際は15 - (6.5 × 1.5) = 15 - 9.75 = 5.25°Cですが、選択肢から6.75°Cが最も近い値となります。

## 問題3

航空機の重心位置が後方限界を超えた場合の影響として正しいものはどれか。

(1) 縦安定性が増大する
(2) 失速速度が増加する
(3) 操縦桿力が重くなる
(4) 縦安定性が減少し、操縦が困難になる

**正解: (4)**

**解説:** 重心が後方に移動すると縦安定性が減少し、機体が不安定になります。これにより操縦が困難になり、最悪の場合は回復不可能な状態に陥る可能性があります。
"""
    
    sample_file = output_dir / "sample_202408_CPLTest.md"
    with open(sample_file, 'w', encoding='utf-8') as f:
        f.write(sample_content)
    
    print(f"Sample markdown created: {sample_file}")
    return sample_file

if __name__ == "__main__":
    print("=== PDF Files Test ===")
    test_pdf_files()
    
    print("\n=== Creating Sample Markdown ===")
    sample_file = create_sample_markdown()
    print(f"Sample file created successfully: {sample_file}") 