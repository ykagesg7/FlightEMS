# F5 小テスト（spiral-lms-dev）※開発専用

螺旋マトリックス LMS のミニクイズ。**本番・Preview にはルートが無い**（`buildSpiralLmsDevRoutes` は DEV のみ〔計測〕`d2352e0`）。

## Sub-features

- `f5-hub` ハブ表示と開発プレビュー注記
- `f5-auth-gate` 未ログイン時の案内
- `f5-questions-leak` 設問 API に正答・解説が含まれない
- `f5-pass-fail` 採点と合否表示

## How to get to it (user POV)

- `npm run dev` かつ `VITE_SPIRAL_LMS_ENABLED=true` のときだけ `http://localhost:<port>/dev/spiral-lms`
- 無効時は `/` へリダイレクト〔計測〕`SpiralLmsHubPage.tsx`

## Driving it with Playwright

Preconditions:

- **dev サーバー必須**（preview では F5 判断不能）。
- ログイン + 非本番 DB。本番ホストは **未確認**（軍師裁定 B）。

- **ハブ。** 見出し「螺旋マトリックス LMS」と開発プレビュー注記。
- **単元。** 当日の単元から小テストを開く（例: L1-Q1-1 — 画面ラベルは実行時に〔計測〕）。設計上の期待: 上様裁可 **2026-10-14 11:40 JST** で「4択5問・4問以上で合格」。
- **設問件数（非本番 DB・SELECT のみ）。** 対象 `node_id`（例: `L1-Q1-1`）で:

```sql
SELECT COUNT(*) AS question_count
FROM public.node_mini_quiz_questions
WHERE node_id = :nodeId;
```

件数を証拠に書き、画面で数えた問題数と突き合わせる。選択肢数は各問の `options` JSON 配列を Network または `SELECT id, jsonb_array_length(options) AS option_count FROM public.node_mini_quiz_questions WHERE node_id = :nodeId ORDER BY sort_order`（非本番のみ）で確認。
- **漏洩チェック。** 設問取得レスポンスに正答・解説フィールドが無いこと（項目名は実行時に記録）。
- **採点。** 1回目: 意図的に3問正解相当 → 不合格表示。2回目: 4問以上正解相当 → 合格表示。
- **合否の実装。** ノードの `passing_score = 80` はシード〔計測〕`scripts/database/20261014_spiral_lms_seed_quiz_l1_l2.sql` 19行付近の `SET passing_score = 80`。採点式は〔計測〕`scripts/database/20261012_spiral_lms_mdx_mini_quiz.sql` 423–425行: `score := round((100::numeric * v_correct::numeric) / v_total::numeric, 2)`、424行 `score := private.spiral_lms_validate_score(score)`、`passed := score >= v_passing_score`。上記「4択5問」は **上様裁可**、「80」は **実装**。
- **受験記録の DB 読取（非本番のみ）。** F2 ログイン後の `user_id` と `node_id` で:

```sql
SELECT id, node_id, score, passed, attempt_kind, created_at
FROM public.user_attempts
WHERE user_id = :uid
  AND node_id = :nodeId
  AND attempt_kind = 'mini_quiz'
ORDER BY created_at DESC
LIMIT 5;
```

表形の典拠: `scripts/database/20261012_spiral_lms_schema_rls.sql`（`user_attempts` 初期列）、`scripts/database/20261012_spiral_lms_record_attempt.sql`（`attempt_kind` 等）。直近の `score`・`passed` が画面の合否と矛盾しないこと。

### 合格

- dev でハブが開く。
- 設問に正答・解説が載っていない。
- 低スコアで不合格・高スコアで合格の表示が、裁可と `passing_score=80` の説明と矛盾しない。

### 不合格

- dev でルートが 404／フラグ off でトップへ戻る（有効化済みの前提で）。
- 正答がクライアントに漏れる。
- 80% 未満で合格、または 80% 以上で不合格。

### 判断不能

- preview / 本番 URL で試した（dev 専用）。
- 本番 DB・資格情報なし・`VITE_SPIRAL_LMS_ENABLED` 未設定。
- 当日単元にミニクイズが無く開始できない（データ依存）。

## Gotchas

- 単元は時刻で変わる〔計測〕。JST 時刻を証拠に書く。
- 「再読み込み」は再 fetch のみ。失敗時 `role="alert"`〔計測〕。
- 開発サンプルノード `SPIRAL-DEV-MINI` はシードが1問のみ〔計測〕`scripts/database/dev/20261012_spiral_lms_mdx_mini_quiz_dev_seed.sql` — 本番相当データとは別。
