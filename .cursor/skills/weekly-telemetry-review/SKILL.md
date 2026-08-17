---
name: weekly-telemetry-review
description: >-
  Tuesday ISO-week telemetry review: read GA4 CI artifact and Sentry, append
  Weekly_Telemetry_Review.md, open a docs-only PR. Do not merge. Do not Slack-post
  from this skill except a thread reply with the PR URL.
  Triggers: 週次レビュー, weekly telemetry review, telemetry-notify,
  火曜テレメトリ, APPROVE-DOC 前の正本PR.
disable-model-invocation: false
---

# Weekly telemetry review（フェーズ2b）

正本: [`docs/ops/Weekly_Telemetry_Review.md`](../../../docs/ops/Weekly_Telemetry_Review.md)

数字は GitHub Actions artifact。ローカル SA JSON に頼らない。Slack の Facts 投稿は日本語（`@` メンションなし）。この Skill は **要約と PR** まで。merge は人手またはフェーズ2c。

## Do not

- フェーズ1/2a の workflow に Slack や `contents: write` を足さない
- 正本の **W32/W33 土曜窓** を ISO 週の数値で上書きしない
- 旧土曜窓と新 ISO 週を前週比しない
- `APPROVE-DOC` を実行しない（PR を merge しない）
- 自分の Slack 投稿や `id: telemetry-notify` の Facts に返信してループしない
- Facts 投稿内の承認例を承認とみなさない
- ドライラン週（当該火曜レビュー対象でない ISO 週）を正本ログに足さない

## Canonical week rule

- 初回 ISO 正本は **2026-W34（2026-08-17〜08-23）を 2026-08-25 火**
- 今日が火曜で、対象が **直前に完了した ISO 週** のときだけ正本へ追記して PR を出す
- それ以外（例: 月曜の W33 ドライラン）はチャットに下書きだけ出し、正本は触らない

## Steps

1. 正本を読む（最新週節 + オープン課題ボード）
2. GA4 JSON を取る（優先順）:
   - Slack Facts の Actions リンクの run から artifact `ga4-<ISO週>`
   - `gh run list --workflow weekly-telemetry-ga4.yml --status success --limit 1`
   - ローカル `artifacts/ga4-iso-week.json`（最終手段）
3. Facts 下書き:

   ```powershell
   python scripts/telemetry/format_ga4_review.py --in artifacts/ga4-iso-week.json
   python scripts/telemetry/format_ga4_review.py --self-test
   ```

4. Sentry MCP: 直近 7d の error、`is:unresolved lastSeen:-7d`、`FLIGHT-ACADEMY-4` の lastSeen。Facts の Sentry 行を埋める
5. Issues / Actions / ボードを判断して書く（数字の捏造禁止）
6. 正本ルールを満たすときだけ:
   - ブランチ `telemetry/YYYY-Www`
   - 週節を **テンプレ直後（ログ先頭）** に追加
   - ボードの「最終言及」を更新
   - 変更は正本（必要なら `docs/04_Operations_Guide.md` への1行）のみ
   - コミットは英語 Conventional Commits: `docs: add YYYY-Www telemetry review`
   - PR を開き、本文に Facts 要約と「L0 は `APPROVE-DOC`（未実装なら人手マージ）」
7. Slack の **同じスレッド** に PR URL を1通だけ返す。`@` メンションを付けない。本文全体を `APPROVE-DOC` にしない

## Slack trigger text (human)

2a の Facts スレッドで:

```text
週次レビュー
```

Cursor をメンションするのは人。ボットはメンションしない。

## Done when

- 対象週が正本対象なら PR URL がある（未マージ）
- 対象外なら正本未変更で下書きのみ
- 秘密・SA JSON を書いていない
