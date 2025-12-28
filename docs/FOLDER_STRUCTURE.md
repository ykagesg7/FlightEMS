# プロジェクトフォルダ構造ガイド

**最終更新**: 2025年1月
**バージョン**: Folder Structure Guide v1.0

---

## 📁 フォルダ構成と説明

### 🔧 設定・設定ファイル

#### `.cursor/`
- **目的**: Cursor IDEの設定ファイル
- **内容**:
  - `rules/deep-thinking.mdc`: AIアシスタント用の思考モード設定
  - `mcp.json.backup`: MCP設定のバックアップ（.gitignoreで除外）
- **注意**: `.cursor/mcp.json`は機密情報を含むため、.gitignoreで除外されています

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
- **詳細**: [docs/07_コンポーネント構造ガイド.md](07_コンポーネント構造ガイド.md)を参照

#### `docs/`
- **目的**: プロジェクトドキュメント
- **詳細**: [docs/README.md](README.md)を参照

#### `scripts/`
- **目的**: 開発・運用スクリプト
- **内容**: データベース操作、PDF変換、ドキュメント自動更新など

#### `public/`
- **目的**: 静的ファイル（画像、GeoJSONなど）
- **注意**: 一部の大きなファイルは`.gitignore`で除外されています

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

