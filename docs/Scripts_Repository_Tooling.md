# スクリプト・リポジトリツール（正本）

> **集約**（2026-04）: 旧 `docs/scripts/*.md` の内容を本ファイルに統合。スクリプトの実体は引き続き `scripts/` 配下。

| トピック | 節 |
|----------|-----|
| Git コミット（英語・Windows 文字化け補足） | [下記](#git-コミットメッセージの文字化け対策windows-補足) |
| **Supabase / database SQL** | [Indexing](#supabase-database-sql-scripts) と [scripts/database/INDEX.md](../../scripts/database/INDEX.md) |
| ドキュメント自動更新 | [下記](#ドキュメント自動更新システム) |
| MDX → Obsidian ミラー | [下記](#mdx--obsidian-参照ミラー) |
| CPL Master CSV 取込 | [下記](#cpl-master-csv-取込仕様)（旧 `CPL_CSV_IMPORT_SPEC`） |
| GA4 MCP・OAuth / ADC（ローカル例） | [下記](#ga4-mcp-oauth--adcローカル例) |
| 週次テレメトリ GA4（ISO 週・CI） | [下記](#週次テレメトリ-ga4iso-週github-actions) |
| 規約ファイル | [.cursor/skills/git-commit-en/SKILL.md](../.cursor/skills/git-commit-en/SKILL.md)（ポインタ: [.cursor/rules/git-conventions.mdc](../.cursor/rules/git-conventions.mdc)） |
| Phase 別テスト計画（参考） | [Phase_Testing_Plan.md](Phase_Testing_Plan.md) |

ルートの npm: `npm run cpl:import`、`npm run docs:update`、`npm run sync:public-docs` 等。

**ディレクトリ索引（実装）**: `scripts/README.md`（短いポインタ） → 本ドキュメント。**補足**: `scripts/` 直下に単発ツールが混在する現状と、`scripts/repo/`／`scripts/dev/` 等へのグルーピング案は運用変更チャーンがあるため、[FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)・[AGENTS.md](../AGENTS.md) と同趣旨で **任意の後付けリファクタ**として検討（未実施）。

---

## Git コミットメッセージの文字化け対策（Windows 補足）

本リポジトリでは **コミットメッセージは英語のみ**（[.cursor/skills/git-commit-en/SKILL.md](../.cursor/skills/git-commit-en/SKILL.md)）を推奨し、PowerShell の文字化けを避けます。

日本語をどうしても使う場合の UTF-8 設定・`git-commit-utf8.ps1` の使い方などは、従来 `scripts/README-git-commit.md` にあった内容を以下に要約します。

### Git 設定（任意）

```powershell
git config --global core.quotepath false
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
```

### PowerShell（任意）

```powershell
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001
```

### スクリプト

`scripts/git-commit-utf8.ps1` で UTF-8 コミットが可能（詳細はスクリプト内コメント参照）。

---

## ドキュメント自動更新システム

**実装ディレクトリ**: `scripts/docs-auto-update/`（`package.json` は当該サブパッケージ内）

### ルートからのコマンド

```bash
npm run docs:watch    # scripts/docs-auto-update で watch
npm run docs:update   # 手動更新
npm run docs:validate # 品質チェック
npm run docs:setup    # npm install + setup-git-hooks
```

### 初回セットアップ（Git Hooks）

```bash
cd scripts/docs-auto-update
npm install
node setup-git-hooks.js
```

### 監視・更新の詳細

- **監視対象**: `src/**/*.{ts,tsx}`, `package.json`, `vite.config.ts`, `docs/**/*.md` 等（`watch-changes.js` 参照）
- **品質チェック**: `validate-docs.js`（必須ファイル、リンク、構造）
- **ログ**: `scripts/docs-auto-update/logs/`

詳細なトラブルシューティング・設定一覧は、必要に応じて `scripts/docs-auto-update/` 内の各 `.js` を直接参照してください。

### 文字エンコーディング・改行の補助（任意）

リポジトリ全体のテキストを機械的に確認・修正する場合に、ルートから次を利用できる（**コミット前に差分を必ず確認**すること）。

```bash
node scripts/utils/check-encoding.js
node scripts/utils/fix-encoding.js
```

用途・オプションは各スクリプト先頭のコメントを正とする。

---

## MDX → Obsidian 参照ミラー

個人の Obsidian Vault に、レッスン／記事 MDX を **参照用 Markdown** として書き出す。  
**公開の正本は常に** `src/content/lessons/`・`src/content/articles/` の MDX。

```bash
node scripts/sync-mdx-to-obsidian.mjs
# 任意: --vault "C:/path/to/Obsidian Vault"
```

| 項目 | 内容 |
|------|------|
| スクリプト | [`scripts/sync-mdx-to-obsidian.mjs`](../scripts/sync-mdx-to-obsidian.mjs) |
| 既定出力 | `%USERPROFILE%/Documents/Obsidian Vault/FlightAcademy/` |
| Lessons | `FlightAcademy/Lessons/` ← `src/content/lessons/` |
| Articles | `FlightAcademy/Articles/` ← `src/content/articles/`（メンタル／自己啓発。学科と分離） |
| 変換 | `export const meta` → YAML frontmatter、`<Image>` → `![]()`、`<Callout>` → Obsidian callout 等 |

Vault 側の案内: Obsidian 内 `FlightAcademy/Articles/_Index.md`。

---

## Supabase database SQL scripts

### インデックスとレイヤ分担

| ソース | 内容 |
|--------|------|
| **[scripts/database/INDEX.md](../../scripts/database/INDEX.md)** | ディレクトリの役割、よく使うファイルへのショートカット、**不要な旧 SQL はコミットしない**方針。**AI・初動調査からここを開く**。 |
| `scripts/database/` 直下 (`*.sql`) | ドキュメント・Skill から **相対リンクされている**運用／冪正 SQL が主。名前は **`YYYYMMDD_*`** または明確な `*_migration.sql` 等で揃える。 |
| **参照ゼロの過去 SQL** | **リポジトリに保持しない**。`scripts/database/` 直下にアーカイブ用サブフォルダは置かない。復元は Git 履歴。ルート `.gitignore` の **`archive/*`** はローカル用スタジングのみ。 |

### MCP / Dashboard での適用メモ

- 手順の数値・依存順の正は [db/CPL_KPI_and_Database_Operations.md](db/CPL_KPI_and_Database_Operations.md)、および [04_Operations_Guide.md](04_Operations_Guide.md) を優先する。
- `apply_migration` と `execute_sql` のどちらを使うかは **02_System_Spec** と各ファイル先頭コメントに従う。

### クイズ品質監査（verified 問題の機械チェック）

- **SQL 正本**: [`scripts/database/20260607_audit_unified_cpl_questions.sql`](../scripts/database/20260607_audit_unified_cpl_questions.sql)
- **報告テーブル migration**: [`scripts/database/20260607_question_issue_reports.sql`](../scripts/database/20260607_question_issue_reports.sql)
- **手順**:
  1. Supabase MCP `execute_sql` で audit SQL を実行（チェック A1〜A6）
  2. 結果を `artifacts/quiz_quality_audit_YYYY-MM-DD.md` に保存
  3. A6（open 報告）は [`/admin/question-reports`](../src/pages/admin/QuestionReportsPage.tsx) と併用
  4. **法規クラスタ**（`main_subject = 航空法規`）の条文突合は hourei MCP + 人間レビュー（全問自動ファクトチェックは対象外）
- **検討（未実装）**: 週次 GitHub Action で audit → 閾値超えで issue 作成、`quality_score` 再計算バッチ

---

## 週次テレメトリ GA4（ISO 週・GitHub Actions）

- **目的**: 火曜レビュー用の数字を **決定論的に** 取る。クラウドエージェントはローカル SA JSON を読まない。
- **スクリプト**: [`scripts/telemetry/ga4_iso_week_report.py`](../scripts/telemetry/ga4_iso_week_report.py)
- **Workflow**: [`.github/workflows/weekly-telemetry-ga4.yml`](../.github/workflows/weekly-telemetry-ga4.yml) — 火曜 00:00 UTC（09:00 JST）。artifact のみ（Slack / git write なし）。CI は `google-auth[requests]` を入れる。
- **Secret**: リポジトリの Actions secret **`GA4_SA_JSON`**（サービスアカウント JSON の本文）。**2026-08-17 に `ykagesg7/FlightEMS` へ登録済**。再発行しない。ローカル正本は `%APPDATA%\FlightAcademy\secrets\ga-mcp-readonly.json`。更新が必要なときだけ:
  ```powershell
  Get-Content -Raw "$env:APPDATA\FlightAcademy\secrets\ga-mcp-readonly.json" | gh secret set GA4_SA_JSON
  ```
  または GitHub → Settings → Secrets and variables → Actions → `GA4_SA_JSON`。JSON ファイルはコミットしない。
- **検証**: 2026-08-17 手動ドライラン `week=2026-W33` 成功。[run 31998682755](https://github.com/ykagesg7/FlightEMS/actions/runs/31998682755) / artifact `ga4-2026-W33`。ドライラン数値は正本に載せない。
- **artifact の取り方**: Actions → `weekly-telemetry-ga4` → 該当 run → `ga4-<ISO週>` をダウンロード。保持 90 日。
- **ローカル**:
  ```powershell
  python scripts/telemetry/ga4_iso_week_report.py --self-test
  python scripts/telemetry/ga4_iso_week_report.py --week 2026-W33 --out artifacts/ga4-iso-week.json
  ```
- **正本**: [ops/Weekly_Telemetry_Review.md](ops/Weekly_Telemetry_Review.md)
- **フェーズ2a**: [`.github/workflows/weekly-telemetry-notify.yml`](../.github/workflows/weekly-telemetry-notify.yml) が GA4 成功後に `#fa-telemetry` へ **日本語** Facts を投稿。[`format_ga4_slack.py`](../scripts/telemetry/format_ga4_slack.py)。Secret `SLACK_WEBHOOK_URL`（必須）。任意 `SLACK_BOT_TOKEN` があると投稿末尾に **スレッド Permalink** を付与（`chat.postMessage` + `chat.update`）。`@` メンションなし。
  ```powershell
  python scripts/telemetry/format_ga4_slack.py --self-test
  python scripts/telemetry/format_ga4_slack.py --in artifacts/ga4-iso-week.json
  ```
- **フェーズ2b**: Skill [`.cursor/skills/weekly-telemetry-review/SKILL.md`](../.cursor/skills/weekly-telemetry-review/SKILL.md)。Facts 下書き [`format_ga4_review.py`](../scripts/telemetry/format_ga4_review.py)。正本 PR まで（merge しない）。
  ```powershell
  python scripts/telemetry/format_ga4_review.py --self-test
  python scripts/telemetry/format_ga4_review.py --in artifacts/ga4-iso-week.json
  ```
- **フェーズ2c（L0）**: [`.github/workflows/weekly-telemetry-approve.yml`](../.github/workflows/weekly-telemetry-approve.yml)。分類 [`approve_command.py`](../scripts/telemetry/approve_command.py)。L1 は [`l1_allowlist.json`](../scripts/telemetry/l1_allowlist.json)（空）。承認者 [`approvers.json`](../scripts/telemetry/approvers.json)。Slack 受信は [`api/telemetry-approve.ts`](../api/telemetry-approve.ts)（**notify アプリに Event Subscriptions を付けない。Slash Command は使わない**）。`APPROVE-DOC` は Draft PR を自動 Ready 後 squash merge。**成功 ACK はマージ後のみ**。
  ```powershell
  python scripts/telemetry/approve_command.py --self-test
  gh workflow run weekly-telemetry-approve.yml -f command=HOLD
  ```
  Vercel 配線（一度）: Production に `SLACK_SIGNING_SECRET` と、`actions:write` のみの fine-grained PAT `GITHUB_TELEMETRY_DISPATCH_TOKEN`。Request URL は `https://flight-lms.vercel.app/api/telemetry-approve`。別 Slack アプリ `fa-telemetry-approve` で `message.channels`。承認は Facts スレッドへ `HOLD` 等を一行返信。ACK は `fa-telemetry-notify` の Incoming Webhook。Slash Command は使わない。

## GA4 MCP・OAuth / ADC（ローカル例）

- **目的**: Cursor の [Google 公式 Analytics MCP](https://developers.google.com/analytics/devguides/MCP?hl=ja)（`analytics-mcp`）向けに、**ユーザーの Application Default Credentials** を取り直すときの **PowerShell の命令列の雛形**。
- **正本の手順・トラブルシュート**: [Cursor_MCP_Setup.md](Cursor_MCP_Setup.md) の「Google Analytics MCP」。
- **雛形スクリプト**: リポジトリの [`scripts/ga4-mcp-oauth-adc-login.example.ps1`](../scripts/ga4-mcp-oauth-adc-login.example.ps1) をコピーし、**クライアント JSON のパス**と **GCP プロジェクト ID** だけローカルで埋めて実行する。**OAuth クライアント秘密・ADC ファイルはコミットしない**。

---

## CPL Master CSV 取込仕様

> **配置**: 本節が正本。取込スクリプトは `scripts/cpl_exam/import_cpl_master_csv.py`。

### DB確認結果（Supabase MCP）

- `unified_cpl_questions`: 451件、verified 427件
- UNIQUE制約 `(main_subject, sub_subject, question_text, correct_answer)` は**未設定**（既存重複あり）
- `v_mapped_questions`: `learning_test_mapping` JOIN `unified_cpl_questions` のビュー
- `main_subject` CHECK: 航空工学, 航空気象, 空中航法, 航空通信, 航空法規
- `correct_answer`: 1-4
- `verification_status`: pending, verified, needs_review, duplicate, rejected

### CSV列マッピング

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

### 大分類 → main_subject マッピング

| CSV 大分類 | main_subject |
|------------|--------------|
| 航空力学, 航空機構造, 航空機の構造, 性能と耐空性, エア・データー表示計器, ピストン・エンジン, 油圧系統, 着氷, 重量・重心, 燃料供給系統, 着陸装置, 無線通信(計器系) | 航空工学 |
| 大気の物理, 大気の力学, 気象観測, 気象現象, 気象予報 | 航空気象 |
| 航法, 航法計画書, 緊急操作, 人間工学・CRM, 安全管理 | 空中航法 |
| 管制業務, 航空交通業務, 無線通信(管制系) | 航空通信 |
| 航空法及び航空法施行規則, 国際条約 | 航空法規 |

### 科目コード（ファイル名）→ main_subject

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

### 実行方法

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

### dry-run 結果（全5件）

| 科目 | 読込 | 正規化後 | 新規投入予定 |
|------|------|----------|--------------|
| AD | 780 | 318 | 318 |
| CM | 779 | 266 | 266 |
| NV | 780 | 549 | 549 |
| RG | 780 | 402 | 402 |
| WX | 780 | 392 | 392 |
| **合計** | | | **1927** |

CSV内重複除外: 1972件

### 取込後の確認

1. **件数確認**: Supabase Dashboard または `SELECT COUNT(*) FROM unified_cpl_questions WHERE verification_status='verified'`
2. **出題確認**: `/test` ページで科目・サブ科目が増えているか、問題が表示されるか確認
3. **重複確認**: `SELECT main_subject, sub_subject, question_text, correct_answer, COUNT(*) FROM unified_cpl_questions GROUP BY 1,2,3,4 HAVING COUNT(*) > 1` で重複を検出

---

## MLIT 例題集取込（事業用操縦士・飛行機）

> **スクリプト**: [`scripts/cpl_exam/import_mlit_sample_to_unified.py`](../scripts/cpl_exam/import_mlit_sample_to_unified.py)  
> **版インベントリ**: [`scripts/cpl_exam/data/EDITION_INVENTORY.md`](../scripts/cpl_exam/data/EDITION_INVENTORY.md)

### 方針

- 登録するのは **公式例題集の版**のみ（PDFヘッダ年月）。CBT試験カレンダー月（2023-11〜2025-09 等）への水増し登録はしない
- 確認済み版: **2024-08**（初回公開・SQL復元）、**2026-06**（現行 `001761087.pdf`）
- `source_documents.sources[].type = mlit_sample`、`year` / `month` で版を識別
- UI/DB は4択のため、5肢は不要肢を1つ削除（`choice_adaptation` に記録）。正答5（無し）は「4つ」を落とし無しを(4)へ再マップ
- 既存本文とプレフィックス一致する問題はスキップ

### 実行

```bash
# PDFテキスト（WebFetch等）を data/001761087_202606_webfetch.txt に配置してから
python scripts/cpl_exam/import_mlit_sample_to_unified.py --skip-supabase
# → scripts/database/20260720_unified_cpl_questions_mlit_sample_202606.sql
# → scripts/database/20260720_unified_cpl_questions_mlit_sample_202408_backfill.sql
# → scripts/cpl_exam/data/mlit_sample_import_report.json

# 本番投入（service role）
python scripts/cpl_exam/data/_apply_via_supabase.py
```

### CBT期の薄い行について

`unified_cpl_questions` に残る 2023-11〜2025-09（2024-08除く）の `official_exam` 行は、選択肢空・プレースホルダ本文のものが多く、**公式例題集ではない**。削除は任意の後続タスク（`needs_review` / `duplicate`）。

### 2026-07-20 本番適用〜ファクトチェック結果

初回投入は 107 行（2026-06: 74、2024-08 補完: 33）。その後の整理:

- **要図2問は除外**（削除）
- `=== Page N ===` 混入を除去（7件）
- 科目誤タグ修正: 飛行場灯火・救急用具 → `航空法規`
- 見張り義務の2024重複行を削除（2026版を正とする）
- 航空法第85条（粗暴な操縦）の正答を法令文言と照合し一致を確認
- **現状: `mlit_sample` 104問・全て `verified`**
