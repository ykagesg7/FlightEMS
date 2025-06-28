#!/usr/bin/env python3
"""
実際のCPL試験PDFファイルを使用した変換テスト
202408_CPLTest.pdfからテキスト抽出とMarkdown変換
"""

import os
import re
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any

def test_pdf_readers():
    """異なるPDFリーダーライブラリをテスト"""
    
    pdf_path = Path("./cpl_exam_data/raw_pdfs/202408_CPLTest.pdf")
    
    if not pdf_path.exists():
        print(f"❌ PDF file not found: {pdf_path}")
        return
    
    print(f"🔍 Testing PDF conversion for: {pdf_path.name}")
    print(f"📄 File size: {pdf_path.stat().st_size:,} bytes")
    print("-" * 60)
    
    # Method 1: PyPDF2
    print("\n1️⃣ Testing PyPDF2...")
    try:
        import PyPDF2
        
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            num_pages = len(pdf_reader.pages)
            print(f"   ✅ PyPDF2 success: {num_pages} pages")
            
            # 最初の3ページの内容を抽出
            sample_text = ""
            for i in range(min(3, num_pages)):
                page = pdf_reader.pages[i]
                page_text = page.extract_text()
                sample_text += f"\n--- Page {i+1} ---\n{page_text[:500]}...\n"
            
            print(f"   📝 Sample content (first 3 pages):")
            print(sample_text[:1000] + "..." if len(sample_text) > 1000 else sample_text)
            
    except Exception as e:
        print(f"   ❌ PyPDF2 failed: {e}")
    
    # Method 2: pdfplumber
    print("\n2️⃣ Testing pdfplumber...")
    try:
        import pdfplumber
        
        with pdfplumber.open(pdf_path) as pdf:
            num_pages = len(pdf.pages)
            print(f"   ✅ pdfplumber success: {num_pages} pages")
            
            # 最初の3ページの内容を抽出
            sample_text = ""
            for i in range(min(3, num_pages)):
                page = pdf.pages[i]
                page_text = page.extract_text()
                if page_text:
                    sample_text += f"\n--- Page {i+1} ---\n{page_text[:500]}...\n"
            
            print(f"   📝 Sample content (first 3 pages):")
            print(sample_text[:1000] + "..." if len(sample_text) > 1000 else sample_text)
            
    except Exception as e:
        print(f"   ❌ pdfplumber failed: {e}")

def extract_questions_from_text(text: str) -> List[Dict[str, Any]]:
    """抽出されたテキストから試験問題を構造化"""
    
    questions = []
    debug_matches = []
    
    # 問題番号のパターンを検索（実際のPDFフォーマットに対応）
    question_patterns = [
        r'例題\s*(\d+)',  # 「例題１」「例題２」パターン
        r'問題?\s*(\d+)',
        r'第\s*(\d+)\s*問',
        r'(\d+)\s*[.．]\s*',
        r'Q\s*(\d+)',
    ]
    
    # 選択肢のパターン
    choice_patterns = [
        r'\(\s*(\d+)\s*\)\s*([^\n]+)',
        r'(\d+)\s*[.．]\s*([^\n]+)',
        r'[①②③④]\s*([^\n]+)',
    ]
    
    lines = text.split('\n')
    current_question = None
    current_content = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # 問題番号を検出
        for pattern in question_patterns:
            match = re.search(pattern, line)
            if match:
                debug_matches.append(f"Pattern '{pattern}' matched: '{line}'")
                
                # 前の問題を保存
                if current_question and current_content:
                    questions.append({
                        'number': current_question,
                        'content': '\n'.join(current_content),
                        'raw_text': '\n'.join(current_content)
                    })
                
                current_question = int(match.group(1))
                current_content = [line]
                break
        else:
            if current_question:
                current_content.append(line)
    
    # 最後の問題を保存
    if current_question and current_content:
        questions.append({
            'number': current_question,
            'content': '\n'.join(current_content),
            'raw_text': '\n'.join(current_content)
        })
    
    # デバッグ情報を出力
    print(f"🔍 Pattern matches found: {len(debug_matches)}")
    for match_info in debug_matches[:5]:  # 最初の5件のマッチを表示
        print(f"   {match_info}")
    if len(debug_matches) > 5:
        print(f"   ... and {len(debug_matches) - 5} more matches")
    
    return questions

def convert_to_markdown(questions: List[Dict[str, Any]], source_file: str) -> str:
    """問題リストをMarkdown形式に変換"""
    
    markdown_content = f"""---
title: "CPL学科試験 2024年8月 (実際のPDF変換)"
exam_year: 2024
exam_month: 8
source_file: "{source_file}"
converted_at: "{datetime.now().isoformat()}"
extraction_method: "PyPDF2/pdfplumber"
total_questions: {len(questions)}
---

# CPL学科試験 2024年8月 (実際のPDF変換)

**変換元:** {source_file}  
**変換日時:** {datetime.now().strftime('%Y年%m月%d日 %H:%M')}  
**抽出問題数:** {len(questions)}問  
**変換方法:** PyPDF2/pdfplumber による自動抽出

## 抽出された問題

"""

    for i, question in enumerate(questions, 1):
        markdown_content += f"""
### 問題{question['number']}

```
{question['content']}
```

**分析情報:**
- 問題番号: {question['number']}
- 抽出順序: {i}
- 文字数: {len(question['content'])}

---
"""

    markdown_content += f"""

## 変換統計

- **総問題数:** {len(questions)}問
- **平均文字数:** {sum(len(q['content']) for q in questions) / len(questions) if questions else 0:.0f}文字
- **最長問題:** {max((len(q['content']) for q in questions), default=0)}文字
- **最短問題:** {min((len(q['content']) for q in questions), default=0)}文字

## 技術情報

**使用ライブラリ:** PyPDF2, pdfplumber  
**抽出アルゴリズム:** 正規表現ベースの問題番号検出  
**後処理:** テキスト正規化・構造化  

---

*このファイルは FlightAcademy CPL試験分析システム Phase 6 により自動生成されました。*  
*生成日時: {datetime.now().strftime('%Y年%m月%d日 %H:%M:%S')}*
"""

    return markdown_content

def main():
    """メイン実行関数"""
    
    print("🚀 CPL試験PDF変換テスト開始")
    print("=" * 60)
    
    # PDFリーダーテスト
    test_pdf_readers()
    
    print("\n" + "=" * 60)
    print("📝 実際の変換処理を実行中...")
    
    # 実際の変換処理
    pdf_path = Path("./cpl_exam_data/raw_pdfs/202408_CPLTest.pdf")
    
    if not pdf_path.exists():
        print(f"❌ PDF file not found: {pdf_path}")
        return
    
    try:
        # pdfplumberを使用してテキスト抽出
        import pdfplumber
        
        full_text = ""
        with pdfplumber.open(pdf_path) as pdf:
            print(f"📄 Processing {len(pdf.pages)} pages...")
            
            for i, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                if page_text:
                    full_text += f"\n=== Page {i+1} ===\n{page_text}\n"
                
                if i < 5:  # 最初の5ページをサンプル表示
                    print(f"   Page {i+1}: {len(page_text) if page_text else 0} characters")
        
        print(f"✅ Text extraction complete: {len(full_text):,} characters")
        
        # デバッグ: 抽出されたテキストの最初の2000文字を表示
        print(f"\n📄 Sample extracted text (first 2000 chars):")
        print("-" * 40)
        print(full_text[:2000])
        print("-" * 40)
        
        # 問題を抽出
        questions = extract_questions_from_text(full_text)
        print(f"🔍 Extracted {len(questions)} questions")
        
        # Markdownに変換
        markdown_content = convert_to_markdown(questions, pdf_path.name)
        
        # ファイルに保存
        output_dir = Path("./cpl_exam_data/converted_md")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        output_file = output_dir / f"real_pdf_{pdf_path.stem}.md"
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        print(f"💾 Markdown saved: {output_file}")
        print(f"📊 File size: {len(markdown_content):,} characters")
        
        # 最初の問題をサンプル表示
        if questions:
            print(f"\n📋 Sample question (Question {questions[0]['number']}):")
            print("-" * 40)
            print(questions[0]['content'][:300] + "..." if len(questions[0]['content']) > 300 else questions[0]['content'])
        
    except Exception as e:
        print(f"❌ Conversion failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 