---
name: verify-flightems
description: >-
  FlightAcademy（FlightEMS）の Web 画面を利用者と同じ手順で動かし、
  スクリーンショット・Network・Console・DB 読取（非本番のみ）を証拠に残す。
  ローカル開発サーバーまたは Vercel Preview 専用。本番 DB への書き込みはしない。
  Triggers: 画面検証, playtest, 動作確認, verify flightems, ログインモード確認.
disable-model-invocation: false
---

# Verify FlightEMS（画面・学習記録の動作確認）

コード突き合わせの基準コミット: **`d2352e0`**（`main`）。

物見番の機能地図は [`features/README.md`](features/README.md)。各機能の手順・合格／不合格／判断不能は `features/*.md` を正とする。記事のドリップ公開・`is_published` 照合は **[`article-publish-check`](../article-publish-check/SKILL.md)** の担当（重ねない）。

## 全体の決まり（全フローに効く）

1. **動かす先はローカルか Vercel Preview だけ。** 本番 `https://flight-lms.vercel.app` には書き込まない。匿名での読み取りだけが必要なときは本番 URL を開いてもよいが、記録系（F2 ログイン、F3 記事操作、F3・F4 の DB 確認、F5）は本番 DB に触れるため **既定では未確認** とする（決まり事6・軍師裁定 B）。
2. **Supabase の接続先は値を読まず、ホスト名だけを見る。** `VITE_SUPABASE_URL` のホストが本番プロジェクト `fstynltdfdetpyvbrswr` なら、次は **書き込み手順を行わず「未確認（本番 DB）」** と報告する: F2 ログイン（`profiles` への insert の道）、F3 記事を開く操作（`learning_content_views` への insert）、F3・F4 の DB 読取・記録確認、F5 一式。上様か FA 軍師がその実行ごとに指定したときだけ、テスト学習者で行ってよい（決まり事6の例外）。
3. テスト学習者の資格情報は置き場所 `/workspace/gungi/flightacademy/test_learner_login.txt` の名前だけを書く。中身は PR・チャット・証拠に写さない。
4. 秘密（トークン、Cookie 全文、パスワード、セッション JSON）は証拠に残さない。HAR は Cookie と Authorization を除去してから保存する。
5. 直し方・SQL・設定変更は書かない。見えたことだけを書く。
6. `vercel.json` と `gungi/golden-tests` には触らない。
7. 管理者画面（`/admin` 系）は対象外。
8. profiles 埋め込み問い合わせの 401 は仕様（権限なし）。すぐバグ扱いしない。

### このスキルが見ない項目（任せ先）

| 項目 | 任せ先 |
|------|--------|
| DB の `title`・`description` と MDX `meta`／公開スケジュールの食い違い | [`article-publish-check`](../article-publish-check/SKILL.md) に足す候補（今回の PR では変更しない） |
| 太字の表示崩れ、禁止語、スタブ | 公開前の目付番の目視、または CI の機械点検 |
| 無料と有料のゲート（`learning_contents.is_freemium`） | **今回の verify-flightems の範囲外**。専用スキル・手順は未整備 |
| F3 の公開可否・日付の原因切り分け | `article-publish-check`。F3 は **利用者として読む流れだけ** |

## Launch（空のデータから使える状態まで）

### 前提（リポジトリルート）

```bash
npm ci
cp .env.example .env.local
```

`.env.local` に設定する **変数名だけ**（値はコミット・ログ・PR に書かない）:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SPIRAL_LMS_ENABLED`（F5 用。`npm run dev` かつ `src/utils/spiralLmsFeature.ts` で DEV のときだけ有効）

**このリポジトリ単体では** ローカル Supabase スタックやシード SQL の自動適用はない〔計測〕。空のマシンから「DB 付きで全部動く」状態には、別途非本番 Supabase プロジェクトとシードが必要〔推定〕。資格情報が無いときは Doctor で止め、書き込み系はすべて **判断不能／未確認** とする。

### (a) 開発サーバー（F5 必須）

```bash
npm run dev
```

既定は `http://127.0.0.1:5173`（Vite）。準備完了: トップが表示され、ヘッダーに LOGIN またはユーザー名が見える。

### (b) 本番相当ビルド + preview（Playwright と同じ）

```bash
npm run build && npx vite preview --host 127.0.0.1 --port 5174 --strictPort
```

`playwright.config.ts` の `webServer` と同じ〔計測〕。F5 の `/dev/spiral-lms` は **production のビルドに含まれない**（`!import.meta.env.DEV` のとき `buildSpiralLmsDevRoutes` はルートを返さず、`isSpiralLmsFeatureEnabled` も false — `src/utils/spiralLmsDevRoutes.ts`、`src/utils/spiralLmsFeature.ts`）。

### (c) Vercel Preview

PR の Preview URL。`vite.config.ts` はビルド時に `VITE_SUPABASE_*` をバンドルへ埋め込む〔計測〕。Preview デプロイが **どの Supabase プロジェクトを指すか**は、Vercel の Project → Settings → Environment Variables の **Preview** 行と、ビルドに使われたブランチの組み合わせで決まる。エージェントが Dashboard を見られない場合は **未確認** とし、書き込み系は未確認のままにする。確認できるときは、Preview を開いたブラウザの Network で最初の `*.supabase.co` リクエストのホストだけを記録し、本番 ref と一致するか Doctor の判定に使う（URL 全文・anon key は保存しない）。

### Teardown

自分が起動した `vite` / `vite preview` だけを止める（プロセス名での一括 kill はしない）。ログアウトする。証拠ディレクトリは消さない。

## Isolate（二つ並べて動かせるか）

| 組み合わせ | 可否 | 理由 |
|------------|------|------|
| `npm run dev`（5173）と preview（5174） | **可** | ポートが異なる〔計測〕 |
| 二つの `npm run dev` | **不可**（同一ポート） | どちらか一方だけ。既存 dev を再利用するか、ポートを変える |
| 二インスタンス + 同じ Supabase | **DB は共有** | 学習記録・クイズ結果は同一 DB に書かれる。並列検証用のデータ分離はない〔推定〕 |
| 二つのブラウザプロファイル | UI は分離可 | DB 副作用は共有のまま |

並列で二系統を「完全に独立」させることは **できない**（共有 Supabase 前提）。同時に二つ動かす必要があるときは、非本番 DB を分けるか、順番に実行する。

## Doctor（読み取り専用）

1. URL が `localhost` / `127.0.0.1` / 確認済み Preview で、検証用に起動したインスタンスである。
2. `package.json` の `dev` / `build`+`preview` のどちらで起動したか（F5 は dev 必須）。
3. **Supabase が本番か**（ホスト名だけ。URL や key は表示しない）。リポジトリルートで:

```bash
node --input-type=module -e "
import { config } from 'dotenv';
config({ path: '.env.local' });
const raw = process.env.VITE_SUPABASE_URL ?? '';
let host = '';
try { host = new URL(raw).hostname; } catch { /* empty */ }
const prodRef = 'fstynltdfdetpyvbrswr';
const matchesProd =
  host === prodRef ||
  host === prodRef + '.supabase.co' ||
  host.endsWith('.' + prodRef + '.supabase.co');
console.log(
  host
    ? 'supabase_host_matches_production: ' + (matchesProd ? 'yes' : 'no')
    : 'supabase_host_matches_production: unknown'
);
"
```

`yes` なら書き込み系は **未確認** で止める。Preview だけを触る場合は (c) の手順でホストを得て同じ判定をする（得られなければ **未確認**）。
4. ヘッダーが未ログイン（LOGIN）かログイン済みか。
5. （任意）`git rev-parse HEAD` が想定コミット付近か。

## Drive

既存 Playwright（`e2e/`、`PLAYWRIGHT_BASE_URL` 既定 `http://127.0.0.1:5174`）を優先する。手動または MCP ブラウザでもよいが、目印は **role + name**、`data-testid`（例: `ppl-pool-count`、ボタン「10問診断を開始」）〔計測〕`e2e/test-exam-ppl.spec.ts`。

機能ごとの手順は `features/` の「Driving it with Playwright」に従う。

### Console の注意

production モードでは Terser の `compress.drop_console` が有効（`vite.config.ts` の `build.terserOptions.compress.drop_console`、`mode === 'production'`）〔計測〕。Preview / `vercel-build`（`--mode production`）では Console が空でも「エラーなし」の証拠にならない〔推定〕。Network の状態と画面文言を正とする。

## Evidence

- 置き場所: **`artifacts/verify-flightems/<YYYYMMDD-HHmmJST>/<機能ID>/`**
- リポジトリにはコミットしない（`.gitignore` 済み）。
- 各機能: スクリーンショット、Network 表（URL・メソッド・状態・件数・応答の形）、Console 全文（dev のみ信頼）、DB 読取結果（F3・F4・非本番のみ）。
- 報告は `gungi/report_format.md` があればその4点検。根拠に〔計測〕〔推定〕〔推測〕を付ける。

## Cleanup

起動した dev / preview プロセスのみ停止。ログアウト。`artifacts/verify-flightems/` は残す。

## Helpers

初期版はヘルパースクリプトなし。足すときは SKILL 本文に実行方法を書く。

## 機能一覧

| ID | ファイル | 本番入口 |
|----|----------|----------|
| F1 | [home-announcements.md](features/home-announcements.md) | あり |
| F2 | [auth-login.md](features/auth-login.md) | あり |
| F3 | [article-read-progress.md](features/article-read-progress.md) | あり |
| F4 | [quiz-hub.md](features/quiz-hub.md) | あり |
| F5 | [spiral-lms-dev.md](features/spiral-lms-dev.md) | **なし**（dev のみ） |

## 初回セットアップ後の証明

スキル追加・更新 PR では、上記 Launch → Doctor → F1〜F5 を **一度ずつ** 試し、PR 本文に合格／不合格／判断不能と証拠パス（コミットしない）を書く。DB 資格情報が無い項目は判断不能と明記する。
