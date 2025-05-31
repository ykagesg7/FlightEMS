# MarkItDown MCP セットアップガイド

## 概要
MarkItDown MCPをCursor.aiで使用するためのセットアップ手順です。

## 1. インストール状況
✅ `markitdown` - インストール済み  
✅ `markitdown-mcp` - インストール済み  
✅ `mcp` - インストール済み  

## 2. MCP設定ファイル
`.cursor/mcp.json` にMarkItDown設定を追加済み：

```json
{
  "mcpServers": {
    "my_supabase_project": {
      "command": "npx",
      "args": [
        "@supabase/mcp-server-supabase"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_3eccca9502ad743c092834f055476d76fe3bf29b",
        "SUPABASE_PROJECT_ID": "fstynltdfdetpyvbrswr"
      }
    },
    "markitdown": {
      "command": "python",
      "args": [
        "markitdown_simple_mcp.py"
      ]
    }
  }
}
```

## 3. Cursor.aiでの設定手順

### ステップ1: Cursorを再起動
設定を反映するためにCursorを完全に再起動します。

### ステップ2: MCP設定を確認
1. Cursor設定を開く（Ctrl+, または Cmd+,）
2. "MCP"を検索
3. "Settings > MCP" セクションに移動
4. "Refresh" ボタンをクリックして設定を再読み込み

### ステップ3: 動作確認
Cursorのチャットで以下のようにMCPツールを使用できます：

#### 基本的な使用方法
- `@markitdown テキストをMarkdownに変換して`
- `ファイルをMarkdown形式に変換する`

#### 提供される機能
1. **convert_text_to_markdown** - プレーンテキストをMarkdown形式に変換
2. **convert_file_to_markdown** - 各種ファイル形式（PDF、DOCX等）をMarkdownに変換
3. **convert_url_to_markdown** - WebページのコンテンツをMarkdownに変換

## 4. トラブルシューティング

### 問題1: MCPサーバーが認識されない
**解決策:**
1. Cursorを完全に再起動
2. MCP設定でRefreshボタンをクリック
3. Python環境にmarkitdownがインストールされているか確認

### 問題2: 依存関係エラー
**解決策:**
```bash
pip install --upgrade markitdown mcp
```

### 問題3: ファイル変換エラー
**解決策:**
- ファイルパスが正しいか確認
- ファイル形式がサポートされているか確認
- ファイルの読み取り権限があるか確認

## 5. サポートされるファイル形式
- PDF（.pdf）
- Microsoft Word（.docx）
- Microsoft PowerPoint（.pptx）
- Microsoft Excel（.xlsx、.xls）
- HTML（.html）
- 画像ファイル（OCR機能付き）
- プレーンテキスト（.txt）

## 6. 使用例

### 例1: テキスト変換
```
ユーザー: "Hello World"というテキストをMarkdown形式に変換してください
AI: convert_text_to_markdown ツールを使用して変換します
```

### 例2: ファイル変換
```
ユーザー: documents/report.pdfをMarkdownに変換してください
AI: convert_file_to_markdown ツールでPDFファイルを変換します
```

### 例3: URL変換
```
ユーザー: https://example.com のコンテンツをMarkdownで取得してください
AI: convert_url_to_markdown ツールでWebページを変換します
```

## 7. 注意事項
- 大きなファイルの変換には時間がかかる場合があります
- 一部の複雑なレイアウトは完全に再現されない場合があります
- インターネット接続が必要なURL変換機能があります

このセットアップにより、Cursor.aiでMarkItDownの機能を使用してファイル変換やコンテンツ分析を効率的に行うことができます。 