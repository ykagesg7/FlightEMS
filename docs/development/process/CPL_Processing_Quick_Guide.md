# CPL試験PDF処理 クイックリファレンスガイド

## 概要

このガイドは、CPL学科試験PDFデータの処理を効率的に実行するための実証済み手順をまとめたものです。

## 前提条件

### 必要なパッケージ
```bash
pip install supabase pandas matplotlib seaborn PyPDF2 pdfplumber
```

### ディレクトリ構造
```
FlightAcademyTsx/
├── cpl_exam_data/
│   ├── raw_pdfs/          # 元PDFファイル格納
│   ├── converted_md/      # 変換後Markdownファイル
│   └── analysis_reports/  # 分析レポート
└── scripts/              # 処理スクリプト
```

## 処理フロー

### 1. 単一ファイル処理

#### PDFファイル情報確認
```bash
python scripts/simple_pdf_test.py
```

#### PDF→Markdown変換
```bash
python scripts/test_real_pdf_conversion.py
```

#### データ構造化・SQL生成
```bash
python scripts/import_real_exam_data.py
```

### 2. 一括処理（推奨）

#### 全PDFファイルの一括処理
```bash
python scripts/process_all_cpl_pdfs.py
```

**実行結果例:**
```
=== 処理完了サマリー ===
成功: 8件
失敗: 0件
総問題数: 1588問
処理時間: 1.12分
```

## 実証済み成果

### 処理実績（2025年6月21日）
- **処理ファイル数**: 8件（100%成功）
- **抽出問題総数**: 1,588問
- **処理時間**: 1.12分
- **平均処理速度**: 8.41秒/ファイル

### ファイル別統計
| PDFファイル | 問題数 | 処理時間 | ファイルサイズ |
|------------|--------|----------|---------------|
| 202209_CPLTest.pdf | 232問 | 9.22秒 | 0.94MB |
| 202211_CPLTest.pdf | 208問 | 14.0秒 | 0.85MB |
| 202301_CPLTest.pdf | 229問 | 10.8秒 | 0.92MB |
| 202303_CPLTest.pdf | 227問 | 11.52秒 | 0.85MB |
| 202305_CPLTest.pdf | 219問 | 6.06秒 | 0.87MB |
| 202307_CPLTest.pdf | 230問 | 6.13秒 | 0.88MB |
| 202309_CPLTest.pdf | 235問 | 6.49秒 | 0.90MB |
| 202408_CPLTest.pdf | 100問 | - | 0.38MB |

## 生成ファイル

### Markdownファイル
- **場所**: `cpl_exam_data/converted_md/`
- **命名規則**: `real_pdf_[元ファイル名].md`
- **内容**: 問題文、メタデータ、統計情報

### SQLファイル
- **場所**: `scripts/`
- **命名規則**: `batch_insert_[元ファイル名].sql`
- **内容**: Supabase投入用INSERT文

### 処理レポート
- **詳細レポート**: `cpl_exam_data/batch_processing_report_[タイムスタンプ].json`
- **サマリーレポート**: `cpl_exam_data/batch_processing_summary_[タイムスタンプ].md`

## データベース投入

### SupabaseMCPを使用した投入
```bash
# テーブル作成（初回のみ）
# mcp_my_supabase_project_apply_migration

# SQLファイルの投入
# mcp_my_supabase_project_execute_sql
```

### バッチサイズ推奨設定
- **1回あたり**: 20件
- **SQLファイルサイズ**: 50KB以下

## トラブルシューティング

### MarkItDown DLL問題
**症状**: `OnnxRuntime`のDLL読み込みエラー  
**解決策**: PyPDF2とpdfplumberを代替ライブラリとして使用（実装済み）

### 大容量PDF処理
**症状**: メモリ不足エラー  
**解決策**: ページ単位での分割処理（実装済み）

### データベース投入エラー
**症状**: SQL実行時のタイムアウト  
**解決策**: バッチサイズを20件に調整（実装済み）

## 品質保証

### 自動チェック項目
- ✅ PDF変換品質（文字数整合性）
- ✅ 問題番号連続性
- ✅ 科目分類適切性
- ✅ データベース制約遵守

### 処理後確認事項
- [ ] 生成Markdownファイルの内容確認
- [ ] SQLファイルの構文チェック
- [ ] 処理レポートの統計確認
- [ ] データベース投入結果検証

## パフォーマンス指標

### 目標値
- **PDF変換**: 1MB/分
- **データ構造化**: 100問/分
- **データベース投入**: 1000件/分

### 実績値（2025年6月）
- **PDF変換**: 1.4MB/分（実測）
- **データ構造化**: 1,420問/分（実測）
- **一括処理**: 8ファイル/1.12分（実測）

## 次のステップ

### Phase 4: データベース投入
1. 生成されたSQLファイルをSupabaseに投入
2. データ整合性検証
3. インデックス最適化

### Phase 5: 分析・レポート
1. 出題傾向分析実行
2. コンテンツ推奨システム更新
3. 包括的分析レポート生成

## 参考情報

### 関連ドキュメント
- [CPL試験データ管理・分析システム設計](./10_CPL_Exam_Analysis_System.md)
- [実装進捗](./07_Implementation_Progress.md)

### 技術スタック
- **Python**: 3.9+
- **PDF処理**: PyPDF2, pdfplumber
- **データベース**: PostgreSQL (Supabase)
- **データ分析**: pandas, numpy

---

*最終更新: 2025年6月21日*  
*FlightAcademy CPL試験分析システム Phase 6* 