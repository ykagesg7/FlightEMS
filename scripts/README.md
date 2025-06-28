# Scripts Directory

FlightAcademyTsxプロジェクトの各種処理スクリプトを機能別に整理しています。

## 📁 ディレクトリ構造

### 📊 cpl_exam/
事業用操縦士（CPL）試験関連の処理スクリプト
- `analyze_cpl_exam_trends.py` - CPL試験傾向分析
- `process_all_cpl_pdfs.py` - PDF一括処理
- `convert_cpl_exam.py` - 試験データ変換
- `import_exam_data.py` - 試験データインポート
- `import_real_exam_data.py` - 実試験データインポート
- `bulk_import_exam_data.py` - 一括インポート
- `batch_import_new_pdfs.py` - PDF一括インポート
- `test_real_pdf_conversion.py` - PDF変換テスト
- `generate_analysis_report.py` - 分析レポート生成
- `create_exam_analysis_tables.sql` - 分析テーブル作成
- `real_exam_data_insert.sql` - 実試験データ挿入
- `migrate_exam_data.sql` - 試験データマイグレーション
- `batch_insert_学科試験出題範囲（事業用）.sql` - 学科試験データ挿入

### 🗺️ waypoints/
航空ナビゲーション地点（Waypoint）処理スクリプト
- `addWaypoints.cjs` - Waypoint追加
- `addWaypointB.cjs` - Waypoint B系統追加
- `addWaypointsO.cjs` - Waypoint O系統追加
- `sortWaypoints.cjs` - Waypoint並び替え
- `sortWaypointsB.cjs` - Waypoint B系統並び替え
- `sortWaypointsC.cjs` - Waypoint C系統並び替え
- `sortWaypointsO.cjs` - Waypoint O系統並び替え
- `mergeWaypoints.cjs` - Waypoint統合（CommonJS）
- `mergeWaypoints.js` - Waypoint統合（ES Module）
- `normalizeCoordinates.cjs` - 座標正規化
- `convertCoordinates.cjs` - 座標変換
- `checkWaypoint.cjs` - Waypoint検証

### 🗄️ database/
データベース関連処理スクリプト
- `unified_cpl_schema_migration.sql` - 統合CPLスキーママイグレーション
- `real_supabase_batch_insert.sql` - Supabase一括挿入
- `reset-article-stats.js` - 記事統計リセット

### 📝 markdown/
マークダウン文書処理スクリプト
- `markitdown_simple_mcp.py` - シンプルマークダウン処理

### 🔧 utils/
汎用ユーティリティスクリプト
- `calcAirspeeds.js` - 航空速度計算
- `updateName1.cjs` - 名前更新処理
- `execute_bulk_insertion.py` - 一括挿入実行
- `phase4_automated_insertion.py` - Phase4自動挿入
- `test_db_import.py` - データベースインポートテスト
- `simple_pdf_test.py` - シンプルPDFテスト

## 🚀 使用方法

各ディレクトリ内のスクリプトは、それぞれの機能に特化した処理を行います。
実行前に適切なPython環境（`.venv`）をアクティブ化し、必要な依存関係をインストールしてください。

```bash
# Python環境のアクティブ化
.venv\Scripts\activate

# CPL試験データ処理例
python scripts/cpl_exam/analyze_cpl_exam_trends.py

# Waypoint処理例
node scripts/waypoints/addWaypoints.cjs

# データベース処理例
node scripts/database/reset-article-stats.js
```

## 📋 注意事項

- スクリプト実行前に必要な環境変数が設定されていることを確認
- データベース関連スクリプトは本番環境での実行に注意
- 大量データ処理時はリソース使用量に注意

---

## 📊 **統計情報**
- **総ファイル数**: 70個
- **総サイズ**: 10.0MB
- **SQL処理データ**: CPL試験35ファイル（約8MB）
- **Python処理**: 17スクリプト（約1.5MB）
- **JavaScript処理**: 17スクリプト（約0.5MB）

---

**📅 最終更新**: 2025年1月21日
**📋 管理者**: FlightAcademy開発チーム
