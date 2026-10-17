# FlightEMS 検証機能地図

このディレクトリは FlightAcademy（FlightEMS）の利用者向け動作を検証するための正本。親スキル [`../SKILL.md`](../SKILL.md) の Launch / Doctor / Evidence に従い、該当ファイルを開いてから動かす。

コード突き合わせ: **`d2352e0`**

## 共通前提

- 検証用に自分で起動したローカル dev または preview / Preview URL だけを触る。
- Supabase ホストが本番 `fstynltdfdetpyvbrswr` のときは、F2・F3（記事を開く）・F3/F4 の DB・F5 は **未確認**（軍師裁定 B）。
- 証拠: `artifacts/verify-flightems/<日時JST>/<機能ID>/`（git 除外）。

## 機能索引

| ID | ファイル | 概要 |
|----|----------|------|
| F1 | [home-announcements.md](./home-announcements.md) | トップ「最新情報」 |
| F2 | [auth-login.md](./auth-login.md) | ログイン・ログアウト |
| F3 | [article-read-progress.md](./article-read-progress.md) | 記事を読む（利用者の読む流れのみ） |
| F4 | [quiz-hub.md](./quiz-hub.md) | クイズハブ・10問確認・記録 |
| F5 | [spiral-lms-dev.md](./spiral-lms-dev.md) | 螺旋 LMS 小テスト（dev 専用） |

## 公開スケジュールとの境界

[`article-publish-check`](../../article-publish-check/SKILL.md) が MDX `publishedAt`・`learning_contents.is_published`・cron を見る。ここでは **公開済み記事を1本読んで進捗が付くか** だけを見る。

## 各ファイルの形

H1 → 一段落 → H2 が次の4つ（順序固定）:

1. `Sub-features`
2. `How to get to it (user POV)`
3. `Driving it with Playwright`
4. `Gotchas`

各ファイルに **合格 / 不合格 / 判断不能** を書く。
