# 作業分担（どこで誰が何をするか）

**作成**: 2026-09-23  
**役割**: 実行場所ごとの担当と境界の正本。手順の詳細は各 ops 文書と Skill に委ねる。

正本の置き場所は1つずつ: repo `docs/` = 戦略・仕様・運用、Cursor Project の Context = 現行の計画と状況、Obsidian = 素材と週次弧、git = 経緯。

---

## 1. 一覧

| 実行場所 | やる | やらない |
|----------|------|----------|
| **Cursor Project（クラウド）** | 実装、PR、SQL、MDX 確定稿、Vercel / Supabase / GitHub の操作、週次 digest の確定 | main へのマージ（ユーザーが明示したときだけ）、Obsidian の読み書き |
| **ローカル Cursor（Desktop）** | 土曜 Ingest・日曜 Editorial（Obsidian MCP）、Desktop での pull | 本番 SQL の確定、PR のマージ |
| **GrokBot** | Inspector（本番観測）、Growth（需要・告知文案）、家老（軍議パイプラインの進行管理）、斥候（法令・通達の巡回） | コード、SQL、MDX 本文、マージ、安全の最終判断 |
| **GitHub Actions + Slack** | 火曜の週次テレメトリ（GA4 artifact → Facts 通知 → docs PR）。人は `#fa-telemetry` スレッドで `APPROVE-DOC`。PR の機械検分 `mekiki-ci`（結果を `#fa-gungi` に通知） | 週次テレメトリの Grok への移管 |
| **Vercel Cron** | 記事の日次公開 `article-publish-sync`（毎日 00:10 JST）、週次 digest（日曜 17:00 / 月曜 07:00 JST）、cohort 週次（日曜 09:00 JST） | スケジュールの無断変更 |

## 2. Cursor Project（クラウド）

- 記事は `articlePublishSchedule` と MDX を同じ PR に入れる。schedule だけ先に足さない。
- 公開確認は Skill [`article-publish-check`](../../.cursor/skills/article-publish-check/SKILL.md)。人手で `is_published` を回さない。
- クラウドからは Obsidian の Vault が見えない。クリップや Ideas を捏造せず、ローカル Editorial の結果（`approved` 済みの弧）だけを前提にする。
- 週次テレメトリの docs PR を CI が作れなかった週だけ、この Project が復旧する（W38 の [#27](https://github.com/ykagesg7/FlightEMS/pull/27) と同じ）。Sentry 追記は任意 Skill [`weekly-telemetry-review`](../../.cursor/skills/weekly-telemetry-review/SKILL.md)。

## 3. ローカル Cursor

- 土曜 Ingest → Skill [`weekend-ingest`](../../.cursor/skills/weekend-ingest/SKILL.md)、日曜 Editorial → Skill [`weekend-editorial`](../../.cursor/skills/weekend-editorial/SKILL.md)。契約は [Weekend_Content_Pipeline.md](Weekend_Content_Pipeline.md)。
- Obsidian MCP の設定は [Cursor_MCP_Setup.md](../Cursor_MCP_Setup.md)「Obsidian MCP」（Global `mcp.json`）。
- Windows self-hosted worker には週末パイプラインを載せない（Cursor ABI の不具合が直るまで）。

## 4. GrokBot（Inspector / Growth / 家老 / 斥候）

役割はこの4つで固定（2026-10-03 改訂。家老・斥候を追加）。5本目（Grok 編集長など）を足さない。Growth の「需要」と Inspector の「ファクト（モード D）」は混ぜない。家老・斥候もコード・SQL・MDX 本文は書かない。

| チャット | やる | やらない |
|----------|------|----------|
| **Inspector** | 本番 `https://flight-lms.vercel.app` の観測。モード A（匿名の公開パス）/ B（ログイン後）/ C（Network + Console）/ D（1本のファクトチェック） | コード、パッチ、SQL、修正案、航空法・運航の最終判断、推測で欄を埋めること |
| **Growth** | X 上の需要メモ、1行フック、構成見出し案、告知文案 | 完成 MDX、YAML、slug の確定、公開日の捏造、T-4 URL、利用者数を盛ること、合格保証 |

**需要とフックは Grok、記事の正本は Cursor。** Grok はリポジトリの MDX 契約（ESM `export const meta`、CP の口調・PREP）を見ないため、本文を書かせない。

Cursor が Grok に毎回渡すもの:

1. URL（既定は本番。Preview は SSO のため匿名確認に使わない）
2. アカウント種別（匿名・未購入 / ログイン学習者。資格情報はユーザーが Grok に直接渡す）
3. 触るなリスト（[Closed_Sprints.md](../Closed_Sprints.md) §2 から該当分）
4. 直前 PR または「未デプロイ」
5. 目的1行（「全部見て」は禁止）
6. Growth のときは今週公開の slug / タイトル / hook（`articlePublishSchedule` から）。無ければ「架空の公開を書くな」。CTA は Articles または FA Public Wiki のみ

貼り戻し: ユーザーが Grok の出力を原文で Cursor Project に貼る。Inspector の HIGH は Cursor が PR にする（Grok のパッチは採用しない）。Growth の需要メモは日曜 Editorial の材料。

### 4.1 家老・斥候（軍議パイプライン）

仕様の正本は `gungi/SPEC.md`（戦国軍議プロトコル）。

| 役 | やる | やらない |
|----|------|----------|
| **家老** | `gungi-task` Issue の起票（`.github/ISSUE_TEMPLATE/gungi-task.md` 準拠）、Cursor クラウドエージェントの起動、`mekiki-ci` の結果監視、三振管理（`strike:1` → `strike:2` → `status:stalled`）、`#fa-gungi` への報告、戦況の要約（求められたとき） | コード・SQL・MDX 本文、PR のマージ、`golden-change-approved` の付与、ゴールデン期待値の記入、本番 SQL の実行 |
| **斥候** | 航空法・施行規則（e-Gov）、航空局の通達・AIC、磁気偏差の基準改訂の定期巡回。差分の原文・URL・取得日時を家老に渡す（`scout` + `needs-source`） | 条文の解釈、ライブ NOTAM の巡回、差分がないときの起票 |

- 三振は Issue のラベルで数える。`status:stalled` の Issue には自動で再依頼しない。再開はユーザーが `status:ready` に戻したときだけ。
- 斥候のスナップショットはリポジトリにコミットしない（Grok の作業環境に保存）。
- 家老が渡す Issue は Cursor Project への入力そのもの。上の「Cursor が Grok に毎回渡すもの」とは逆向きで、Inspector / Growth の運用は変えない。

システムプロンプト全文と A〜D の毎回プロンプトは Cursor Project の Context（`docs/grokbot-roles.md`）に置く。資格情報はどちらにも書かない。

## 5. GitHub Actions + Slack

正本は [Weekly_Telemetry_Review.md](Weekly_Telemetry_Review.md)。`weekly-telemetry-ga4` → `weekly-telemetry-notify`（日本語・`@` なし）→ `weekly-telemetry-draft-pr` → `weekly-telemetry-approve`（`APPROVE-DOC` で L0 マージ）。L1 の許可リストは空。

## 6. Vercel Cron

設定は `vercel.json`、処理は `api/cron.ts`（`?job=`）。記事の公開日は `api/_lib/articlePublishSchedule.ts` と MDX の `publishedAt`（JST）。運用は [05_Content_Pipeline.md](../05_Content_Pipeline.md) §1。
