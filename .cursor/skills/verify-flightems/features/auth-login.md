# F2 ログイン・ログアウト（auth-login）

メールとパスワードでログインし、ヘッダーと保護ルートが変わり、ログアウトで戻るかを見る。

## Sub-features

- `f2-login-success` 正しい資格情報でログイン
- `f2-logout` ログアウトで匿名表示に戻る
- `f2-wrong-password` 誤パスワードで失敗文言（1回だけ）

## How to get to it (user POV)

- ヘッダーの LOGIN → `/auth`
- ログアウトはヘッダーのログアウト操作

## Driving it with Playwright

Preconditions:

- テスト学習者の資格情報は `/workspace/gungi/flightacademy/test_learner_login.txt`（中身は入力するだけ、証拠に写さない）。
- **Supabase ホストが本番 `fstynltdfdetpyvbrswr` のときは手順を実行せず未確認**（`profiles` insert の道がある。軍師裁定 B）。
- 非本番 DB、または上様／FA 軍師がその実行でログインモードを明示した場合のみ実行。

- **フォーム。** `page.goto('/auth')`。見出し「ログイン」。資格情報入力のスクリーンショットは撮らない。
- **成功。** 「ログイン」押下 → 「ログインに成功しました。リダイレクトします...」〔計測〕`src/pages/auth/AuthPage.tsx`。リダイレクト先 URL を記録。
- **ヘッダー。** LOGIN からユーザー表示に変わる。`/profile` がログイン画面に戻されない。
- **ログアウト。** ヘッダーが LOGIN に戻る。`/profile` の挙動を記録。
- **失敗例（1回）。** 誤パスワードで「ログインに失敗しました。認証情報を確認してください。」等。
- **Network。** `POST .../auth/v1/token?grant_type=password` の状態のみ（本文は保存しない）。

### 合格

- 成功文言・ヘッダー変化・ログアウト復帰が上記どおり。
- 誤パスワードで期待どおりの失敗文言（6 を実行した場合）。

### 不合格

- 正しい資格情報で成功しない、ヘッダーが変わらない、ログアウトできない。
- 誤パスワードで無言・別エラー。

### 判断不能

- 資格情報ファイルが無い／読めない。
- 本番 DB（既定で未確認）。
- `/auth` に届かない。
- 二要素認証の有無が不明でブロックされた（要報告）。

## Gotchas

- profiles 埋め込み GET の 401 は仕様（親 SKILL 0-8）。
- ブラウザに前セッションが残っていると LOGIN が見えない。
- `/mission`、`/welcome`、`/profile` はログイン必須〔計測〕`lazyProtectedRoute`。
