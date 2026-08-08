# 週次テレメトリ・レビュー（GA4 + Sentry）

**正本**: 本書（別チャットの Agent はここを先に読む）  
**作成**: 2026-08-08  
**最終更新**: 2026-08-08（W32 初回記入）  
**実施ペース**: **土曜午前**（週末コンテンツ枠と同週。欠席週は行を飛ばさず「スキップ」理由を1行残す）

関連:

| 用途 | 参照 |
|------|------|
| MCP・SA・secrets 正本 | [Cursor_MCP_Setup.md](../Cursor_MCP_Setup.md)「Google Analytics MCP」「ローカル secrets」 |
| タグ／Realtime／チャンク運用 | [04_Operations_Guide.md](../04_Operations_Guide.md)「GA4」「Sentry」 |
| Quiz Hub 単発ファネル | [`artifacts/quiz_hub_funnel_memo_2026-07-08.md`](../../artifacts/quiz_hub_funnel_memo_2026-07-08.md) |
| 週末コンテンツ | [ops/Weekend_Content_Pipeline.md](Weekend_Content_Pipeline.md) |

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

### 土曜の最小チェックリスト

1. **GA4**（MCP または SA + Data API）: 今週・前週の users / sessions / screenPageViews / engagedSessions。日次。上位 `pagePath`・記事パス・source/medium・device・landing。
2. **Sentry**: 直近 7d の error 件数、`is:unresolved lastSeen:-7d`、チャンク系（`FLIGHT-ACADEMY-4` 等）の最終発生。
3. **文書**: 下記テンプレで週節を追記 → オープン課題ボード更新 → 必要なら [04](../04_Operations_Guide.md) へ運用変更のみリンク。

---

## オープン課題ボード（ローリング）

| ID | 課題 | 優先 | 状態 | 次アクション | 最終言及 |
|----|------|------|------|--------------|----------|
| T-01 | メール導線に UTM がなく GA 上ほぼ `(direct)` / Google ログイン referral | 中 | open | Brevo 週間ダイジェスト URL に `utm_source=brevo&utm_medium=email&utm_campaign=wNN` を検討 | W32 |
| T-02 | ボリュームが極小（週間 users 一桁）でファネル統計が不安定 | 低 | watch | 配信継続しつつ、記事着地＋回遊の質を見る。ALPM イベントは別途 | W32 |
| T-03 | `/planning` stale chunk（`FLIGHT-ACADEMY-4`） | 中 | watch | 対策済想定。**7 日新規イベント無しなら resolve 候補**（[04](../04_Operations_Guide.md) 基準） | W32 |
| T-04 | kebab slug メールリンク → 正規 ID リダイレクト | — | closed | `findArticleByRouteParam` + canonical 先解決。W32 で kebab 着地を観測 | W32 |

---

## 週次テンプレート（コピー用）

```markdown
### YYYY-Wnn（開始日〜終了日 / レビュー実施日）

**データ取得**: GA4 MCP | SA+Data API / Sentry MCP | UI  
**比較**: 前週 YYYY-Wnn-1

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
| 2026-08-08 | 初版。土曜午前運用・テンプレ・オープン課題ボード・W32 記入。 |
