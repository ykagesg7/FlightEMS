# Scripts フォルダ - 自動化スクリプト集

このディレクトリには、プロジェクトの各種自動化処理スクリプトが含まれています。

## 📁 フォルダ構成

### 🚁 **ウェイポイント管理** (航空データ処理)
航空ナビゲーションで使用するウェイポイントデータの管理・変換スクリプト

#### 🔄 マージ・統合
- `mergeWaypoints.cjs` - 個別ウェイポイントファイルを`Waypoints.json`に統合
- `mergeWaypoints.js` - 同上（JavaScript版）

#### 📐 座標変換・正規化
- `convertCoordinates.cjs` - 度分秒 → 10進数座標変換
- `normalizeCoordinates.cjs` - 座標の小数点以下4桁統一

#### ➕ ウェイポイント追加
- `addWaypoints.cjs` - waypoints_A.json更新
- `addWaypointB.cjs` - waypoints_B.json更新
- `addWaypointsO.cjs` - waypoints_O.json更新

#### 📊 ソート・整理
- `sortWaypoints.cjs` - 基本ソート機能
- `sortWaypointsB.cjs` - waypoints_B.jsonアルファベットソート
- `sortWaypointsC.cjs` - waypoints_C.jsonアルファベットソート
- `sortWaypointsO.cjs` - waypoints_O.jsonアルファベットソート

#### 🔧 データ修正
- `updateName1.cjs` - ウェイポイント名称修正（例: オオムタ→オームタ）
- `checkWaypoint.cjs` - ウェイポイントデータ検証

### ✈️ **CPL試験データ処理** (事業用操縦士試験)
事業用操縦士学科試験の過去問データベース構築・分析

#### 📄 PDF変換・処理
- `convert_cpl_exam.py` - CPL試験PDF → 構造化データ変換
- `convert_new_pdfs_to_unified.py` - 新規PDF処理・統合
- `process_all_cpl_pdfs.py` - 一括PDF処理
- `batch_import_new_pdfs.py` - PDF一括インポート

#### 🗄️ データベース処理
- `bulk_import_exam_data.py` - 試験データ一括インポート
- `execute_bulk_insertion.py` - バルクSQL実行
- `phase4_automated_insertion.py` - 自動化INSERT処理
- `import_exam_data.py` - 試験データインポート
- `import_real_exam_data.py` - 実試験データ処理

#### 📊 分析・レポート
- `analyze_cpl_exam_trends.py` - CPL試験トレンド分析（16KB, 383行）
- `analyze_exam_trends.py` - 汎用試験分析（21KB）
- `generate_analysis_report.py` - 分析レポート生成（12KB）

#### 🧪 テスト・検証
- `test_db_import.py` - DB処理テスト
- `test_real_pdf_conversion.py` - PDF変換テスト
- `simple_pdf_test.py` - 簡易PDF処理テスト

### 📝 **MarkItDown処理** (ドキュメント変換)
PDF・Word等 → Markdown自動変換システム
- `markitdown_basic_mcp.py` - 基本MCP変換（5.7KB）
- `markitdown_simple_mcp.py` - 簡易MCP変換（5.2KB）

### ⚙️ **SQL実行ファイル** (データベース)

#### CPL試験データ (2022-2025年分)
```
batch_insert_*CPLTest.sql    - 月別CPL試験データ (23ファイル)
unified_insert_*CPLTest.sql  - 統合CPL試験データ (12ファイル)
```

#### システム設定
- `unified_cpl_schema_migration.sql` - CPLスキーマ移行（21KB）
- `real_supabase_batch_insert.sql` - Supabase一括処理
- `batch_insert_学科試験出題範囲（事業用）.sql` - 出題範囲データ（85KB）
- `create_exam_analysis_tables.sql` - 分析テーブル作成
- `migrate_exam_data.sql` - データ移行処理

### 🎯 **その他ユーティリティ**
- `calcAirspeeds.js` - 航空速度計算（7.5KB）
- `reset-article-stats.js` - 記事統計リセット（4.0KB）

---

## 🚀 **使用方法**

### ✈️ ウェイポイント処理フロー
```bash
# 1. 新しいウェイポイント追加
node scripts/addWaypoints.cjs

# 2. ソート実行
node scripts/sortWaypointsB.cjs

# 3. 統合ファイル更新
node scripts/mergeWaypoints.cjs

# 4. 地域分割実行
node public/geojson/split-waypoints-regions.mjs
```

### 📊 CPL試験データ処理
```bash
# PDF → データベース一括処理
python scripts/process_all_cpl_pdfs.py

# トレンド分析実行
python scripts/analyze_cpl_exam_trends.py

# レポート生成
python scripts/generate_analysis_report.py
```

### 📄 MarkItDown変換
```bash
# 基本PDF変換
python scripts/markitdown_basic_mcp.py [PDF_PATH]

# 簡易変換
python scripts/markitdown_simple_mcp.py [FILE_PATH]
```

---

## 📊 **統計情報**
- **総ファイル数**: 70個
- **総サイズ**: 10.0MB
- **SQL処理データ**: CPL試験35ファイル（約8MB）
- **Python処理**: 17スクリプト（約1.5MB）
- **JavaScript処理**: 17スクリプト（約0.5MB）

---

## ⚠️ **注意事項**
- **CPL試験SQLファイル**: `phase4_automated_insertion.py`で参照中のため削除禁止
- **座標変換**: 航空精度（小数点以下4桁）を維持すること
- **バックアップ**: 大量データ処理前は必ずバックアップを取ること

---

**📅 最終更新**: 2025年1月21日
**📋 管理者**: FlightAcademy開発チーム
