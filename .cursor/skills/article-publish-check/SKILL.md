---
name: article-publish-check
description: >-
  Verifies FlightAcademy article drip publish: MDX publishedAt, learning_contents
  is_published, and cron article-publish-sync. Triggers: 記事公開確認, publish sync,
  publishedAt, 日次公開, drip publish, article-publish-sync.
disable-model-invocation: false
---

# Article Publish Check（日次公開確認）

Articles のドリップ公開が JST カレンダーどおりか確認する。勝手に本番 cron を連打しない（ユーザーが秘密を渡す／明示した場合のみ）。

## Sources of truth

| 層 | ファイル／場所 |
|----|----------------|
| スケジュール | [`api/_lib/articlePublishSchedule.ts`](../../../api/_lib/articlePublishSchedule.ts) |
| MDX 日付 | `src/content/articles/*.mdx` → `meta.publishedAt` |
| クライアント gate | [`src/utils/articlePublishGate.ts`](../../../src/utils/articlePublishGate.ts) |
| DB | `learning_contents.is_published`（Supabase） |
| Cron | [`api/cron.ts`](../../../api/cron.ts) `?job=article-publish-sync` — 毎日 00:10 JST |

## Steps

1. **今日の JST 日付**を求める（`Asia/Tokyo` の `YYYY-MM-DD`）
2. schedule から「今日までに公開すべき id」と「まだ未来の id」を列挙
3. 各 id について照合:

```text
MDX publishedAt (date part) == schedule.publishDate
DB is_published == (publishDate <= jstToday)   // after sync
Hub/Detail: future publishedAt must not show as readable
```

4. Supabase MCP `execute_sql` 例:

```sql
SELECT id, title, is_published, order_index
FROM learning_contents
WHERE id LIKE '4.1.%'   -- or list explicit ids
ORDER BY order_index;
```

5. 食い違いがあれば原因を切り分ける:
   - schedule 未更新 / MDX 日付ズレ → コード修正提案
   - DB だけズレ → sync cron 未実行 or デプロイ遅延
6. ユーザーが明示したときだけ手動 sync:

```bash
curl -sS -H "Authorization: Bearer $CRON_SECRET" \
  "https://flight-lms.vercel.app/api/cron/article-publish-sync"
```

JSON の `jstToday`, `dueIds`, `notDueIds`, `published`, `unpublished` を報告。

## Checklist output

```markdown
## Publish check — {jstToday}

| id | publishDate | MDX | DB is_published | expect | OK? |
|----|-------------|-----|-----------------|--------|-----|
| … | … | … | … | true/false | ✅/❌ |

Next action: …
```

## Done when

- 表で expect vs actual が揃っている（または差分と次アクションが明確）
- 秘密をチャットに貼っていない
