# CPL Master CSV 取込仕様

> **配置**: 本ファイルが正本。取込スクリプトは `scripts/cpl_exam/import_cpl_master_csv.py`。

## DB確認結果（Supabase MCP）

- `unified_cpl_questions`: 451件、verified 427件
- UNIQUE制約 `(main_subject, sub_subject, question_text, correct_answer)` は**未設定**（既存重複あり）
- `v_mapped_questions`: `learning_test_mapping` JOIN `unified_cpl_questions` のビュー
- `main_subject` CHECK: 航空工学, 航空気象, 空中航法, 航空通信, 航空法規
- `correct_answer`: 1-4
- `verification_status`: pending, verified, needs_review, duplicate, rejected

## CSV列マッピング

| CSV列 | DB列 | 変換 |
|-------|------|------|
| No | source_documents | 201705_AD_001 → year=2017, month=5, subject_code=AD, question_no=1 |
| 問題文 | question_text | 正規化（空白・改行統一） |
| 選択肢1-4 | options | JSON配列 `["A","B","C","D"]` |
| 正解No | correct_answer | 1-4 そのまま |
| 解説 | explanation | そのまま |
| 大分類 | main_subject | 下記マッピング |
| 中・小分類 | sub_subject | そのまま（スラッシュ区切り可） |
| 重要語句 | tags | `["重要語句"]` または detailed_topic |
| 重要度 | importance_score | S=10, A=8, B=6, C=4 |
| タイプ | tags | 理論/計算/暗記 を tags に追加 |

## 大分類 → main_subject マッピング

| CSV 大分類 | main_subject |
|------------|--------------|
| 航空力学, 航空機構造, 航空機の構造, 性能と耐空性, エア・データー表示計器, ピストン・エンジン, 油圧系統, 着氷, 重量・重心, 燃料供給系統, 着陸装置, 無線通信(計器系) | 航空工学 |
| 大気の物理, 大気の力学, 気象観測, 気象現象, 気象予報 | 航空気象 |
| 航法, 航法計画書, 緊急操作, 人間工学・CRM, 安全管理 | 空中航法 |
| 管制業務, 航空交通業務, 無線通信(管制系) | 航空通信 |
| 航空法及び航空法施行規則, 国際条約 | 航空法規 |

## 科目コード（ファイル名）→ main_subject

| コード | main_subject |
|--------|--------------|
| AD | 航空工学 |
| CM | 航空通信 |
| NV | 空中航法 |
| RG | 航空法規 |
| WX | 航空気象 |

## 重複排除

1. CSV内: 正規化キー `(main_subject, sub_subject, normalize(question_text), correct_answer)` で重複除去
2. DB既存: 投入前に `SELECT` で存在チェック、または upsert 相当でスキップ
3. 正規化: 全角空白→半角、連続空白→単一、改行→スペース、前後trim

## 実行方法

```bash
# 前提: .env.local に VITE_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定
# SUPABASE_SERVICE_ROLE_KEY: Supabase Dashboard > Project Settings > API > service_role (secret)

# dry-run（投入しない）
python scripts/cpl_exam/import_cpl_master_csv.py --dry-run
# または: npm run cpl:import:dry

# 検証用JSON出力（先頭5件をファイルに出力）
python scripts/cpl_exam/import_cpl_master_csv.py --dry-run --output-validation scripts/cpl_exam/csv_import_validation_sample.json --files AD --limit 5

# SQLファイル出力（Supabase SQL Editor等で実行可能、UNIQUE制約未適用のためON CONFLICTなし）
python scripts/cpl_exam/import_cpl_master_csv.py --dry-run --output-sql scripts/cpl_exam/cpl_csv_import_full.sql

# 1科目・10件のみ先行投入
python scripts/cpl_exam/import_cpl_master_csv.py --files AD --limit 10

# 全件投入
python scripts/cpl_exam/import_cpl_master_csv.py
# または: npm run cpl:import
```

## dry-run 結果（全5件）

| 科目 | 読込 | 正規化後 | 新規投入予定 |
|------|------|----------|--------------|
| AD | 780 | 318 | 318 |
| CM | 779 | 266 | 266 |
| NV | 780 | 549 | 549 |
| RG | 780 | 402 | 402 |
| WX | 780 | 392 | 392 |
| **合計** | | | **1927** |

CSV内重複除外: 1972件

## 取込後の確認

1. **件数確認**: Supabase Dashboard または `SELECT COUNT(*) FROM unified_cpl_questions WHERE verification_status='verified'`
2. **出題確認**: `/test` ページで科目・サブ科目が増えているか、問題が表示されるか確認
3. **重複確認**: `SELECT main_subject, sub_subject, question_text, correct_answer, COUNT(*) FROM unified_cpl_questions GROUP BY 1,2,3,4 HAVING COUNT(*) > 1` で重複を検出
