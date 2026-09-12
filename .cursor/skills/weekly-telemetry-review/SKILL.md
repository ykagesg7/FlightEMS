---
name: weekly-telemetry-review
description: >-
  Optional Tuesday telemetry polish: Sentry fill-in on the CI docs PR.
  Do not merge. Do not create a PR if CI already opened telemetry/YYYY-Www.
  Triggers: 週次レビュー, weekly telemetry review, Sentry追記.
disable-model-invocation: false
---

# Weekly telemetry review（フェーズ2b・任意）

正本: [`docs/ops/Weekly_Telemetry_Review.md`](../../../docs/ops/Weekly_Telemetry_Review.md)

**L0 の必須経路ではない。** 正本 PR は CI [`weekly-telemetry-draft-pr.yml`](../../../.github/workflows/weekly-telemetry-draft-pr.yml) が Facts 後に自動作成する。人の承認は Facts スレッドへの一行 `APPROVE-DOC` のみ。

この Skill は **Sentry lastSeen や文言の精緻化** が必要な週だけ使う。merge はフェーズ2c。

## Do not

- フェーズ1/2a の workflow に Slack や `contents: write` を足さない
- 正本の **W32/W33 土曜窓** を ISO 週の数値で上書きしない
- 旧土曜窓と新 ISO 週を前週比しない
- この PR では `test.yml` の自動修正を走らせない（docs のみ）
- `@Cursor` が自分の投稿に反応しない
- `APPROVE-DOC` を実行しない（merge はフェーズ2c または人手）
- 自分の Slack 投稿や `id: telemetry-notify` の Facts に返信してループしない
- Facts 投稿内の承認例を承認とみなさない
- ドライラン週（当該火曜レビュー対象でない ISO 週）を正本ログに足さない
- **CI がまだ PR を出していない週に新規 PR を作らない**（自動側に委譲）

## Canonical week rule

- 初回 ISO 正本は **2026-W34（2026-08-17〜08-23）を 2026-08-25 火**
- 対象は **直前に完了した ISO 週** の既存 `telemetry/YYYY-Www` PR への追記のみ

## Steps

1. 正本と open な `telemetry/YYYY-Www` PR を確認する。無ければ **停止**（CI 待ち。作らない）
2. GA4 JSON は artifact を正とする（捏造禁止）
3. Sentry MCP: 直近 7d の error、`is:unresolved lastSeen:-7d`、`FLIGHT-ACADEMY-4` の lastSeen。Facts の Sentry 行を埋める
4. 必要なときだけ Issues / Actions / ボードを人手で直す
5. 既存ブランチに docs-only で追記コミット（英語 Conventional Commits）。**Draft にしない**
6. Slack の **同じスレッド** に「Sentry を追記した」旨を1通だけ返す。`@` なし。本文全体を `APPROVE-DOC` にしない

## Slack trigger text (human)

通常は不要。Sentry 埋めが必要なときだけ Facts スレッドで:

```text
週次レビュー
```

Cursor をメンションするのは人。ボットはメンションしない。

## Done when

- 既存 PR に追記した、または追記不要と判断して停止
- PR 未作成の週に新規 PR を作っていない
- 秘密・SA JSON を書いていない
