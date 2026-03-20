# Cursor MCP セットアップ（Flight Academy）

**目的**: Cursor の Model Context Protocol（MCP）を、このリポジトリで使うための配置方針と手順をまとめる。  
**関連**: [`.cursor/mcp.json.example`](../.cursor/mcp.json.example)（コミット用テンプレ）、実設定は `.cursor/mcp.json`（`.gitignore`）。

---

## 配置方針（Global とプロジェクト）

複数リポジトリで同じ GitHub アカウントを使う場合、**ブラウザ系など汎用サーバーは Global**、**Vercel / Supabase などアプリ単位のものは各リポジトリの `.cursor/mcp.json`** に分けると取り違えが減ります。**GitHub MCP は Global とプロジェクトのどちらか一方だけ**に置く（両方に同じ `github` エントリを重複させない）。

| 置き場所 | 対象の例 |
|----------|-----------|
| **Global**（`%USERPROFILE%\.cursor\mcp.json`） | `chrome-devtools`、（任意）全リポジトリ共通にしたい `github`（PAT） |
| **プロジェクト**（`.cursor/mcp.json`） | `vercel`、Supabase MCP、[Serena](https://oraios.github.io/serena/)、`github`（このリポジトリ専用）など |

---

## Serena（シンボリック編集 MCP）

- リポジトリ直下に [`.serena/project.yml`](../.serena/project.yml) がある（言語は TypeScript 中心）。別マシンで初めて使う場合は [uv](https://docs.astral.sh/uv/) を入れ、対話プロンプトを避ける例:  
  `uvx --from git+https://github.com/oraios/serena serena project create . --name FlightAcademyTsx --language typescript`
- Cursor の **ワークスペース単位**で使うには、`.cursor/mcp.json` の Serena に **`--project` とこのリポジトリの絶対パス**（Windows では `C:/...` のフォワードスラッシュ推奨）を渡す。[公式: Connecting Your MCP Client](https://oraios.github.io/serena/02-usage/030_clients.html)
- ローカルだけの上書きは `.serena/project.local.yml`（`.gitignore` 済み）。

---

## 初回手順（このリポジトリ）

1. **Global**: `~/.cursor/mcp.json` に `chrome-devtools` を定義する。GitHub を **プロジェクトの `.cursor/mcp.json` にだけ**書く場合は、Global には `github` を置かない。
2. **プロジェクト**: `.cursor/mcp.json.example` を `.cursor/mcp.json` にコピーし、`SUPABASE_ACCESS_TOKEN`・`SUPABASE_PROJECT_ID`・Vercel の URL を埋める。GitHub MCP を使う場合は [Personal Access Token](https://github.com/settings/personal-access-tokens/new) を `Authorization: Bearer …` に設定する（スコープは最小限）。**PAT はリポジトリにコミットしない。**
3. Cursor を再起動する（GitHub リモート MCP は [Cursor v0.48.0+](https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-cursor.md) 推奨）。
4. **Settings → Tools & Integrations → MCP** で接続を確認。Vercel は `Needs login` から OAuth で認可する。

### Vercel の URL

- 汎用: `https://mcp.vercel.com`
- このアプリに固定: `https://mcp.vercel.com/<team_slug>/<project_slug>`（[公式: project-specific](https://vercel.com/docs/mcp/vercel-mcp#project-specific-mcp-access)）

### トラブルシューティング（GitHub）

- `Authorization header is badly formatted`: プレースホルダのままの PAT、または改行・余分なスペースが入っていないか確認する。
- 組織で Copilot Business/Enterprise の場合、[About MCP](https://docs.github.com/en/copilot/concepts/about-mcp) のポリシー制約あり。

### GitHub MCP の代替（Docker）

[Install GitHub MCP Server in Cursor（Local Server Setup）](https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-cursor.md)。非推奨の `@modelcontextprotocol/server-github` は使わない。

---

## コミットメッセージ（英語）

プロジェクト規約ではコミットタイトルは **英語のみ**（Windows 文字化け対策）。詳細は [`.cursor/rules/git-conventions.mdc`](../.cursor/rules/git-conventions.mdc) と [scripts/README-git-commit.md](../scripts/README-git-commit.md) を参照。
