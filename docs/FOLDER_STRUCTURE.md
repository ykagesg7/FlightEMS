# プロジェクトフォルダ構造ガイド

**最終更新**: 2026年5月5日（トップレベル7本柱・`vite/`・`e2e/` の索引追加。他は過去ログ参照）
**バージョン**: Folder Structure Guide v1.9

**責務**: repo 全体のフォルダ概要。プロジェクトのクイックリファレンスと AI 向け索引は [docs/README.md](README.md)。`src/` の詳細は [Component_Structure_Guide.md](Component_Structure_Guide.md) を参照。

---

## リポジトリの主なトップレベル（7本柱＋ルート設定）

AI・新規参加者は **下表 → 各節の詳細** の順で辿ると迷いにくい。

| パス | 役割 |
|------|------|
| [`src/`](#src) | React アプリ本体（ページ・フック・`content` MDX 等） |
| [`api/`](#api) | Vercel Serverless（気象・NOTAM 等のプロキシ） |
| [`public/`](#public) | 静的配信（画像、GeoJSON、**同期済み** `public/docs/*.md`） |
| [`docs/`](#docs) | 仕様・運用ドキュメントの**正本**（`public/docs` は手編集しない） |
| [`scripts/`](#scripts) | DB SQL、CPL 取込、ドキュメント同期、ウェイポイント補助など |
| [`e2e/`](#e2e) | Playwright E2E スペック |
| [`vite/`](#vite) | Vite 専用プラグイン（開発時 `/api/*` プロキシ、GA4 タグ等） |
| **リポジトリルート** | `vite.config.ts`、`package.json`、`tsconfig*.json`、[AGENTS.md](../AGENTS.md)、[DESIGN.md](../DESIGN.md)、[README.md](../README.md) など |

---

## 📁 フォルダ構成と説明

### 🔧 設定・設定ファイル

#### `.cursor/`
- **目的**: Cursor IDE のルール・スキル・サブエージェント。**旧ルート `.cursorrules` は廃止**し、粒度の細かい **`.cursor/rules/*.mdc`** とルート [**AGENTS.md**](../AGENTS.md) に寄せる。
- **内容**:
  - `rules/*.mdc`: パス別・常時適用ルール（例: `core-project.mdc`, `git-conventions.mdc`, `mdx-article-guide.mdc`）
  - `skills/<name>/SKILL.md`: オンデマンド手順（記事登録・フライトプラン棚卸し等）
  - `agents/*.md`: 委譲用サブエージェント
- **ルート**: [AGENTS.md](../AGENTS.md)（エージェント要約）、[DESIGN.md](../DESIGN.md)（UI トークン）
- **注意**: `.cursor/mcp.json` は機密情報を含むため .gitignore で除外。手動テンプレは [`mcp.json.example`](../.cursor/mcp.json.example)

#### `.github/`
- **目的**: GitHub Actionsワークフロー設定
- **内容**:
  - `workflows/test.yml`: テスト専用ワークフロー
  - `workflows/verify-build.yml`: ビルド検証ワークフロー
- **削除済み**: `cursor-cli.yml`（使用頻度が低いため削除）

#### `.vercel/` / `.vscode/`
- **状態**: 存在しない（.gitignoreで除外）
- **説明**: 必要に応じて自動生成される設定フォルダ

---

### 🚀 API・サーバーレス関数

#### `api/`
- **目的**: Vercel Serverless Functions
- **内容**:
  - `weather.ts`: 一般気象情報APIプロキシ（WeatherAPI.com）
  - `aviation-weather.ts`: 航空気象情報APIプロキシ（NOAA）
  - `swim-notam-search.ts`: **SWIM デジタルノータム検索**プロキシ（`GET`、認証はサーバのみ）
  - `lib/swimNotamCore.ts`: ログイン・検索・AIXM 要約・`geometry` / `rawXml` 付与の共有ロジック
  - `lib/swimNotamHttpShared.ts`: Vercel ハンドラ・Vite プラグイン・`dev-weather-server` で共有するディスパッチ
  - `lib/swimNotamGeometry.ts`: GML `posList` / `pos` から GeoJSON を推定（日本域ヒューリスティック・参考表示）
  - `package.json`: CommonJS設定（Vercel用）
- **重要**: これらのファイルはVercelのServerless Functionsとして自動デプロイされます

---

### 📊 データ・コンテンツ

#### `cpl_exam_data/`
- **状態**: 空ディレクトリ（実際のデータは.gitignoreで除外）
- **目的**: CPL試験問題データの格納場所
- **説明**:
  - 実際のPDFや変換済みMDXファイルは`.gitignore`で除外されています
  - `scripts/cpl_exam/`のスクリプトで使用されます
  - READMEで参照されていますが、実際のデータはリポジトリに含まれません

#### `dist/`
- **状態**: 空ディレクトリ（ビルド成果物）
- **目的**: Viteビルドの出力先
- **説明**: `.gitignore`で除外されており、`npm run build`で自動生成されます

---

### 📝 その他の重要なフォルダ

#### `src/`
- **目的**: ソースコードのメインディレクトリ
- **詳細**: [docs/Component_Structure_Guide.md](Component_Structure_Guide.md)を参照

#### `docs/`
- **目的**: プロジェクトドキュメントの**正本**（仕様・戦略・運用）
- **詳細**: [docs/README.md](README.md)を参照
- **番号付き `00`〜`06`**: AI 初動の**読み順**（[README「AI向けのドキュメント番号」](README.md#ai向けのドキュメント番号読み方)）。それ以外（旧 `08`–`14` や方針メモ等）は**参照**。
- **長期バックログ**: [06_Long_Term_Execution.md](06_Long_Term_Execution.md)（リネーム後。旧 15＋旧 12 §5）。`public/docs/` 配信は [sync-public-docs.mjs](../scripts/sync-public-docs.mjs) ホワイトリストのみ

- **スクリプト系ドキュメント（統合）**: [Scripts_Repository_Tooling.md](Scripts_Repository_Tooling.md)（CPL CSV・Git 補足・`docs:watch/validate`）。**Phase 別テスト計画**: [Phase_Testing_Plan.md](Phase_Testing_Plan.md)。**GeoJSON 資産手順**: [GeoJSON_Waypoints_And_Assets.md](GeoJSON_Waypoints_And_Assets.md)

##### `docs/SWIM_Portal/`
- **目的**: 国土交通省航空局 **SWIM**・**デジタルノータムリクエストサービス**の仕様・手続きの参照用 Markdown（共通編、付録 04、サービス説明書、ユーザーズガイド、情報サービス概要）
- **索引**: [docs/SWIM_Portal/README.md](SWIM_Portal/README.md)
- **注意**: `PDF/` 配下の原本 PDF は `.gitignore`（`**/*.pdf`）によりコミット対象外。正本は公式資料に従うこと

#### `public/`
- **目的**: 静的ファイル（画像、GeoJSONなど）
- **`public/docs/`**: **`docs/` のコピー（手編集しない）**。`npm run sync:public-docs` で `05_Content_Pipeline`・`08`・`09`・`10`・`Article_Coverage_Backlog` 等（[sync-public-docs.mjs](../scripts/sync-public-docs.mjs) の `FILES`）を上書き。MDX から `/docs/*.md` で配信。旧ファイル名（`06_記事…` 等）の **URL 互換は保証しない**（必要ならリダイレクトやリンク更新で対応）。
- **注意**: 一部の大きなファイルは`.gitignore`で除外されています
- **ウェイポイント（本番のみ）**: アルファベット別 `waypoints_<1文字>.json` と `waypoints/index.json` は [.vercelignore](../.vercelignore) で Vercel 転送のみ省略。**Git とローカルビルドは含まれる**。理由とデータ層は [GeoJSON doc](GeoJSON_Waypoints_And_Assets.md)

#### `scripts/`
- **目的**: 開発・運用スクリプト（説明の正本は [docs/Scripts_Repository_Tooling.md](Scripts_Repository_Tooling.md)）
- **内容**:
  - `database/`: **総索引は [INDEX.md](../../scripts/database/INDEX.md)**。マイグレーション類（例: `20260309_bootstrap_user_learning_profiles.sql`、`20260330_learning_test_mapping_cpl_clusters_by_subject.sql`、`20260331_learning_test_mapping_aviation_legal_312_skill_cluster.sql`、`20260410_cpl_stub_lessons_contents_and_mapping.sql`、[05_Content_Pipeline.md](05_Content_Pipeline.md)）は直下に置く。**`docs/` 等から参照されない旧 SQL はリポジトリに残さない**（復元は Git 履歴）。ルート **`archive/`** と [.gitignore](../.gitignore) の `archive/*` はローカル用。詳細は [Scripts_Repository_Tooling.md](Scripts_Repository_Tooling.md)。
  - `cpl_exam/`: CPL 問題 CSV 取込。仕様は [docs/Scripts_Repository_Tooling.md](Scripts_Repository_Tooling.md) の **CPL Master CSV 取込仕様** 節
  - `docs-auto-update/`: ドキュメント自動更新（同ファイルの **ドキュメント自動更新** 節。Phase テスト計画は [docs/Phase_Testing_Plan.md](Phase_Testing_Plan.md)）
  - `sync-public-docs.mjs`: `docs/` から `public/docs/` へのホワイトリスト同期（`npm run sync:public-docs`。`prebuild` でも実行）

#### `e2e/`
- **目的**: **Playwright** によるエンドツーエンドテスト（`npm run test:e2e`）
- **内容**: 機能別 `.spec.ts`（例: 計画・記事スタブなど）。設定はルート [`playwright.config.ts`](../playwright.config.ts) を正とする。

#### `vite/`
- **目的**: **Vite ビルド専用プラグイン**（アプリの React コードではない）。[`vite.config.ts`](../vite.config.ts) から import。
- **内容（代表）**:
  - `devWeatherApiPlugin.ts`: ローカル `npm run dev` で `/api/weather`・`/api/aviation-weather`・`/api/swim-notam-search` 等を処理（[`api/lib`](../api/lib) 共有）
  - `devOpenskyApiPlugin.ts`: 開発時 OpenSky 系の同様の橋渡し
  - `injectGoogleTagPlugin.ts`: 本番ビルド時 GA4 注入（詳細は `vite.config.ts`）
- **境界**: 本番の HTTP API 実体は [`api/`](#api)。ここは開発サーバと Rollup ビルドへのフック。

---

## 🗑️ 削除・整理済み（2025年1月）

### 削除済みファイル・フォルダ

#### ルートレベル
- ✅ `.github/workflows/cursor-cli.yml` - 使用頻度が低いため削除（必要なら再作成可能）
- ✅ `.cursor/plans/` - 空ディレクトリを削除

#### src/components/ 整理
- ✅ `src/components/ui/ErrorBoundary.tsx` - `EnhancedErrorBoundary.tsx`が使用されているため削除
- ✅ `src/components/layout/HeaderSkeleton.tsx` - 未使用のため削除
- ✅ `src/components/layout/CategoryDropdown.tsx` - 未使用のため削除
- ✅ `src/components/common/FilterTabs.tsx` - 未使用のため削除
- ✅ `src/components/common/SearchAndTags.tsx` - 未使用のため削除
- ✅ `src/components/layout/` フォルダ - 空フォルダのため削除

### 保護されているファイル
- 🔒 `.cursor/mcp.json.backup` - 保護された設定ファイル（.gitignoreで除外済み、削除不可だが問題なし）

### 整理結果
- **.cursor**: バックアップファイルと空ディレクトリを整理
- **.github**: 不要なワークフローを削除、テスト・ビルド検証のみ保持
- **api**: 正常（Vercel Serverless Functions）
- **cpl_exam_data**: 空だが、scriptsで参照されているため保持（.gitignoreでデータ除外）
- **dist**: 空だが、ビルド成果物なので正常（.gitignoreで除外）
- **src/components**: 未使用コンポーネント5ファイルと空フォルダ1つを削除、構造を整理

---

## 📋 .gitignoreで除外されているフォルダ

以下のフォルダは`.gitignore`で除外されており、リポジトリに含まれません：

- `dist/` - ビルド成果物
- `.vercel/` - Vercel設定
- `.vscode/` - VS Code設定（`extensions.json`を除く）
- `cpl_exam_data/raw_pdfs/` - 生PDFファイル
- `cpl_exam_data/converted_md/` - 変換済みMDXファイル
- `coverage/` - テストカバレッジレポート
- `.vitest/` - Vitestキャッシュ
- `node_modules/` - 依存関係

---

## 🔍 フォルダの確認方法

### 空フォルダの確認
```bash
# PowerShell
Get-ChildItem -Directory | Where-Object { (Get-ChildItem $_.FullName -Recurse -File).Count -eq 0 }

# Bash
find . -type d -empty
```

### 大きなファイルの確認
```bash
# PowerShell
Get-ChildItem -Recurse -File | Sort-Object Length -Descending | Select-Object -First 10 FullName, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB,2)}}
```

---

**最終更新**: 2025年1月
**バージョン**: Folder Structure Guide v1.0
**管理者**: FlightAcademy開発チーム

