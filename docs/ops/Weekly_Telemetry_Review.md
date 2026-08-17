# 週次テレメトリ・レビュー（GA4 + Sentry）

**正本**: 本書（別チャットの Agent はここを先に読む）  
**作成**: 2026-08-08  
**最終更新**: 2026-08-17（フェーズ2c L0。Slack Facts は日本語）  
**実施ペース**: **火曜 09:00 JST**（ISO 週: 月曜 00:00〜日曜 23:59、プロパティ TZ = Asia/Tokyo）。欠席週は行を飛ばさず「スキップ」理由を1行残す。**土曜に別窓で埋めない。**

関連:

| 用途 | 参照 |
|------|------|
| MCP・SA・secrets 正本 | [Cursor_MCP_Setup.md](../Cursor_MCP_Setup.md)「Google Analytics MCP」「ローカル secrets」 |
| タグ／Realtime／チャンク運用 | [04_Operations_Guide.md](../04_Operations_Guide.md)「GA4」「Sentry」 |
| Quiz Hub 単発ファネル | [`artifacts/quiz_hub_funnel_memo_2026-07-08.md`](../../artifacts/quiz_hub_funnel_memo_2026-07-08.md) |
| 週末コンテンツ | [ops/Weekend_Content_Pipeline.md](Weekend_Content_Pipeline.md)（土曜 Ingest / 日曜 Editorial。テレメトリとは分離） |
| Slack | `#fa-telemetry`（`C0BQ5R19QDV`） |

### 契約切替（2026-08-17）

- **旧窓**（W32/W33 ログ）: 土曜レビューのまま残す。数値を ISO 週で上書きしない。
- **新窓**: 初回は **2026-W34（2026-08-17〜08-23）を 2026-08-25 火** に記入。
- 旧窓と新窓を **前週比しない**。
- 数字取得は GitHub Actions（クラウドはローカル SA JSON を読まない）。要約・正本 PR はフェーズ2b。承認実行はフェーズ2c（L0 のみ。L1 許可リストは空）。
- **フェーズ1（完了）**: [`.github/workflows/weekly-telemetry-ga4.yml`](../../.github/workflows/weekly-telemetry-ga4.yml) が ISO 週 JSON を artifact に置く。Secret `GA4_SA_JSON`。ドライラン W33: [run 31998682755](https://github.com/ykagesg7/FlightEMS/actions/runs/31998682755)（正本には未記入）。
- **フェーズ2a（実装・検証済）**: [`.github/workflows/weekly-telemetry-notify.yml`](../../.github/workflows/weekly-telemetry-notify.yml) が GA4 成功後に `#fa-telemetry` へ **日本語** Facts を投稿する。`@` メンションなし。Secret `SLACK_WEBHOOK_URL`。
- **フェーズ2b（実装）**: Slack スレッドで人が Cursor をメンション → Skill [`weekly-telemetry-review`](../../.cursor/skills/weekly-telemetry-review/SKILL.md) が正本 PR を出す（merge しない）。Facts 下書きは `scripts/telemetry/format_ga4_review.py`。
- **フェーズ2c（L0 実装）**: スレッドの一行コマンドを [`.github/workflows/weekly-telemetry-approve.yml`](../../.github/workflows/weekly-telemetry-approve.yml) が実行する。`APPROVE-DOC` は `telemetry/YYYY-Www` かつ docs のみの PR を squash merge。`APPROVE T-xx` は **許可リスト空**のため no-op。受信は Vercel [`api/telemetry-approve.ts`](../../api/telemetry-approve.ts)（Slack Events。notify アプリには付けない）。未配線でも `gh workflow run weekly-telemetry-approve.yml` で人手起動できる。

### Slack 承認コマンド

レポート投稿の **スレッドに返信**する。一行・大文字。絵文字だけでは判定しない。未承認のまま次の火曜が来たら **実行しない**（fail-closed）。

| コマンド | 意味 | 段階 |
|----------|------|------|
| `APPROVE-DOC` | その週の正本 PR をマージしてよい | L0 |
| `APPROVE T-xx` | 許可リストの項目を実行してよい（例: `APPROVE T-03`） | L1（L2 は後段） |
| `SKIP T-xx` | その項目は今週やらない | — |
| `HOLD` | 今週は実行しない | — |
| `REJECT T-xx` | 提案を否定（ボードは open のまま） | — |

ボットが投稿するチャンネルを「全メッセージで発火」にしない。承認はキーワード付きスレッド返信のみ。2c の ACK はコマンド語を再掲しない。

### フェーズ2c の配線（一度）

1. **GitHub** に workflow `weekly-telemetry-approve` がある（L0）。手動なら `gh workflow run weekly-telemetry-approve.yml -f command=HOLD`。
2. **Slack アプリは notify と分ける。** Incoming Webhook の `fa-telemetry-notify` に Event Subscriptions を付けない。
3. 本番 Vercel に `SLACK_SIGNING_SECRET` と `GITHUB_TELEMETRY_DISPATCH_TOKEN`（fine-grained、`actions:write` のみ。contents は付けない）。
4. Request URL: `https://flight-lms.vercel.app/api/telemetry-approve`。Subscribe は bot event **`message.channels` のみ**。Save のあと **Install App で再インストール**する（Verified だけではメッセージが届かない）。チャンネルは `#fa-telemetry` のみ。`fa-telemetry-notify` には Event を付けない。
5. L1 を足すときは [`scripts/telemetry/l1_allowlist.json`](../../scripts/telemetry/l1_allowlist.json) を PR してから。T-03 の自動 resolve は再発中のため入れない。

---

## Agent 向け（最初の 30 秒）

1. **最新週**の節と、下の **オープン課題ボード**だけ読めば現状把握できる。
2. 新規分析後は **同じテンプレ**で週セクションを先頭（この節の直後）に追加し、ボードを更新する。
3. **生データ**（JSON・長い表）は `artifacts/` に置いてよい。本書には数値の要約と判断だけを書く。
4. 秘密情報・SA JSON・PAT は書かない。プロパティ ID・測定 ID・Sentry issue ID は書いてよい。

### 固定 ID

| 項目 | 値 |
|------|-----|
| 本番 URL | `https://flight-lms.vercel.app` |
| GA4 測定 ID | `G-22VFYSM69J` |
| GA4 プロパティ ID | `532610432`（Data API: `properties/532610432`） |
| GCP（クォータ／SA） | `gen-lang-client-0986699229` |
| SA（読み取り） | `ga-mcp-readonly@gen-lang-client-0986699229.iam.gserviceaccount.com` |
| SA 鍵パス（ローカル） | `%APPDATA%\FlightAcademy\secrets\ga-mcp-readonly.json` |
| Sentry org / project | `yusuke-kage` / `flight-academy` |

### 火曜の最小チェックリスト

1. **GA4**: Actions の artifact `ga4-<ISO週>`（なければローカル SA + Data API）。今週・前週の users / sessions / screenPageViews / engagedSessions。日次。上位 `pagePath`・記事パス・source/medium・device・landing。
2. **Sentry**: 直近 7d の error 件数、`is:unresolved lastSeen:-7d`、チャンク系（`FLIGHT-ACADEMY-4` 等）の最終発生。
3. **文書**: Skill `weekly-telemetry-review` → 下記テンプレで週節を追記 → オープン課題ボード更新 → docs-only PR（未マージ）。L0 はスレッドの `APPROVE-DOC`（2c）または人手マージ。必要なら [04](../04_Operations_Guide.md) へ運用変更のみリンク。

---

## オープン課題ボード（ローリング）

| ID | 課題 | 優先 | 状態 | 次アクション | 最終言及 |
|----|------|------|------|--------------|----------|
| T-01 | メール導線に UTM がなく GA 上ほぼ `(direct)` / Google ログイン referral | 中 | open | Brevo 週間ダイジェスト URL に `utm_source=brevo&utm_medium=email&utm_campaign=wNN` を検討。W33 は source が referral のみで切り出し不可 | W33 |
| T-02 | ボリュームが極小（週間 users 一桁）でファネル統計が不安定 | 低 | watch | W33 は **users 1**。配信・ドリップ継続しつつ質を見る。ALPM は別途 | W33 |
| T-03 | `/planning` stale chunk（`FLIGHT-ACADEMY-4`） | 中 | open | W33 で **再発**（Issues lastSeen 約 8/13）＋ GA `chunk_recovery_reload`×1。resolve 見送り・再監視 | W33 |
| T-04 | kebab slug メールリンク → 正規 ID リダイレクト | — | closed | W32 確認。W33 でも `turn-feedback-into-action` 着地あり | W33 |
| T-05 | **A2-a** 科目 default 5問 — subject 完走率の改善検証 | 高 | open | W36 ベースライン → W37–W38 計測 → W39 判定。イベント `quiz_session_start` / `complete` + `tab`。W33 に quiz イベント無し | W36 計画 |

---

## 週次テンプレート（コピー用）

```markdown
### YYYY-Wnn（開始日〜終了日 / レビュー実施日）

**データ取得**: GA4 MCP | SA+Data API / Sentry MCP | UI  
**比較**: 直前の ISO 週のみ（旧土曜窓とは比べない）

#### 現状（Facts）

- 全体: users / sessions / PV / engaged（前週比）
- 日次の山（メール日・ドリップ日など）
- 記事・ランディング上位（正規 URL / kebab の有無）
- 流入・端末
- Sentry: 7d 件数・主な issue・最終発生

#### 課題（Issues）

- …

#### 解決案（Actions）

- [ ] …（担当・期限があれば併記）
- ボード更新: T-xx …

#### メモ / 生データ

- `artifacts/…`（任意）
```

---

## 週次ログ（新しい週が上）

### 2026-W33（2026-08-09〜08-15 / レビュー 2026-08-17）

**データ取得**: SA + Google Analytics Data API / Sentry MCP（Issues）  
**比較**: 前週 W32（当初メモ値。再取得では W32 が users 7 / sess 12 / PV 62 に更新されており遅延帰属あり）  
**文脈**: 土曜午前レビューを欠席し月曜に実施。シリーズ 4.2.x（フィードバック）のドリップ想定。週間メールの月曜スパイクは W32 ほど目立たず。

#### 現状（Facts）

| 指標 | W33 | W32（当初メモ） |
|------|----:|----------------:|
| activeUsers | **1** | 5 |
| sessions | **4** | 9 |
| screenPageViews | **25** | 59 |
| engagedSessions | **3** | 6 |

- **日次**: 08/10 users 1 / sess 2 / PV 11。08/12 sess 1 / PV 13。08/13 sess 1 / PV 1。09・11・14・15 は行なし。
- **記事**: `/articles` PV 9。正規 `4.2.1` / `4.2.2` / `4.2.3` 各 PV 2。kebab `turn-feedback-into-action` PV 1（ランディング 1＝メール／共有経路の痕跡）。
- **流入**: `accounts.google.com / referral` のみ（4 sessions / 1 user / PV 25）。`(direct)` なし → UTM 無しでもメール切り出し困難（T-01）。
- **端末**: mobile のみ。
- **その他ページ**: `/` PV 6、`/planning` PV 3。
- **カスタムイベント**: `chunk_recovery_reload`×1（1 user）。quiz_* は W33 期間 **0**。
- **Sentry**: 未解決で直近活動ありは [FLIGHT-ACADEMY-4](https://yusuke-kage.sentry.io/issues/FLIGHT-ACADEMY-4) のみ。Issues 上 **lastSeen 約 4 日前（〜08/13）**・events 表記 1。W32 時点の「記事週は静か」から **再発**。Discover イベント検索は空振りあり → Issues メタを正とする。

#### 課題（Issues）

1. トラフィック急減（users 1）。週次比較のノイズが大きい（T-02）。
2. 流入が Google ログイン referral 一色でメール効果が見えない（T-01）。
3. planning チャンクが再発し、リカバリイベントも発火（T-03）。
4. quiz 計測がこの週ゼロ — A2-a（T-05）のベースラインにはまだ使えない。

#### 解決案（Actions）

- [ ] T-01: 次のダイジェスト送信前に UTM 付与を実装検討（承認後）。
- [ ] T-03: resolve しない。次回（W34）で lastSeen / `chunk_recovery_reload` を再確認。頻発なら SW / lazy chunk の追加対策を検討。
- [ ] T-05: W36 までボード維持。W33 は quiz ゼロのためベースライン対象外。
- [x] T-04: W33 でも kebab 着地を再確認 → closed 維持。

#### メモ / 生データ

- [`artifacts/ga4_w33_report.json`](../../artifacts/ga4_w33_report.json)（ローカル生成・コミット任意）

---

### 2026-W32（2026-08-03〜08-08 / レビュー 2026-08-08）

**データ取得**: SA + Google Analytics Data API（MCP は SA 移行直後のためスクリプト疎通を正） / Sentry MCP  
**比較**: 前週 2026-07-27〜08-02  
**文脈**: 週間記事ダイジェスト「訓練の当たり前」配信（月）。W32 シリーズ 4.1.1→4.1.2→4.1.3 の日次ドリップ。kebab→正規 ID 修正デプロイ済み。

#### 現状（Facts）

| 指標 | W32（〜08/08） | 前週 |
|------|---------------:|-----:|
| activeUsers | 5 | 6 |
| sessions | 9 | 14 |
| screenPageViews | 59 | 46 |
| engagedSessions | 6 | 8 |

- **日次**: 08/03（月・配信）users 5 / sess 6 / PV 38 → 以降は静穏（火〜木は各 1 セッション前後。07–08 は当該取得時点で行なし）。
- **記事**: 一覧 `/articles` PV 28。正規 `4.1.1_ChoresAreTheJob` PV 15。kebab `chores-are-the-job` PV 4（ランディングあり＝メール経路）。`4.1.2` / `4.1.3` と各日ドリップ整合。
- **流入**: `accounts.google.com / referral`（ログイン経由・回遊濃い）、`(direct)/(none)`（メール想定・UTM なし）。
- **端末**: mobile 8 / desktop 1。
- **Sentry**: 7d error イベント **5**。未解決で直近活動ありは [FLIGHT-ACADEMY-4](https://yusuke-kage.sentry.io/issues/FLIGHT-ACADEMY-4)（`/planning` module script）のみ。最終発生は約 5 日前（記事週の新規クラッシュは目立たず）。

#### 課題（Issues）

1. メール効果をソース別に切り出せない（T-01）。
2. サンプルが小さく週次の増減はノイズになりやすい（T-02）。
3. planning チャンク issue が unresolved のまま残存（T-03）。

#### 解決案（Actions）

- [ ] T-01: 次の週間ダイジェスト送信前に UTM 付与を実装検討（コード変更は別タスク・承認後）。
- [ ] T-03: 次回レビューで `lastSeen` を再確認。7 日無ければ Sentry で resolve。
- [x] T-04: リンク切れ修正済み・W32 で kebab 着地を確認 → closed。
- secrets / SA / 空 GCP プロジェクト整理は 2026-08-08 実施済み（手順正本は [Cursor_MCP_Setup.md](../Cursor_MCP_Setup.md)）。

#### メモ / 生データ

- 任意 JSON: [`artifacts/ga4_w32_report.json`](../../artifacts/ga4_w32_report.json)（ローカル生成・コミット任意）

---

## 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-08-17 | ISO 週・火曜切替。フェーズ1 GA4 artifact。フェーズ2a 日本語 Facts（メンションなし）。フェーズ2b Skill `weekly-telemetry-review`（正本 PR・未マージ）。フェーズ2c L0（`APPROVE-DOC` squash merge、L1 リスト空）。 |
| 2026-08-08 | 初版。土曜午前運用・テンプレ・オープン課題ボード・W32 記入。 |
