# Cursor MCP セットアップ（Flight Academy）

**目的**: Cursor の Model Context Protocol（MCP）を、このリポジトリで使うための配置方針と手順をまとめる。  
**関連**: [`.cursor/mcp.json.example`](../.cursor/mcp.json.example)（コミット用テンプレ）、実設定は `.cursor/mcp.json`（`.gitignore`）。

---

## Cursor Marketplace と手動 `mcp.json` の関係（2026-04）

**Cursor → Settings → MCP → Marketplace** から追加した統合は、Cursor が **`plugin-*` 形式のサーバー**として別途登録することが多く、**`.cursor/mcp.json` に同じ名前のエントリを書かなくても**ツール一覧に出ます（このワークスペースで検出された例: `plugin-supabase-supabase`、`plugin-vercel-vercel`、`plugin-context7-plugin-context7`、`plugin-sentry-sentry` など）。

| 状況 | 推奨 |
|------|------|
| Marketplace で **Supabase / Vercel / Context7 / Sentry** を入れた | `.cursor/mcp.json` から **同機能の手動ブロックを削除**し、二重起動・認証の食い違いを防ぐ。 |
| まだ `mcp.json` に `context7` や `vercel` の URL がある | Marketplace 版と **重複しないか** Cursor の MCP 一覧で確認。重複なら片方を外す。 |
| エージェント指示文で古いサーバー名が出る | ツール呼び出しは **Cursor が表示しているサーバー識別子**に合わせる（例: 旧 `project-0-…-vercel` → Marketplace の `plugin-vercel-vercel`）。 |

`.cursor/mcp.json.example` は **Marketplace を使わない／補完したいときの手動例**（Windows では `npx` を `cmd /c` でラップ）です。`stripe` 等、Marketplace だけで足りるものは例に含めていない場合があります。

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

同様に、`context7`・`playwright`・`my_supabase_project`・`hourei`・`chrome-devtools` など **`command` が `npx` のもの**はすべて `command: "cmd"`、`args: ["/c", "npx", "-y", …]` 形式にする。**`uvx`（Serena）や URL 型（GitHub / Vercel）は通常そのままでよい**（`uvx.exe` はネイティブ実行ファイルのため）。**Marketplace 版の `plugin-*` は Cursor 側設定のため、このラップは不要**。

- 初回の `npx` プロンプトで止まるのを防ぐため、**`npx` には必ず `-y`** を付ける（例: `@supabase/mcp-server-supabase`、`@playwright/mcp@latest`）。

変更後は **Cursor を再起動**し、**Settings → Tools & Integrations → MCP** で各サーバーを確認する。

### PowerShell と `npm.ps1`（実行ポリシー）

PowerShell が **`npm.ps1` の読み込みがセキュリティ上ブロックされています`** と表示する場合、Node は入っていても `npm run dev` が失敗することがある。

**対処（いずれか）**

1. **現在のユーザーだけ**実行ポリシーを緩める（よくある設定）:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
   ```
   組織のグループポリシーで制限されている環境では失敗することがある。その場合は 2 に進む。
2. **`npm.cmd` を明示する**: `npm.cmd run dev`
3. **コマンドプロンプト (`cmd.exe`)** で npm を実行する。

### Cursor のインストール（Windows）

CLI の `curl … | bash` は **Linux / macOS 向け**で、PowerShell に `bash` が無い環境では使えない。Windows では次のどちらかが現実的である。

1. **[cursor.com](https://cursor.com/) の Windows インストーラを利用する。**
2. **winget**（パッケージ ID は **`Anysphere.Cursor`**。`Cursor.Cursor` は検索に出ない）。

```powershell
winget install --id Anysphere.Cursor -e
```

---

## 配置方針（Global とプロジェクト）

複数リポジトリで同じ GitHub アカウントを使う場合、**ブラウザ系など汎用サーバーは Global**、**Vercel / Supabase などアプリ単位のものは各リポジトリの `.cursor/mcp.json`** に分けると取り違えが減ります。**GitHub MCP は Global とプロジェクトのどちらか一方だけ**に置く（両方に同じ `github` エントリを重複させない）。

| 置き場所 | 対象の例 |
|----------|-----------|
| **Global**（`%USERPROFILE%\.cursor\mcp.json`） | （任意）全リポジトリ共通の `github`（PAT）のみ、など |
| **プロジェクト**（`.cursor/mcp.json`） | `chrome-devtools`、`hourei`（法令検索）、`vercel`、Supabase MCP、[Serena](https://oraios.github.io/serena/)、`github`（このリポジトリ専用）など |

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

## 法令検索 MCP（hourei-mcp-server）

[e-Gov 法令 API](https://laws.e-gov.go.jp/api/) を経由して日本の法令を検索・取得する MCP です。実装は npm パッケージ [`hourei-mcp-server`](https://www.npmjs.com/package/hourei-mcp-server)（[GitHub: groundcobra009/hourei-mcp-server](https://github.com/groundcobra009/hourei-mcp-server)、MIT）。

### Flight Academy での用途

- **`src/content/lessons/` の航空法規系 MDX**（例: `3.1.x`）の執筆・改稿時に、**現行条文**や**改正履歴**を Cursor 上で確認する（本番アプリから e-Gov を呼び出す構成ではない）。
- 教材は**公式学科試験の解答保証や法律相談**ではない立場のまま、e-Gov 由来の表現と**著者の要約**を混同しないこと（要約は「要約」と明記する）。

### 提供ツール

| ツール | 用途 |
|--------|------|
| `search_law` | 法令名・キーワードなどで検索（任意で `category`: 1 法律 / 2 政令 / 3 省令 等） |
| `get_law_data` | **`lawNum`（法令番号）**で全文に近い構造化データを取得。番号は `search_law` の結果から取得する |
| `get_law_revision` | 指定法令の改正履歴 |

### 設定例

[`.cursor/mcp.json.example`](../.cursor/mcp.json.example) に `hourei` エントリを同梱している（他の `npx` 系と同様の形）。

**Windows** では [「No tools」節](#windows-で-mcp-がno-toolsになる場合) のとおり、次の **`cmd` ラップ**を推奨する。

```json
"hourei": {
  "command": "cmd",
  "args": ["/c", "npx", "-y", "hourei-mcp-server"]
}
```

**macOS / Linux** や Windows で `npx` がそのまま動く場合は、example と同じ `command: "npx"` でよい。

### 手順と確認

1. `.cursor/mcp.json.example` を参考に、ローカルの `.cursor/mcp.json` の `mcpServers` に `hourei` を追加する（不要なら省略可）。
2. **`npx` には `-y`** を付けて初回プロンプトで止まらないようにする。
3. **Cursor を再起動**し、**Settings → Tools & Integrations → MCP** で `hourei` が接続済みか確認する。
4. 動作確認の例: `search_law` でキーワード「航空法」を検索し、結果の**法令番号**を `get_law_data` に渡す。

### 利用上の注意

- **e-Gov 法令 API の利用規約・レート制限・障害時の挙動**は [e-Gov 側の公開情報](https://laws.e-gov.go.jp/api/) に従う。API 不調時は教材の条文確認は別手段（法令検索サイトの人手確認など）を検討する。
- 記事本文に**長大な条文全文**を貼るより、必要な範囲の**抜粋**と [e-Gov 法令検索](https://laws.e-gov.go.jp/) への誘導を検討する（詳細は [`.cursor/rules/mdx-article-guide.mdc`](../.cursor/rules/mdx-article-guide.mdc) の航空法規節）。

### トラブルシューティング

- ツールが 0 件・サーバーが起動しない: 冒頭の **Windows + `cmd` + `-y`** を確認する。`hourei` も他の `npx` ベース MCP と同様である。

---

## Google Analytics MCP（任意・実験的）

Google 公式の [Analytics MCP サーバー](https://github.com/googleanalytics/google-analytics-mcp)（PyPI: `analytics-mcp`）は、**Google Analytics Admin API** と **Data API** 経由で **読み取り専用**のツール（`run_report`、`run_realtime_report`、`get_account_summaries` 等）をエージェントに公開する。概要は [Google Developers: Try the Google Analytics MCP server](https://developers.google.com/analytics/devguides/MCP?hl=ja) を参照。

### Flight Academy での位置づけ

- **タグ（`gtag` / `VITE_GA_MEASUREMENT_ID`）の代替にはならない**。ブラウザから `g/collect` が届いていない状態では、Data API のレポートも空に近くなる。収集パイプラインの切り分けは [docs/04_Operations_Guide.md](04_Operations_Guide.md)「GA4」を先に参照する。
- **用途の例**: プロパティ一覧の確認、過去期間の `screenPageViews` 等の有無確認、Cursor 上での自然言語による要約（データが蓄積されたあと）。

### 経路の比較（このリポジトリの推奨）

| 項目 | **ルート A（推奨・正）** | **ルート B（任意の代替）** |
|------|-------------------------|---------------------------|
| **実体** | 公式 [`google-analytics-mcp`](https://github.com/googleanalytics/google-analytics-mcp）（`pipx run analytics-mcp`） | コミュニティ製の **`npx` 系 MCP**（ npm に複数名前が並ぶ。**採用前に必ず実在・更新状況を確認**する） |
| **認証** | ADC（`gcloud auth application-default login` 等）または **サービスアカウント JSON をファイルに置き**、`GOOGLE_APPLICATION_CREDENTIALS` に **ファイルパス**のみ渡す運用が推奨 | 環境ごとに `GOOGLE_CLIENT_EMAIL` / `GOOGLE_PRIVATE_KEY` / プロパティ ID などを渡す案がノートに載ることがある。**`PRIVATE_KEY` の改行エスケープ崩れで失敗しやすい**。チャットやログに鍵が残さないこと |
| **設定の正本** | [`.cursor/mcp.json.example`](../.cursor/mcp.json.example) の `google-analytics-mcp` と本節 | リポジトリの example には **含めていない**（パッケージ名が固定できないため）。 `.cursor/mcp.json` に手で追加する場合は **ツール一覧に GA 関連が二重にならないよう、ルート A / B はどちらか一方だけ** にする |

**プロパティ ID と測定 ID（混同しない）**

- **`G-xxxx`（ウェブデータストリームの測定 ID）** — アプリの `VITE_GA_MEASUREMENT_ID` と一致させる単位。**タグ検証・Realtime はここが起点**。[04_Operations_Guide.md の GA4 節](04_Operations_Guide.md) のチェックリストと対応する。
- **プロパティ ID（数値、例 `123456789`）** — GA 管理画面のプロパティ設定で確認。Data API は多くの場合 **`properties/{property_id}`** 単位。**MCP がプロパティを指定するときはこちら**。測定 ID（`G-…`）と **入れ替えない**。

**ルート B のパッケージ名について**: 資料によって `npx -y @modelcontextprotocol/server-google-analytics` のように書かれた例があるが、このスコープ名のパッケージは **npm 登録なし（404）** であることを本リポジトリで確認済み（2026-05-05）。利用するなら **`npm search` / npm ページ / GitHub** で、採用するサーバー名を必ず確かめてから `mcp.json` に書く。

### 前提（ルート A）

1. **Python 3.10+** と [**pipx**](https://pipx.pypa.io/) をインストールする。
2. Google Cloud で **Google Analytics Admin API** と **Google Analytics Data API** を有効化する（[有効化手順](https://support.google.com/googleapi/answer/6158841)）。
3. [**Application Default Credentials (ADC)**](https://cloud.google.com/docs/authentication/provide-credentials-adc) を、`https://www.googleapis.com/auth/analytics.readonly` を含む形で設定する（OAuth デスクトップクライアント JSON ＋ `gcloud auth application-default login` 等）。手順の詳細は [公式 README（Setup instructions）](https://github.com/googleanalytics/google-analytics-mcp) と [セットアップ動画](https://www.youtube.com/watch?v=nS8HLdwmVlY)。
4. **サービスアカウント**を使う場合は JSON をファイルに保存し、**環境変数にはそのパスのみ**設定する（`private_key` 文字列を `mcp.json` の `env` にべた書きしない方が運用・ローテが楽であり、Windows の `\n` 問題も減る）。
5. 認証に使う Google アカウント（またはサービスアカウント）が、対象 GA4 プロパティに **閲覧者**以上でアクセスできること。

### ADC と Analytics スコープ（403 対策）

`gcloud auth application-default login` **だけ**だと、`analytics.readonly` が付かず **MCP の `get_account_summaries` が 403 `ACCESS_TOKEN_SCOPE_INSUFFICIENT`** になることがある。読み取りスコープを明示してやり直す。

```bash
gcloud auth application-default login --scopes="https://www.googleapis.com/auth/analytics.readonly,https://www.googleapis.com/auth/cloud-platform"
```

gcloud がデフォルトのクライアント ID によるスコープ制限について **WARNING** を出すとき、[GCP のトラブルシュート（ADC とスコープ）](https://cloud.google.com/docs/authentication/troubleshoot-adc#access_blocked_when_using_scopes) に沿い **自プロジェクトの OAuth デスクトップクライアント JSON** で ADC を構成するか、**サービスアカウント鍵 JSON** と GA4 でのアクセス許可で代替する。

#### **ブラウザで「このアプリはブロックされます」と出たとき**

`--scopes` 付きで `gcloud auth application-default login` した際、OAuth 画面上で Google により **第三者アプリへのスコープ付与が拒否**されることがある（スクショの「Google アカウントのプライベートな情報へのアクセス」をブロックする画面）。個人・アカウント種別により挙動は異なる。**GA のアクセス管理 UI がサービスアカウントのメールを受け付ける場合**は、**サービスアカウント鍵 JSON**が手堅い。**UI が `…iam.gserviceaccount.com` を拒否する**場合は、この節末尾の **OAuth デスクトップ**で自分の Gmail に ADC を張る方法を検討する。

手順の要約：

1. [GCP Console → IAM と管理 → サービスアカウント](https://console.cloud.google.com/iam-admin/serviceaccounts)（対象プロジェクト `GOOGLE_PROJECT_ID` と同一）で **サービスアカウントを作成**（名前は任意、例 `ga-mcp-readonly`）。
2. **鍵を追加**して **JSON をダウンロード**。ファイルは **Git に含めず**、`C:/Users/<自分>/.secrets/xxx.json` のようにユーザー配下のみに保存する。
3. [Google Analytics の管理画面](https://analytics.google.com/) で、対象 **GA4 プロパティ** → **プロパティのアクセス設定** で、サービスアカウントの **メールアドレス**（`...@...iam.gserviceaccount.com`）を **閲覧者** として招待する。**測定 ID（`G-…`）ではなく、このプロパティに紐づくアクセス一覧に追加する必要がある**。
4. `.cursor/mcp.json` の `google-analytics-mcp` で **`GOOGLE_APPLICATION_CREDENTIALS` をその JSON ファイルの絶対パス**に変更する（`/C:/.../` 形式可）。 **`GOOGLE_PROJECT_ID` は GCP のプロジェクト ID のまま**。
5. Cursor を再起動し、MCP を再度試す。

**GA の画面で「このメールアドレスは Google アカウントと一致しません」と出る場合**: プロパティのアクセス管理の入力欄が **人間用の Google アカウント（@gmail.com 等）だけ**を受け付け、**`…iam.gserviceaccount.com` を弾く**ことがある（Google 公式手順と矛盾する報告が 2024〜 以降もコミュニティにある）。次を試す。(1) **コピペの前後空白を削除**し、GCP の SA 詳細に表示されるメールと **一字一句一致**させる。(2) **アカウントのアクセス管理**（プロパティではなく **アカウント**側）から同じメールで **閲覧者**を付与する。(3) 別ブラウザ／シークレットで再試行。(4) いずれも不可なら、下記 **「ADC を自分用 OAuth クライアントで張る」**か、**Admin API で `accessBindings` を作成**する（管理者のユーザー OAuth が必要）など、**UI 以外の経路**を検討する。

**Google Workspace の組織アカウント**の場合は、組織の「低リスクまたは検証済みのアプリのみ」等のポリシーでも同種のブロックが出る。管理者による許可、またはサービスアカウント経路になることが多い。

#### **GA UI が SA を拒否するとき：ADC を「自分用 OAuth デスクトップ」で張る（推奨代替）**

サービスアカウントを GA の UI に追加できない場合、**プロジェクト管理者の Gmail（例: GA のプロパティ管理者）でログインしたユーザー OAuth** を ADC に保存し、MCP がそのトークンで Data API / Admin API にアクセスする。この場合 **GA に `…iam.gserviceaccount.com` は不要**で、**自分の Google アカウントに付いている GA の権限がそのまま使われる**。

**A. GCP（プロジェクトは `GOOGLE_PROJECT_ID` と同じ）**

1. [**OAuth 同意画面**](https://console.cloud.google.com/apis/credentials/consent): ユーザータイプ **外部**（個人 Gmail の場合）または **内部**（Workspace）。アプリ名など必須項目を埋める。スコープで **「一覧にないスコープを追加」**から次を追加する。  
   - `https://www.googleapis.com/auth/analytics.readonly`  
   - （推奨）`https://www.googleapis.com/auth/cloud-platform`  
   **公開ステータスが「テスト中」**なら、**テストユーザー**に **MCP で使う自分の Gmail アドレス**を必ず追加する。
2. [**認証情報 → 認証情報を作成 → OAuth クライアント ID**](https://console.cloud.google.com/apis/credentials): アプリケーションの種類 **デスクトップアプリ**。作成後、JSON をダウンロードする。中身は **`installed` キー**付きのクライアントシークレット（`client_id` / `client_secret`）である。
3. その JSON を **リポジトリ外**に置く（例: `C:\Users\<自分>\.secrets\ga-oauth-desktop-adc.json`）。**Git にコミットしない。**

**B. 端末（ブラウザ／対話が開く）**

PowerShell 例（パスは自分の場所に合わせる）。

```powershell
gcloud auth application-default login `
  --client-id-file="C:\Users\yusuke\.secrets\ga-oauth-desktop-adc.json" `
  --scopes="https://www.googleapis.com/auth/analytics.readonly,https://www.googleapis.com/auth/cloud-platform"
```

ブラウザで **同じ Gmail（GA 管理者）**にログインし、同意を完了する。その後、請求・クォータ用に（推奨）:

```powershell
gcloud auth application-default set-quota-project gen-lang-client-0986699229
```

実体の ADC ファイルは通常 **`%APPDATA%\gcloud\application_default_credentials.json`**（例: `C:/Users/yusuke/AppData/Roaming/gcloud/application_default_credentials.json`）に書かれる。

**C. `.cursor/mcp.json`**

- `GOOGLE_PROJECT_ID`: その GCP プロジェクト ID（例: `gen-lang-client-0986699229`）。  
- `GOOGLE_APPLICATION_CREDENTIALS`: 上記 **ADC の JSON パス**にする（**サービスアカウント用の鍵 JSON は使わない**）。  
保存後 **Cursor を再起動**する。

補助として、同じコマンド列の例はリポジトリの [`scripts/ga4-mcp-oauth-adc-login.example.ps1`](../scripts/ga4-mcp-oauth-adc-login.example.ps1) をコピーしてローカルだけで編集して使ってよい。

同意が通れば、**GA で既に管理者／閲覧者のあなた**の権限で、`get_account_summaries` などが空でなくなる想定である。

##### **OAuth 同意で 403 `access_denied` のとき**

公開前の **テスト** モードでは、**OAuth 同意画面のテストユーザー**に、ブラウザで同意する **Gmail と同じメール** を必ず追加する。未追加だと「Google の審査プロセスを完了していません」などと表示される。

##### **クォータプロジェクト（任意だが推奨）**

`gcloud auth application-default set-quota-project <GCP_PROJECT_ID>` は、当該 GCP プロジェクトで **Cloud Resource Manager API** が有効な必要がある。**`gcloud` の CLI 用アカウント**が未ログインだと `services enable` が失敗するので、先に `gcloud auth login` するか、[API ライブラリから有効化する](https://console.cloud.google.com/apis/library/cloudresourcemanager.googleapis.com)。

##### **ローカル疎通（Data API が返れば認証〜権限が揃っている）**

MCP ツール **`get_account_summaries`** が **空配列でない**こと、続けて **`run_report`**（例: 過去 7 日・`pagePath` × `screenPageViews`）がエラーなく行が返ることを確認する。トラフィックが極めて少ないプロパティでは行数が 0 に近くても、**API エラーでない**限りパイプラインは成立している。

### ローカル `mcp.json` のチェックリスト（共通）

実ファイル **`.cursor/mcp.json`** は `.gitignore` のためコミットされない。**[`.cursor/mcp.json.example`](../.cursor/mcp.json.example)** をワークスペースの `.cursor/mcp.json` に複製して編集する。

1. **`google-analytics-mcp`**（ルート A）ブロックで `GOOGLE_APPLICATION_CREDENTIALS` と `GOOGLE_PROJECT_ID` を実値にする（パスは Windows でも `C:/...` のスラッシュ推奨）。
2. **pipx / Python** が動く環境であることを確認する（ルート B のときは検証済み **`npx` パッケージ**のみ）。
3. **Cursor を再起動**し、**Settings → Tools & Integrations → MCP** でサーバーが接続済み（緑）、ツール一覧に GA / reporting 関連が出ることを確認する。
4. **疎通の考え方**: チャットで「過去 7 日の `screenPageViews` の上位ページ」のように **Data API が返すクエリ**を依頼し、結果がレポート側と整合するか見る。**タグ未設置で 0 に近い**のは異常というより収集側の問題のことが多い（[04](04_Operations_Guide.md) の GA4 チェックリストどおり）。

### Cursor への接続例（Windows・ルート A）

[`.cursor/mcp.json.example`](../.cursor/mcp.json.example) の `google-analytics-mcp` ブロックを参考に、ローカルの `.cursor/mcp.json` に追加する。

- `GOOGLE_APPLICATION_CREDENTIALS`: ADC の場合は `gcloud auth application-default login` 完了時に示される **JSON の絶対パス**、サービスアカウントの場合は **発行したキー JSON の絶対パス**。
- `GOOGLE_PROJECT_ID`: GCP の [プロジェクト ID](https://support.google.com/googleapi/answer/7014113)（公式 README の `env` 名に合わせる）。

**pipx** が PATH に無い場合は `where pipx` で確認する。`cmd` ラップは他のローカル MCP と同様。

### ルート B を `npx` で足すとき（構成の形だけ・コミット例なし）

採用するパッケージ名を自分で検証したうえで、例として次の **形**に近いブロックになることがある（環境変数名はサーバー README に従う）。**ルート A と同時には起動しない**こと。

```json
"your-verified-google-analytics-mcp": {
  "command": "cmd",
  "args": ["/c", "npx", "-y", "VERIFY_ON_NPM_BEFORE_USE"]
}
```

環境によっては `GOOGLE_CLIENT_EMAIL`、`GOOGLE_PRIVATE_KEY`、`GA_PROPERTY_ID`（数値プロパティ ID）等を `env` で渡す。`GOOGLE_PRIVATE_KEY` は PEM の改行を **`\\n` で 1 行に並べる**形式が多く、**エスケープを誤ると認証失敗**する点に注意する。

### セキュリティ

- **サービスアカウント JSON や ADC ファイルをリポジトリにコミットしない**。`.cursor/mcp.json` は `.gitignore` 済みのため、実パスはローカルのみに置く。
- 権限は **読み取り**に留める（MCP サーバーは設定変更不可だが、認証スコープも readonly を守る）。

### BigQuery エクスポート（別タスク）

GA4 を [BigQuery にリンクする](https://support.google.com/analytics/answer/9358801?hl=ja)運用は、**GCP 請求・アクセス権設計・コスト**が絡むため **本 MCP セットアップの必須範囲外**。必要になったときに別計画とする。

### トラブルシューティング

- **API not enabled**: Cloud Console で Admin API / Data API がその GCP プロジェクトで有効か確認する。
- **Permission denied**: GA4 管理画面で当該メール／サービスアカウントにプロパティアクセスがあるか確認する。
- **`get_account_summaries` が `[]`**: 認証は通っていても GA 側に権限が無い、または **ユーザー OAuth 未完了**のことがある。上記 **OAuth デスクトップ + ADC** または **プロパティへの SA 招待**を再確認する。
- 詳細は [google-analytics-mcp の Issues](https://github.com/googleanalytics/google-analytics-mcp/issues) を参照。

---

## 初回手順（このリポジトリ）

1. **プロジェクト**: **Marketplace で Supabase / Vercel / Context7 / Sentry を入れた場合**は、`.cursor/mcp.json` に同系統の手動エントリが残っていないか確認する（重複は削除）。手動のみの場合は `.cursor/mcp.json.example` を `.cursor/mcp.json` にコピーし、`SUPABASE_ACCESS_TOKEN`・`SUPABASE_PROJECT_ID`・Vercel の URL を埋める。例には **`chrome-devtools`**・**任意の `hourei`（法令検索）**・**任意の `google-analytics-mcp`（GA4 読み取り・pipx 要）**が含まれる（不要なら削除）。GitHub MCP を使う場合は [Personal Access Token](https://github.com/settings/personal-access-tokens/new) を `Authorization: Bearer …` に設定する（スコープは最小限）。**PAT はリポジトリにコミットしない。**
2. **Global（任意）**: 全リポジトリ共通の MCP だけ `%USERPROFILE%\.cursor\mcp.json` に置く。GitHub を **プロジェクトの `.cursor/mcp.json` にだけ**書く場合は、Global に `github` を重複させない。
3. Cursor を再起動する（GitHub リモート MCP は [Cursor v0.48.0+](https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-cursor.md) 推奨）。
4. **Settings → Tools & Integrations → MCP** で接続を確認。`chrome-devtools`・`hourei`（追加した場合）・**`google-analytics-mcp`（pipx と認証済み GCP を追加した場合）**が利用可能か、Vercel は `Needs login` から OAuth で認可する。

### Vercel の URL

- 汎用: `https://mcp.vercel.com`（初回は Cursor 側で **OAuth / Needs login** の認可が必要なことがある）
- プロジェクトに紐づける: `https://mcp.vercel.com/<team_id_or_slug>/<project_slug>`（[公式: project-specific](https://vercel.com/docs/mcp/vercel-mcp#project-specific-mcp-access)）。`team_…` の **Team ID** でも可。値は `npx vercel link` 後の `.vercel/project.json`（`orgId` / `projectName`）を参照。

### リモート MCP（GitHub / Vercel）でツールが 0 件のとき

- **Vercel（Marketplace の `plugin-vercel-vercel`）**: **Settings → MCP** でサーバーが有効か確認する。エージェントに `list_projects` 等が出てこない場合は **Cursor を再起動**するか、Marketplace で Vercel の **再接続 / ログイン**をやり直す（OAuth の期限切れがよくある）。
- **GitHub（Copilot API）**: `Authorization: Bearer <PAT>` の形式、PAT の期限・スコープ、組織の Copilot / MCP ポリシーを確認する。

### トラブルシューティング（GitHub）

- `Authorization header is badly formatted`: プレースホルダのままの PAT、または改行・余分なスペースが入っていないか確認する。**Fine-grained PAT** は先頭が `github_pat_` で **1 回だけ**である。コピペの誤りで `Bearer github_pat_github_pat_…` と **語頭が二重になると認証失敗する**ので、トークン先頭が **一度だけ `github_pat_`** になるよう直す。**PAT をチャットやスクリーンショットに載せず**、流出時は GitHub で即 **revoke** して再発行する。
- **ログに「`Incompatible auth server: does not support dynamic client registration`」がある**: Cursor が **OAuth の動的クライアント登録**で接続しようとして失敗していることがある。このリポジトリでは **`https://api.githubcopilot.com/mcp/` ＋ `streamableHttp` ＋ `headers.Authorization: Bearer <PAT>`** の手動 `mcp.json` 方式を正とする（下記「GitHub MCP を接続する（最短チェックリスト）」）。
- **Fine-grained PAT 作成時に「パスキーがありません」**: GitHub の本人確認がパスキーに寄っているだけで、ブラウザで **パスワードや「別の方法」** があればそちらに切り替える。または [Password and authentication](https://github.com/settings/security) で **パスキーをこのデバイスに登録**してからやり直す。
- **Settings → MCP が緑でもエージェントにツールが出ない場合**: Cursor を再起動したうえで、GitHub MCP サーバー識別子（例: `project-…-github`）を **Cursor が表示している名前**で呼ぶ。**動作確認**はエージェントから MCP ツール **`get_me`** を実行し、`login` が返るか見る。
- 組織で Copilot Business/Enterprise の場合、[About MCP](https://docs.github.com/en/copilot/concepts/about-mcp) のポリシー制約あり。

### GitHub MCP を接続する（最短チェックリスト）

1. **PAT を発行する**  
   [GitHub → Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens) で **Classic** または **Fine-grained** を作成する。用途に応じて `repo`（リポジトリ読み取り・操作）や `read:org` など**必要最小限のスコープ**にとどめる。
2. **`.cursor/mcp.json` にブロックを書く**（正本はローカルのみ。[`.cursor/mcp.json.example`](../.cursor/mcp.json.example) の `github` をコピー）。**`YOUR_GITHUB_PAT` のプレースホルダを実トークンに差し替える**（`ghp_…` / `github_pat_…` など）。
3. **`Authorization` ヘッダ**は次の形にする（**値は 1 行・前後の空白なし**）。  
   `"Authorization": "Bearer ghp_xxxxxxxx"` または Fine-grained の `"Authorization": "Bearer github_pat_xxxxxxxx"`（**`github_pat_` はトークン先頭につく 1 回だけ**。`Bearer` の後は**半角スペース 1 つ**＋トークン本体）
4. **重複登録を避ける**  
   [配置方針（Global とプロジェクト）](#配置方針global-とプロジェクト) のとおり、**Global の `%USERPROFILE%\.cursor\mcp.json` とプロジェクトの `.cursor/mcp.json` の両方に `github` を書かない**（片方だけ）。
5. **Cursor を再起動**し、**Settings → Tools & Integrations → MCP** で GitHub サーバーが緑／ツール一覧が表示されるか確認する。
6. **動作確認（任意）**  
   エージェントから GitHub MCP の **`get_me`** を実行し、**認証ユーザー**（`login` 等）が返ればトークンとゲートウェイは有効。**Fine-grained PAT** でも同様に動作する（2026-04 本リポジトリで確認済み）。

**リモート URL 型**（例: `https://api.githubcopilot.com/mcp/`）は **GitHub Copilot の MCP ゲートウェイ**向け。組織ポリシーや Copilot 契約でブロックされる場合は、[GitHub MCP Server のローカルインストール（Cursor）](https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-cursor.md) を検討する。

### GitHub MCP の代替（Docker）

[Install GitHub MCP Server in Cursor（Local Server Setup）](https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-cursor.md)。非推奨の `@modelcontextprotocol/server-github` は使わない。

---

## コミットメッセージ（英語）

プロジェクト規約ではコミットタイトルは **英語のみ**（Windows 文字化け対策）。詳細は [`.cursor/rules/git-conventions.mdc`](../.cursor/rules/git-conventions.mdc) と [Scripts_Repository_Tooling.md](Scripts_Repository_Tooling.md) を参照。
