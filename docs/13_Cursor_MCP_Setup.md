# Cursor MCP セットアップ（Flight Academy）

**目的**: Cursor の Model Context Protocol（MCP）を、このリポジトリで使うための配置方針と手順をまとめる。  
**関連**: [`.cursor/mcp.json.example`](../.cursor/mcp.json.example)（コミット用テンプレ）、実設定は `.cursor/mcp.json`（`.gitignore`）。

---

## Windows で MCP が「No tools」になる場合

Cursor が `child_process.spawn` で `npx` を起動すると、Windows では **`npx.cmd` を直接実行できず**サーバーが立ち上がらないことがあります（[Cursor Community](https://forum.cursor.com/t/mcp-setup-on-windows-fix-npx-problem/92830)、[modelcontextprotocol/servers#3460](https://github.com/modelcontextprotocol/servers/issues/3460)）。

**対処**: `npx` ベースの各エントリを **`cmd` 経由**に差し替える。

```json
"chrome-devtools": {
  "command": "cmd",
  "args": ["/c", "npx", "-y", "chrome-devtools-mcp@latest"]
}
```

同様に、`context7`・`playwright`・`my_supabase_project` など **`command` が `npx` のもの**はすべて `command: "cmd"`、`args: ["/c", "npx", "-y", …]` 形式にする。**`uvx`（Serena）や URL 型（GitHub / Vercel）は通常そのままでよい**（`uvx.exe` はネイティブ実行ファイルのため）。

- 初回の `npx` プロンプトで止まるのを防ぐため、**`npx` には必ず `-y`** を付ける（例: `@supabase/mcp-server-supabase`、`@playwright/mcp@latest`）。

変更後は **Cursor を再起動**し、**Settings → Tools & Integrations → MCP** で各サーバーを確認する。

---

## 配置方針（Global とプロジェクト）

複数リポジトリで同じ GitHub アカウントを使う場合、**ブラウザ系など汎用サーバーは Global**、**Vercel / Supabase などアプリ単位のものは各リポジトリの `.cursor/mcp.json`** に分けると取り違えが減ります。**GitHub MCP は Global とプロジェクトのどちらか一方だけ**に置く（両方に同じ `github` エントリを重複させない）。

| 置き場所 | 対象の例 |
|----------|-----------|
| **Global**（`%USERPROFILE%\.cursor\mcp.json`） | （任意）全リポジトリ共通の `github`（PAT）のみ、など |
| **プロジェクト**（`.cursor/mcp.json`） | `chrome-devtools`、`vercel`、Supabase MCP、[Serena](https://oraios.github.io/serena/)、`github`（このリポジトリ専用）など |

---

## Chrome DevTools MCP（ブラウザデバッグ）

[Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp) を有効にすると、エージェントが **実際の Chrome** を操作し、コンソール・ネットワーク・スクリーンショット・Lighthouse 等にアクセスできます。

**要件**: Node.js **v20.19+**、**Chrome（安定版）**、npm。

**設定（このリポジトリ）**: `.cursor/mcp.json` の `mcpServers` に次を追加する（[`.cursor/mcp.json.example`](../.cursor/mcp.json.example) に同梱）。

```json
"chrome-devtools": {
  "command": "npx",
  "args": ["-y", "chrome-devtools-mcp@latest"]
}
```

（**Windows** では上記「No tools」節のとおり `cmd` + `/c` ラップを検討。）

- **Cursor**: **Settings → Tools & Integrations → MCP** で `chrome-devtools` が緑／接続済みか確認。変更後は **Cursor を再起動**。
- **利用統計のオプトアウト**（Google へのテレメトリ無効）: `args` に `"--no-usage-statistics"` を追加。または環境変数 `CHROME_DEVTOOLS_MCP_NO_USAGE_STATISTICS=1` や `CI=1`。
- **軽量モード**: 基本操作のみなら `"--slim"`（必要なら `"--headless"` も）。詳細は公式 README の *Slim* 節。

複数リポジトリで同じ設定を使う場合は、上記ブロックを **Global** の `%USERPROFILE%\.cursor\mcp.json` にだけ置き、プロジェクト側では省略してもよい。

---

## Serena（シンボリック編集 MCP）

- リポジトリ直下に [`.serena/project.yml`](../.serena/project.yml) がある（言語は TypeScript 中心）。別マシンで初めて使う場合は [uv](https://docs.astral.sh/uv/) を入れ、対話プロンプトを避ける例:  
  `uvx --from git+https://github.com/oraios/serena serena project create . --name FlightAcademyTsx --language typescript`
- Cursor の **ワークスペース単位**で使うには、`.cursor/mcp.json` の Serena に **`--project` とこのリポジトリの絶対パス**（Windows では `C:/...` のフォワードスラッシュ推奨）を渡す。[公式: Connecting Your MCP Client](https://oraios.github.io/serena/02-usage/030_clients.html)
- ローカルだけの上書きは `.serena/project.local.yml`（`.gitignore` 済み）。

---

## 初回手順（このリポジトリ）

1. **プロジェクト**: `.cursor/mcp.json.example` を `.cursor/mcp.json` にコピーし、`SUPABASE_ACCESS_TOKEN`・`SUPABASE_PROJECT_ID`・Vercel の URL を埋める。例には **`chrome-devtools`** が含まれる（不要なら削除）。GitHub MCP を使う場合は [Personal Access Token](https://github.com/settings/personal-access-tokens/new) を `Authorization: Bearer …` に設定する（スコープは最小限）。**PAT はリポジトリにコミットしない。**
2. **Global（任意）**: 全リポジトリ共通の MCP だけ `%USERPROFILE%\.cursor\mcp.json` に置く。GitHub を **プロジェクトの `.cursor/mcp.json` にだけ**書く場合は、Global に `github` を重複させない。
3. Cursor を再起動する（GitHub リモート MCP は [Cursor v0.48.0+](https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-cursor.md) 推奨）。
4. **Settings → Tools & Integrations → MCP** で接続を確認。`chrome-devtools` が利用可能か、Vercel は `Needs login` から OAuth で認可する。

### Vercel の URL

- 汎用: `https://mcp.vercel.com`（初回は Cursor 側で **OAuth / Needs login** の認可が必要なことがある）
- プロジェクトに紐づける: `https://mcp.vercel.com/<team_id_or_slug>/<project_slug>`（[公式: project-specific](https://vercel.com/docs/mcp/vercel-mcp#project-specific-mcp-access)）。`team_…` の **Team ID** でも可。値は `npx vercel link` 後の `.vercel/project.json`（`orgId` / `projectName`）を参照。

### リモート MCP（GitHub / Vercel）でツールが 0 件のとき

- **Vercel**: ブラウザで Vercel へのログイン・認可が完了しているか確認する。
- **GitHub（Copilot API）**: `Authorization: Bearer <PAT>` の形式、PAT の期限・スコープ、組織の Copilot / MCP ポリシーを確認する。

### トラブルシューティング（GitHub）

- `Authorization header is badly formatted`: プレースホルダのままの PAT、または改行・余分なスペースが入っていないか確認する。
- 組織で Copilot Business/Enterprise の場合、[About MCP](https://docs.github.com/en/copilot/concepts/about-mcp) のポリシー制約あり。

### GitHub MCP の代替（Docker）

[Install GitHub MCP Server in Cursor（Local Server Setup）](https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-cursor.md)。非推奨の `@modelcontextprotocol/server-github` は使わない。

---

## コミットメッセージ（英語）

プロジェクト規約ではコミットタイトルは **英語のみ**（Windows 文字化け対策）。詳細は [`.cursor/rules/git-conventions.mdc`](../.cursor/rules/git-conventions.mdc) と [scripts/README-git-commit.md](../scripts/README-git-commit.md) を参照。
