---
name: weekly-article-digest
description: >-
  Drafts X-style weekly article digest email copy from articlePublishSchedule
  and Ideas/Week_*.md. Does not send mail. Triggers: 週次メール文案, digest draft,
  weekly_article_digest, Brevo記事案内, 日曜案内メール, 来週予告.
disable-model-invocation: false
---

# Weekly Article Digest（文案）

週次 Articles 案内メール（`weekly_article_digest`）の **文案だけ** を作る。送信は cron または明示指示時のみ。

## Before starting

1. Read schedule: [`api/_lib/articlePublishSchedule.ts`](../../../api/_lib/articlePublishSchedule.ts)
2. Read target week Ideas: Obsidian `FlightAcademy/Ideas/Week_YYYY-Www.md`（なければ schedule のみ）
3. Tone: 訓練回顧・ワシ口調に寄せた **短いフック**（X 投稿と同じ核）。です・ます連発禁止
4. Contract: CTA は **Articles or FA Public Wiki のみ**。T-4 URL 禁止
5. **1 話目は日曜 `publishDate`**（digest 送信日と同じ。メールでは **「今すぐ」** ラベル）。2・3 話目は水・金

## Audience（現行）

- 送信実装: [`api/_lib/notificationEmail.ts`](../../../api/_lib/notificationEmail.ts) `dispatchWeeklyArticleDigestEmails`
- **一時ブロードキャスト**: メールありプロフィール。`email_notifications_enabled === false` のみ除外
- 本文末尾に必ず: プロフィール → 通知設定で「メール通知」OFF 可

## Steps

1. 対象 `isoWeek` は **来週（予告側）**（ユーザー指定 or 日曜送信時点の翌 ISO 週）
2. 併せて **今週（リマインド側）** の digest も読む（前週 `WEEKLY_ARTICLE_DIGESTS`）
3. `WEEKLY_ARTICLE_DIGESTS[isoWeek]` を読む。無ければ **schedule 追記案** を先に出して停止（勝手に本番送信前提の架空IDを載せるな）
4. 各記事について Ideas / MDX `excerpt` / 既存 `hook` から **1行 hook** を磨く（既にあれば微修正提案）
5. チャットに以下を出力する:

### Output template

```markdown
## Digest draft — {isoWeek}（日曜夕方）

**Subject:** Flight Academy — 来週の案内＋今週の振り返り（{isoWeek}）

**Reminder week:** {prevIsoWeek}（読み逃し立て直し）
**Intro (upcoming):** （2〜4文。シリーズの約束。読ませる）

| 曜 | タイトル | hook（X核） | slug |
|----|----------|-------------|------|
| 今すぐ（1本目） | … | … | /articles/… |
| 水 | … | … | /articles/… |

**Checklist note:** （任意・Public Wiki 言及可。T-4禁止）

**Opt-out footer:** （現行どおりプロフィール通知設定）

### Code sync checklist
- [ ] `articlePublishSchedule.ts` の hook/intro をこの文案に合わせる？
- [ ] MDX `publishedAt` と publishDate 一致？（**1 話目は日曜**＝digest 送信日）
- [ ] `learning_contents` id と schedule id 一致？
- [ ] cron は日曜 17:00 JST（`0 8 * * 0` UTC）？
```

6. ユーザーが「schedule に反映して」と言ったら `articlePublishSchedule.ts` を更新する。**言われない限り送信しない**
7. 送信が明示されたときだけ（人間が `CRON_SECRET` を使う前提）:

```bash
curl -sS -H "Authorization: Bearer $CRON_SECRET" \
  "https://flight-lms.vercel.app/api/cron/article-weekly-digest?isoWeek=YYYY-Www"
```

レスポンスの `email.sent` / `skipped` / `failed` を報告。

## Done when

- 表形式の digest draft がチャットにある
- schedule 未登録なら不足を明示して止まった
- 無断で Brevo 送信していない
