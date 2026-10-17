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
- **単元。** 当日の単元から小テストを開く（例: L1-Q1-1 — 画面ラベルは実行時に〔計測〕）。**問題数・選択肢数は実行時に数える**（設計上の期待: 上様裁可 **2026-10-14 11:40 JST** で「4択5問・4問以上で合格」。リポジトリ内の L1-Q1-1 用ミニクイズ件数は **不明**）。
- **漏洩チェック。** 設問取得レスポンスに正答・解説フィールドが無いこと（項目名は実行時に記録）。
- **採点。** 1回目: 意図的に3問正解相当 → 不合格表示。2回目: 4問以上正解相当 → 合格表示。
- **合否の実装。** DB 関数側で `score := round(100 * correct / total)`、`passed := score >= passing_score`。ノードの `passing_score` は **80**（百分率。4/5=80% で合格）〔計測〕`scripts/database/20261012_spiral_lms_mdx_mini_quiz.sql`。上記「4択5問」は **上様裁可**、「80%」は **実装**。

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
