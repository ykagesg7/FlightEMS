# 10_CPL_Exam_Analysis_System.md

# CPL学科試験データ管理・分析システム設計

## 概要

このドキュメントは、CPL（事業用操縦士）学科試験のPDFデータをマークダウンに変換し、出題傾向を分析して記事作成に反映させるシステムの設計と実装プロセスを記載しています。

## プロジェクト情報

- **作成日**: 2025年6月21日
- **システム名**: CPL試験データ管理・分析システム
- **対象**: CPL学科試験過去問・出題傾向分析
- **Phase**: Phase 2拡張（Learning-Test連携機能）

## システム目的

### 1. データ管理の効率化
- 散在するPDF形式試験データの統一管理
- 検索可能なマークダウン形式への変換
- バージョン管理による品質保証

### 2. 出題傾向の定量分析
- 科目別・分野別出題頻度の可視化
- 難易度・重要度の客観的評価
- 新規出題パターンの早期検出

### 3. 記事作成戦略の最適化
- データドリブンなコンテンツ優先度決定
- 試験対策効果の最大化
- 学習者の弱点分野への重点対応

## 成功パターン実装ガイド

### 実証済み処理フロー

**Phase 1: PDF変換・構造化**
```
1. PDF情報確認 → 2. PDF→Markdown変換 → 3. 問題抽出・構造化 → 4. データベース投入
```

**Phase 2: 分析・レポート生成**
```
1. 出題傾向分析 → 2. コンテンツ推奨生成 → 3. 包括的レポート作成
```

### 実際の成功事例（202408_CPLTest.pdf）

#### 処理結果サマリー
- **元ファイル**: 202408_CPLTest.pdf (389KB, 34ページ)
- **抽出テキスト**: 24,915文字
- **検出問題数**: 100問
- **生成Markdown**: 32,051文字
- **科目別分布**: 航空工学57問、航空法規17問、航空気象16問、航空通信8問、航空機体・発動機2問
- **難易度分布**: レベル2（標準）71問、レベル3-5（高難易度）29問

### 標準実行手順

#### 1. 前提条件確認
```bash
# 必要なPythonパッケージ
pip install supabase pandas matplotlib seaborn PyPDF2 pdfplumber
```

#### 2. PDF変換実行
```bash
# PDFファイル情報確認
python scripts/simple_pdf_test.py

# PDF→Markdown変換
python scripts/test_real_pdf_conversion.py
```

**実行結果例**:
```
PDFファイル情報:
- ファイルサイズ: 389KB
- ページ数: 34
- 抽出文字数: 24,915

問題検出結果:
- 検出パターン: 101個（重複除去後100問）
- 変換Markdown: cpl_exam_data/converted_md/real_pdf_202408_CPLTest.md (32,051文字)
```

#### 3. データ構造化・投入
```bash
# 問題データ解析・SQL生成
python scripts/import_real_exam_data.py

# バッチ投入用SQL分割
python scripts/bulk_import_exam_data.py
```

**実行結果例**:
```
データ解析完了:
- 総問題数: 100問
- 生成SQL: 66,081文字
- バッチファイル: 5個（各20件）
```

#### 4. Supabaseデータベース投入
```bash
# SupabaseMCPを使用してテーブル作成
# mcp_my_supabase_project_apply_migration

# バッチデータ投入
# mcp_my_supabase_project_execute_sql (各バッチファイル)
```

#### 5. 分析レポート生成
```bash
# 出題傾向分析・レポート生成
python scripts/generate_analysis_report.py
```

**実行結果例**:
```
分析レポート生成完了:
- ファイル: cpl_exam_data/analysis_reports/cpl_analysis_report_20250621_1152.md
- サイズ: 4.7KB (169行)
- 重要度ランキング: 飛行理論(8.8) > 気象(8.2) > 航空法規(7.5)
```

### トラブルシューティング

#### MarkItDown DLL問題
**症状**: `OnnxRuntime`のDLL読み込みエラー
**解決策**: PyPDF2とpdfplumberを代替ライブラリとして使用

```python
# 代替実装例
import PyPDF2
import pdfplumber

def convert_pdf_to_markdown_alternative(pdf_path):
    # PyPDF2での基本テキスト抽出
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
    
    # pdfplumberでの高精度抽出（必要に応じて）
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text()
    
    return text
```

#### 大容量PDF処理
**症状**: メモリ不足エラー
**解決策**: ページ単位での分割処理

```python
def process_large_pdf(pdf_path, batch_size=10):
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        for i in range(0, total_pages, batch_size):
            batch_pages = pdf.pages[i:i+batch_size]
            # バッチ処理実行
```

#### データベース投入エラー
**症状**: SQL実行時のタイムアウト
**解決策**: バッチサイズの調整

```python
# 推奨バッチサイズ
BATCH_SIZE = 20  # 1回あたり20件
MAX_SQL_SIZE = 50000  # 50KB以下のSQL文
```

### 品質保証チェックリスト

#### PDF変換品質
- [ ] 元PDFの文字数と変換後テキストの整合性確認
- [ ] 問題番号の連続性チェック
- [ ] 特殊文字・数式の正確性検証

#### データ構造化品質
- [ ] 科目分類の適切性確認
- [ ] 難易度推定の妥当性検証
- [ ] 重要度スコアの計算精度確認

#### データベース品質
- [ ] 主キー制約・外部キー制約の確認
- [ ] データ型・制約違反のチェック
- [ ] 重複データの排除確認

### パフォーマンス最適化

#### 処理時間目安
- **PDF変換**: 1MB/分
- **データ構造化**: 100問/分
- **データベース投入**: 1000件/分
- **分析レポート生成**: 全データ/5分

#### 最適化ポイント
```python
# 並列処理の活用
from concurrent.futures import ThreadPoolExecutor

def process_multiple_pdfs(pdf_paths):
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = [executor.submit(process_single_pdf, path) for path in pdf_paths]
        results = [future.result() for future in futures]
    return results

# メモリ効率化
def process_with_generator(large_dataset):
    for batch in chunked(large_dataset, 1000):
        yield process_batch(batch)
```

## 成功パターン実装ガイド

### 実証済み処理フロー

**Phase 1: PDF変換・構造化**
```
1. PDF情報確認 → 2. PDF→Markdown変換 → 3. 問題抽出・構造化 → 4. データベース投入
```

**Phase 2: 分析・レポート生成**
```
1. 出題傾向分析 → 2. コンテンツ推奨生成 → 3. 包括的レポート作成
```

### 実際の成功事例（202408_CPLTest.pdf）

#### 処理結果サマリー
- **元ファイル**: 202408_CPLTest.pdf (389KB, 34ページ)
- **抽出テキスト**: 24,915文字
- **検出問題数**: 100問
- **生成Markdown**: 32,051文字
- **科目別分布**: 航空工学57問、航空法規17問、航空気象16問、航空通信8問、航空機体・発動機2問
- **難易度分布**: レベル2（標準）71問、レベル3-5（高難易度）29問

### 標準実行手順

#### 1. 前提条件確認
```bash
# 必要なPythonパッケージ
pip install supabase pandas matplotlib seaborn PyPDF2 pdfplumber
```

#### 2. PDF変換実行
```bash
# PDFファイル情報確認
python scripts/simple_pdf_test.py

# PDF→Markdown変換
python scripts/test_real_pdf_conversion.py
```

**実行結果例**:
```
PDFファイル情報:
- ファイルサイズ: 389KB
- ページ数: 34
- 抽出文字数: 24,915

問題検出結果:
- 検出パターン: 101個（重複除去後100問）
- 変換Markdown: cpl_exam_data/converted_md/real_pdf_202408_CPLTest.md (32,051文字)
```

#### 3. データ構造化・投入
```bash
# 問題データ解析・SQL生成
python scripts/import_real_exam_data.py

# バッチ投入用SQL分割
python scripts/bulk_import_exam_data.py
```

**実行結果例**:
```
データ解析完了:
- 総問題数: 100問
- 生成SQL: 66,081文字
- バッチファイル: 5個（各20件）
```

#### 4. Supabaseデータベース投入
```bash
# SupabaseMCPを使用してテーブル作成
# mcp_my_supabase_project_apply_migration

# バッチデータ投入
# mcp_my_supabase_project_execute_sql (各バッチファイル)
```

#### 5. 分析レポート生成
```bash
# 出題傾向分析・レポート生成
python scripts/generate_analysis_report.py
```

**実行結果例**:
```
分析レポート生成完了:
- ファイル: cpl_exam_data/analysis_reports/cpl_analysis_report_20250621_1152.md
- サイズ: 4.7KB (169行)
- 重要度ランキング: 飛行理論(8.8) > 気象(8.2) > 航空法規(7.5)
```

### トラブルシューティング

#### MarkItDown DLL問題
**症状**: `OnnxRuntime`のDLL読み込みエラー
**解決策**: PyPDF2とpdfplumberを代替ライブラリとして使用

```python
# 代替実装例
import PyPDF2
import pdfplumber

def convert_pdf_to_markdown_alternative(pdf_path):
    # PyPDF2での基本テキスト抽出
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
    
    # pdfplumberでの高精度抽出（必要に応じて）
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text()
    
    return text
```

#### 大容量PDF処理
**症状**: メモリ不足エラー
**解決策**: ページ単位での分割処理

```python
def process_large_pdf(pdf_path, batch_size=10):
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        for i in range(0, total_pages, batch_size):
            batch_pages = pdf.pages[i:i+batch_size]
            # バッチ処理実行
```

#### データベース投入エラー
**症状**: SQL実行時のタイムアウト
**解決策**: バッチサイズの調整

```python
# 推奨バッチサイズ
BATCH_SIZE = 20  # 1回あたり20件
MAX_SQL_SIZE = 50000  # 50KB以下のSQL文
```

### 品質保証チェックリスト

#### PDF変換品質
- [ ] 元PDFの文字数と変換後テキストの整合性確認
- [ ] 問題番号の連続性チェック
- [ ] 特殊文字・数式の正確性検証

#### データ構造化品質
- [ ] 科目分類の適切性確認
- [ ] 難易度推定の妥当性検証
- [ ] 重要度スコアの計算精度確認

#### データベース品質
- [ ] 主キー制約・外部キー制約の確認
- [ ] データ型・制約違反のチェック
- [ ] 重複データの排除確認

### パフォーマンス最適化

#### 処理時間目安
- **PDF変換**: 1MB/分
- **データ構造化**: 100問/分
- **データベース投入**: 1000件/分
- **分析レポート生成**: 全データ/5分

#### 最適化ポイント
```python
# 並列処理の活用
from concurrent.futures import ThreadPoolExecutor

def process_multiple_pdfs(pdf_paths):
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = [executor.submit(process_single_pdf, path) for path in pdf_paths]
        results = [future.result() for future in futures]
    return results

# メモリ効率化
def process_with_generator(large_dataset):
    for batch in chunked(large_dataset, 1000):
        yield process_batch(batch)
```

## システム設計

### データフロー全体図

```
[CPL試験PDF] → [PDF変換エンジン] → [問題抽出・構造化] → [品質検証] → [データベース] → [分析エンジン] → [レポート生成]
```

### 主要コンポーネント

#### 1. PDFデータ管理システム
```typescript
interface ExamPdfDocument {
  id: string;
  examYear: number;
  examMonth: number;
  filePath: string;
  fileSize: number;
  checksum: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'error';
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2. MarkDown変換エンジン
```python
class ExamMarkdownConverter:
    def __init__(self):
        self.pdf_processor = PDFProcessor()
        self.quality_checker = ConversionQualityChecker()
    
    def convert_exam_pdf(self, pdf_path: str) -> ConversionResult:
        """CPL試験PDFをマークダウンに変換（実証済みメソッド）"""
        # 1. PDF読み込み・前処理
        pdf_info = self.pdf_processor.get_pdf_info(pdf_path)
        
        # 2. PyPDF2/pdfplumber変換実行
        raw_text = self.pdf_processor.extract_text(pdf_path)
        
        # 3. 品質検証
        quality_score = self.quality_checker.validate(raw_text, pdf_info)
        
        # 4. 構造化データ抽出
        questions = self.extract_questions(raw_text)
        
        return ConversionResult(
            markdown_content=raw_text,
            questions=questions,
            quality_score=quality_score
        )
    
    def extract_questions(self, markdown_content: str) -> List[ExamQuestion]:
        """マークダウンから問題を抽出・構造化（実証済みメソッド）"""
        import re
        
        # 問題番号パターン検出
        pattern = r'例題\s*(\d+)'
        matches = re.findall(pattern, markdown_content)
        
        questions = []
        for i, match in enumerate(matches):
            question = ExamQuestion(
                number=int(match),
                subject_category=self.classify_subject(markdown_content, i),
                difficulty_level=self.estimate_difficulty(markdown_content, i),
                importance_score=self.calculate_importance(markdown_content, i)
            )
            questions.append(question)
        
        return questions
```

#### 3. データベース設計（実装済み）

```sql
-- 試験問題メタデータテーブル（実装済み）
CREATE TABLE exam_questions_metadata (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_year integer NOT NULL,
    exam_month integer NOT NULL,
    question_number integer NOT NULL,
    subject_category varchar(50) NOT NULL, -- 航法、航空法規、気象、機体、通信、空港・管制、航空工学、飛行理論
    sub_category varchar(100),             -- 詳細分野
    difficulty_level integer CHECK (difficulty_level BETWEEN 1 AND 5),
    appearance_frequency integer DEFAULT 0,
    importance_score decimal(5,2),         -- 重要度スコア
    source_document varchar(255),          -- 元PDFファイル名
    markdown_content text NOT NULL,        -- 変換されたMarkdown
    question_text text,                    -- 問題文
    options jsonb,                         -- 選択肢（JSON形式）
    correct_answer integer,                -- 正解番号
    explanation text,                      -- 解説
    tags text[],                          -- タグ配列
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    
    UNIQUE(exam_year, exam_month, question_number)
);

-- 出題傾向分析結果テーブル（実装済み）
CREATE TABLE exam_trend_analysis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_date date NOT NULL,
    subject_category varchar(50) NOT NULL,
    sub_category varchar(100),
    question_count integer,
    avg_difficulty decimal(3,2),
    frequency_trend varchar(20), -- 'increasing', 'stable', 'decreasing'
    importance_rank integer,
    trend_score decimal(5,2),
    analysis_notes text,
    created_at timestamp DEFAULT now()
);

-- 記事作成推奨事項テーブル（実装済み）
CREATE TABLE content_recommendations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_category varchar(50) NOT NULL,
    sub_category varchar(100),
    priority_score integer CHECK (priority_score BETWEEN 1 AND 10),
    recommended_title varchar(255),
    target_question_ids uuid[],
    coverage_gap_percentage decimal(5,2),
    estimated_impact_score decimal(5,2),
    created_at timestamp DEFAULT now(),
    status varchar(20) DEFAULT 'pending' -- 'pending', 'in_progress', 'completed'
);
```

### 4. 分析エンジン設計（実装済み）

```python
class ExamTrendAnalyzer:
    """実証済み分析エンジン"""
    
    def __init__(self, supabase_client):
        self.supabase = supabase_client
    
    def analyze_subject_trends(self) -> List[TrendAnalysis]:
        """科目別出題傾向分析（実装済み）"""
        query = """
        SELECT 
            subject_category,
            COUNT(*) as question_count,
            AVG(difficulty_level) as avg_difficulty,
            AVG(importance_score) as avg_importance,
            RANK() OVER (ORDER BY AVG(importance_score) DESC) as importance_rank
        FROM exam_questions_metadata 
        GROUP BY subject_category
        ORDER BY avg_importance DESC
        """
        
        result = self.supabase.rpc('execute_sql', {'query': query}).execute()
        return self.format_trend_analysis(result.data)
    
    def generate_content_recommendations(self) -> List[ContentRecommendation]:
        """コンテンツ推奨生成（実装済み）"""
        # 高重要度・低カバレッジ分野の特定
        high_priority_subjects = self.identify_high_priority_subjects()
        
        recommendations = []
        for subject in high_priority_subjects:
            rec = ContentRecommendation(
                subject_category=subject['category'],
                priority_score=subject['priority'],
                recommended_title=f"{subject['category']}の重要ポイント解説",
                estimated_impact_score=subject['impact']
            )
            recommendations.append(rec)
        
        return recommendations
```

## 実装プロセス

### Phase 1: データ収集・変換基盤（完了）

#### 1. CPL試験PDFデータ収集（完了）
```bash
# 実装済みディレクトリ構造
/cpl_exam_data/
├── raw_pdfs/
│   ├── 202209_CPLTest.pdf (963KB)
│   ├── 202211_CPLTest.pdf (867KB)
│   ├── 202301_CPLTest.pdf (947KB)
│   ├── 202303_CPLTest.pdf (871KB)
│   ├── 202305_CPLTest.pdf (888KB)
│   ├── 202307_CPLTest.pdf (896KB)
│   ├── 202309_CPLTest.pdf (918KB)
│   ├── 202408_CPLTest.pdf (380KB) ← 処理済み
│   ├── 学科試験出題範囲（事業用）.pdf (221KB)
│   └── sample_cpl_202401.md (1.5KB)
├── converted_md/
│   ├── real_pdf_202408_CPLTest.md (32KB, 100問)
│   └── sample_202408_CPLTest.md (サンプル)
└── analysis_reports/
    └── cpl_analysis_report_20250621_1152.md (4.7KB)
```

#### 2. 実装済みスクリプト一覧

| スクリプト名 | 機能 | 状態 |
|------------|------|------|
| `scripts/simple_pdf_test.py` | PDF情報確認 | ✅ 実装済み |
| `scripts/test_real_pdf_conversion.py` | PDF→Markdown変換 | ✅ 実装済み |
| `scripts/import_real_exam_data.py` | データ構造化・SQL生成 | ✅ 実装済み |
| `scripts/bulk_import_exam_data.py` | バッチ投入用SQL分割 | ✅ 実装済み |
| `scripts/generate_analysis_report.py` | 分析レポート生成 | ✅ 実装済み |

### Phase 2: 分析・レポート機能（完了）

#### 実装済み機能
- ✅ 科目別出題傾向分析
- ✅ 重要度ランキング生成
- ✅ コンテンツ推奨システム
- ✅ 包括的分析レポート出力

### Phase 3: 大規模データ処理（完了）

#### 対象データ（処理完了）
- ✅ 202209_CPLTest.pdf (963KB) - 232問抽出
- ✅ 202211_CPLTest.pdf (867KB) - 208問抽出
- ✅ 202301_CPLTest.pdf (947KB) - 229問抽出
- ✅ 202303_CPLTest.pdf (871KB) - 227問抽出
- ✅ 202305_CPLTest.pdf (888KB) - 219問抽出
- ✅ 202307_CPLTest.pdf (896KB) - 230問抽出
- ✅ 202309_CPLTest.pdf (918KB) - 235問抽出
- ✅ 202408_CPLTest.pdf (380KB) - 100問抽出（先行処理済み）
- ✅ 学科試験出題範囲（事業用）.pdf (221KB) - 8問抽出

#### 一括処理実行結果（2025年6月21日）
- **総処理ファイル数**: 8件（成功率100%）
- **総抽出問題数**: 1,588問
- **総処理時間**: 1.12分
- **平均処理速度**: 8.41秒/ファイル
- **生成Markdownファイル**: 8件（総容量1.3MB）
- **生成SQLファイル**: 8件（総容量2.4MB）

#### 一括処理コマンド
```bash
# 全PDFファイルの一括処理実行
python scripts/process_all_cpl_pdfs.py

# 実行結果例:
# === 処理完了サマリー ===
# 成功: 8件
# 失敗: 0件
# 総問題数: 1588問
# 処理時間: 1.12分
```

#### 処理統計サマリー
| 年月 | ファイル名 | 問題数 | 処理時間 | ファイルサイズ |
|------|-----------|--------|----------|---------------|
| 2022/09 | 202209_CPLTest.pdf | 232問 | 9.22秒 | 0.94MB |
| 2022/11 | 202211_CPLTest.pdf | 208問 | 14.0秒 | 0.85MB |
| 2023/01 | 202301_CPLTest.pdf | 229問 | 10.8秒 | 0.92MB |
| 2023/03 | 202303_CPLTest.pdf | 227問 | 11.52秒 | 0.85MB |
| 2023/05 | 202305_CPLTest.pdf | 219問 | 6.06秒 | 0.87MB |
| 2023/07 | 202307_CPLTest.pdf | 230問 | 6.13秒 | 0.88MB |
| 2023/09 | 202309_CPLTest.pdf | 235問 | 6.49秒 | 0.90MB |
| 2024/08 | 202408_CPLTest.pdf | 100問 | - | 0.38MB |
| - | 学科試験出題範囲.pdf | 8問 | 3.07秒 | 0.22MB |

### Phase 4: データベース投入（次期実装）

#### 投入準備完了
- ✅ 8個のSQLファイル生成完了（総容量2.4MB）
- ✅ 1,588問のデータ構造化完了
- ✅ 科目分類・難易度・重要度スコア算出完了

#### 投入計画
1. **バッチ投入実行**: SupabaseMCPによる順次SQL実行
2. **データ検証**: 投入後の整合性チェック
3. **分析レポート生成**: 全データ対象の出題傾向分析
4. **コンテンツ推奨更新**: 1,588問ベースの記事作成ガイダンス

## 技術仕様

### 開発環境
- **Python**: 3.9+
- **データベース**: PostgreSQL (Supabase)
- **PDF処理**: PyPDF2, pdfplumber
- **データ分析**: pandas, numpy
- **可視化**: matplotlib, seaborn

### 依存関係
```bash
pip install supabase pandas matplotlib seaborn PyPDF2 pdfplumber
```

### セキュリティ設定
- Row Level Security (RLS) 有効
- APIキー管理（環境変数）
- データ暗号化（Supabase標準）

## 成果指標

### 定量指標
- **変換精度**: 95%以上の問題検出率
- **処理速度**: 1MB/分の変換速度
- **データ品質**: 90%以上の分類精度

### 定性指標
- **記事作成効率**: データドリブンな優先度決定
- **学習効果**: 出題傾向に基づく効率的学習
- **システム拡張性**: 新規試験データの容易な追加

## 今後の拡張計画

### Phase 4: AI支援機能
- 自動問題分類の精度向上
- 自然言語処理による解説生成
- 類似問題の自動検出

### Phase 5: 学習者分析
- 個別学習履歴との連携
- 弱点分野の自動特定
- パーソナライズド学習パス生成

### Phase 6: リアルタイム更新
- 新規試験データの自動取得
- 出題傾向の継続的分析
- 予測モデルによる将来出題予測 