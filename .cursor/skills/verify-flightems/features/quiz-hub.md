# F4 クイズハブと記事の10問確認（quiz-hub）

`/test`・`/quiz` のハブ表示と、ログイン時のクイズ結果・XP 記録を見る。

## Sub-features

- `f4-diagnostic` 10問診断タブ
- `f4-alias` `/quiz` エイリアス
- `f4-subject` 科目別練習
- `f4-ppl-pool` PPL プール表示
- `f4-content-quiz` 記事から10問確認
- `f4-session-record` ログイン後のセッション記録

## How to get to it (user POV)

- `/test`、`/quiz?tab=...`、`/test?exam=ppl`、`/test?tab=content&subject=...&contentId=...&exam=ppl`

## Driving it with Playwright

Preconditions:

- 1〜5 は匿名可（`e2e/test-exam-ppl.spec.ts` と同趣旨〔計測〕）。
- 6 はログイン + 非本番 DB。本番ホストは **未確認**（`quiz_sessions` 等への書き込み。軍師裁定 B）。

- **診断。** `/test` → URL に `tab=diagnostic`、「10問診断を開始」。
- **エイリアス。** `/quiz?tab=diagnostic` 同画面。匿名で「結果の保存はアカウント登録後」系の案内。
- **科目別。** `tab=subject`。「科目別練習」。`/test?mode=review&count=10` → `tab=review`。
- **PPL。** `/test?exam=ppl` → `data-testid="ppl-pool-count"`、`ppl-main-subject-count`。
- **記事10問。** content タブで問題数を数える（本番例: 10問〔計測〕2026-10-16）。
- **解答（ログイン）。** 10問完了 → 結果画面。Network: `quiz_sessions`、`user_test_results`、`award_quiz_session_xp`、`sync_srs_after_session`（あれば）2xx。
- **DB 読取（非本番のみ）。**

```sql
SELECT id, user_id, mode, score, total_questions, created_at
FROM quiz_sessions
WHERE user_id = :uid
ORDER BY created_at DESC
LIMIT 5;
```

直近セッションが画面・Network と一致すること。

### 合格

- 1〜4 が e2e と同様に表示される。
- 5 で問題が1問以上（数は〔計測〕で記録）。
- 6 で結果画面 + 記録 2xx。DB 確認できれば `quiz_sessions` に行がある。

### 不合格

- ハブ・プール・記事クイズが開かない、または e2e と矛盾する表示。
- ログイン解答後に記録が 4xx/5xx、DB に期待行が無い。

### 判断不能

- ローカル未起動・ログイン不可。
- 本番 DB（記録・SELECT 未確認）。
- 「問題を取得中」のままタイムアウト（環境・プールデータ不明）。

## Gotchas

- 診断開始直後は「問題を取得中」か「出題できる問題が見つかりませんでした」〔計測〕e2e 待ち方に合わせる。
- `contentId` がマッピングされていない単元は「設問がない」系文言〔計測〕。
- 設問取得 API のパス名は実行時に Network で控える（固定名は未記載）。
