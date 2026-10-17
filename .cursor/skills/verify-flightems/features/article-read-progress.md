# F3 記事を読む → 読了と XP（article-read-progress）

**利用者として** 記事一覧から本文を読み、読了と XP が記録されるかを見る。公開日・`is_published` の照合はしない（`article-publish-check` へ）。

## Sub-features

- `f3-list` 記事ハブの表示
- `f3-read-body` 公開済み記事本文
- `f3-progress-xp` ログイン時の進捗 upsert と XP RPC
- `f3-idempotent-xp` 同じ記事の二度目で XP が増えない

## How to get to it (user POV)

- `/articles` → 記事カード → `/articles/:contentId`

## Driving it with Playwright

Preconditions:

- 表示確認（1〜2）は匿名可。
- 記録（3〜6）はログイン + **非本番 Supabase**（Doctor が `no` のとき）。Doctor が `yes` または `unknown` のときは **記事を開く操作も未確認**（`learning_content_views` insert。軍師裁定 B）。上様／FA 軍師が **その実行で**ログインモードを明示した場合のみ、本番 DB でもテスト学習者で許可（決まり事6の例外）。

- **一覧。** `page.goto('/articles')`。コース並びを記録。
- **本文。** 公開済み1本を開き、見出し・本文。失敗文言が出ない。
- **スクロール（ログイン）。** 最後までスクロール。読了判定は `completed` または `progress_percentage >= 95`、XP は 5〔計測〕`src/hooks/useArticleProgress.ts`、`src/utils/awardArticleReadXp.ts`、RPC `award_article_read_xp`（**d2352e0 で確認済み**）。
- **Network。** `/rest/v1/learning_progress` upsert、`/rest/v1/rpc/award_article_read_xp` が 2xx。
- **二度目。** 同じ記事を再スクロール。XP RPC が再付与しない応答。
- **DB 読取（非本番のみ）。** ログイン user と `contentId` で:

```sql
SELECT completed, progress_percentage, xp_awarded_at
FROM learning_progress
WHERE user_id = :uid AND content_id = :contentId;
```

初回読了後: `completed` true、`progress_percentage` ≥ 95、`xp_awarded_at` が null でない（列名は `progress_percentage`〔計測〕）。

### 合格

- 本文が読める（公開済み1本）。
- 記録経路: Network 2xx + DB が上記と一致（DB 確認できた場合）。
- 二度目で XP が増えない。

### 不合格

- 存在する公開記事で本文が出ない（公開スケジュール原因は `article-publish-check` に回す旨を書く）。
- upsert / RPC が失敗、または DB が読了状態と矛盾。
- 二度目で XP が再付与される。

### 判断不能

- ローカル起動不可・資格情報なしでログイン不可。
- 本番 DB（開く・記録・SELECT すべて未確認）。
- 非本番だが DB 読取権限なし（Network だけなら〔推定〕で報告、DB は未確認）。

## Gotchas

- 存在しない `contentId` は読み込み失敗文言〔計測〕。失敗例に使うときは ID を確認。
- `useArticleProgress` は通信エラーを黙って捨てることがある〔計測〕。画面より Network / DB を正とする。
- いいね・コメントは触らない。
