# FlightAcademyTsx 運用保守ガイド

## 📖 このドキュメントを読むべき人

- ✅ **AIアシスタント**: 運用・保守作業を行う場合
- ✅ **運用担当者**: デプロイ手順やトラブルシューティングを確認したい場合
- ✅ **開発者**: 運用時の手順やメンテナンス方法を確認したい場合

**推奨読み順**: [docs/README.md](README.md) → [03_Development_Guide.md](03_Development_Guide.md) → このドキュメント

---

## 📋 概要

このドキュメントは、FlightAcademyTsxプロジェクトの運用、保守、トラブルシューティングについて説明します。

**最終更新**: 2026年6月21日（Phase D cohort pilot 本番・Supabase Security Advisor 許容 WARN・Postgres Pause/Restore 実施）
**バージョン**: Operations & Maintenance Guide v3.0

---

## 🎯 システム概要

### **目的**

- **自動化システム**: コード変更に伴うドキュメントの自動更新
- **品質保証**: ドキュメントの一貫性と正確性の確保
- **パフォーマンス最適化**: システム全体の性能向上
- **トラブルシューティング**: 問題の迅速な解決

### **主要機能**

- **ファイル監視**: ソースコードの変更を監視
- **自動更新**: 変更に基づくドキュメントの自動更新
- **検証機能**: ドキュメントの整合性チェック
- **Git hooks統合**: コミット前の自動実行

---

## 🔄 運用のポイント

### **Sentry（Vercel Marketplace / エラー監視）**

- **アプリ側**: `src/instrument.ts` が本番かつ DSN ありのときだけ `@sentry/react` を有効化する。
- **Vercel 連携時の環境変数**（[Sentry 公式: Vercel](https://docs.sentry.io/organization/integrations/deployment/vercel/)）: 連携が入れるのは主に次のとおり（プロジェクト **Settings → Environment Variables** で確認）。
  - `NEXT_PUBLIC_SENTRY_DSN` — クライアント用 DSN（Next.js 向け名だが本リポジトリの `vite.config.ts` がビルド時にこれを読み、`import.meta.env.VITE_SENTRY_DSN` としてバンドルに埋め込む）
  - `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` — 本番ビルド時のソースマップアップロード用（`@sentry/vite-plugin`）
- **ローカルで試す場合**: `.env.local` に `VITE_SENTRY_DSN=` を設定して production ビルド＋プレビューするか、開発では既定どおり送信されない（`instrument.ts` の `enabled` / `beforeSend`）。
- **動作確認**: 本番 URL で意図的にエラーを再現するか、Sentry の「Send test event」を使う。ダッシュボードの **Issues**（または Discover の error イベント）で受信を確認する。
- **再デプロイ**: Vercel 上で環境変数を追加・変更したあとは **Redeploy** が必要（ビルド時に DSN が埋め込まれるため）。
- **Team と Project**: **Team Settings → Environment Variables**（チーム共通）に出ている `WEATHER_API_KEY` 等とは別枠で、Sentry 連携が入れる変数は **各デプロイ先プロジェクト**の **Settings → Environment Variables** に付くことが多い。チーム画面に無くても、**該当プロジェクトを開いたうえで**同じメニューを確認する。
- **Marketplace でも変数が無い場合**: 連携の「プロジェクト紐付け」が未完了、または別アカウントの Sentry になっていることがある。そのときは **手動で十分**。[sentry.io](https://sentry.io) → 対象プロジェクト → **Settings → Client Keys (DSN)** で DSN をコピーし、Vercel の **そのフロントエンド用プロジェクト**に次のいずれかを追加する（どちらも本リポジトリで有効）:
  - `VITE_SENTRY_DSN` = DSN の文字列（推奨・名前が Vite と一致）
  - または `NEXT_PUBLIC_SENTRY_DSN` = 同じ DSN（Vercel テンプレに合わせる場合）
  - ソースマップまで欲しい場合は [Sentry Auth Token](https://docs.sentry.io/product/accounts/auth-tokens/) を発行し、`SENTRY_AUTH_TOKEN` に加え `SENTRY_ORG`・`SENTRY_PROJECT`（スラッグ）をプロジェクトの Environment Variables に追加（`vite.config.ts` の `@sentry/vite-plugin` 用）。

### **Supabase Auth（メール・OAuth・CAPTCHA）**

- **確認メール / Magic Link / パスワードリセット**: **Brevo** を Supabase **Authentication → SMTP Settings**（Custom SMTP）に設定。アプリの `.env` には SMTP 秘密情報を置かない。
- **Brevo SMTP キー（Auth 用）**:
  - Brevo → **SMTP & API → SMTP** → **Generate a new SMTP key**（`Master Password` 等が **Deactivated** なら必ず新規）
  - Supabase → **Project Settings → Authentication → SMTP Settings**:
    - Host: `smtp-relay.brevo.com`
    - Port: `587`
    - Username: Brevo SMTP 画面の **Login**（例: `82c24c001@smtp-brevo.com`）
    - Password: **新しい SMTP key**（API key `xkeysib-` とは別）
    - Sender email: `1031102104290504kage@gmail.com`（Brevo Senders で **Verified** のアドレス）
- **Brevo キー 3 種**（混同禁止）: MCP token → [Cursor_MCP_Setup.md](Cursor_MCP_Setup.md) / `BREVO_API_KEY`（Transactional）→ Vercel / SMTP key → Supabase Auth のみ
- **迷惑メール対策（UI + 運用）**:
  - アプリ: Auth のメール送信完了画面・プロフィール「メール通知」ON 時に、**迷惑メール / Gmail プロモーション** 確認を案内（[`EmailDeliveryHint`](../src/components/auth/EmailDeliveryHint.tsx)）
  - Supabase **Authentication → Email Templates** で Reset password / Confirm signup を日本語件名（例: `Flight Academy — パスワード再設定`）に変更すると Gmail 振分けが改善しやすい
  - Brevo Transactional ログで `delivered` なのに未着のときは Gmail 側フィルタを疑う（[`transac_templates_get_transac_email_content`](Cursor_MCP_Setup.md) / Dashboard）
- **Google OAuth**:
  1. Google Cloud Console で OAuth 2.0 Web クライアントを作成。
  2. Authorized redirect URI: `https://fstynltdfdetpyvbrswr.supabase.co/auth/v1/callback`
  3. Supabase **Authentication → Providers → Google** に Client ID / Secret を設定。
  4. **Authentication → URL Configuration**: Site URL（本番 Vercel URL）、Redirect URLs に `https://<production>/auth` と `http://localhost:5173/auth`。
- **Cloudflare Turnstile（任意）**:
  1. [Turnstile](https://developers.cloudflare.com/turnstile/) で Site Key / Secret Key を取得。
  2. Vercel **Production** に `VITE_TURNSTILE_SITE_KEY` を設定（再デプロイ必須）。
  3. Supabase **Authentication → Bot and Abuse Protection** に Secret を設定。
  4. ローカル検証: `.env.local` に `VITE_TURNSTILE_SITE_KEY=` を追加。
- **Auth 推奨設定（2026-06 本番反映済み）**:
  - **Sign In / Providers**: Email **Enabled**、Google **Enabled**、Confirm email **ON**
  - **Email プロバイダ**: Secure email change / Secure password change / Require current password when updating — **ON** 推奨
  - **Minimum password length**: 8 以上推奨（現状 6 でも可。Pro 移行時に Leaked Password と合わせて見直し）
  - **Leaked Password Protection**: **Pro プラン以上のみ** — Free では OFF のまま（Advisor WARN は許容。下記「Security Advisor」）
- **DB マイグレーション（OAuth username）**: [`scripts/database/20260606_handle_new_user_oauth_fallback.sql`](../scripts/database/20260606_handle_new_user_oauth_fallback.sql) — MCP `apply_migration` 名 `handle_new_user_oauth_fallback_20260606`。

### **Cohort 週次 cron・通知（Phase D pilot）**

- **スケジュール**: Vercel Cron `0 0 * * 0`（UTC）= **日曜 09:00 JST** → [`api/cron/cohort-weekly.ts`](../api/cron/cohort-weekly.ts)
- **処理順**: 前週スコア集計 → MVP（3〜9 名）/ TOP3（10 名以上）バッジ → アプリ内通知 enqueue → （`BREVO_API_KEY` あり時）メール配信
- **Vercel Production 必須 env**:
  - `CRON_SECRET` — Cron 認証（`Authorization: Bearer`）
  - `SUPABASE_SERVICE_ROLE_KEY` — RPC 実行
  - `VITE_SUPABASE_URL` または `SUPABASE_URL`
  - `BREVO_API_KEY` + `BREVO_SENDER_EMAIL`（メール通知を有効化する場合）
  - `BREVO_API_KEY` は Brevo **API Keys** で **Active** な `xkeysib-…`（**Deactivated** の `supabaseEmail` 等は不可）。Auth SMTP キーと別物
  - `BREVO_SENDER_EMAIL` = `1031102104290504kage@gmail.com`（Verified sender。API キー文字列を入れない）
  - `VITE_APP_URL`（メール内リンク。未設定時は `https://flight-lms.vercel.app`）
- **手動確認**（本番デプロイ後）:
  ```bash
  curl -sS -H "Authorization: Bearer $CRON_SECRET" "https://flight-lms.vercel.app/api/cron/cohort-weekly"
  ```
  レスポンス JSON の `missionNotifications` / `email.weeklyMission` を確認。`FUNCTION_INVOCATION_TIMEOUT` が出る場合は [`vercel.json`](../vercel.json) の `api/cron/cohort-weekly.ts` `maxDuration`（60s）とメール並列数（`api/_lib/notificationEmail.ts`）を確認し **再デプロイ**する。
- **Supabase Auth SMTP 設定後の確認**: Supabase Dashboard → **Authentication → Email Templates** からテスト送信、または本番 `/auth` で **パスワードリセット**を自分のアドレスに送り Gmail 受信を確認（cohort メールとは別経路）。
- **アプリ内通知**: Dashboard の「お知らせ」— 既読で非表示（`in_app_notifications.read_at`）
- **メール opt-in**: プロフィール → 通知・公開 → 「メール通知」ON かつ「ミッション更新」ON
- **Web Push**: 購読保存のみ。`VAPID_*` 未設定時は [`api/notifications/push.ts`](../api/notifications/push.ts) が 503 でスキップ
- **DB 正本**: [`scripts/database/20260620_cohort_weekly_missions.sql`](../scripts/database/20260620_cohort_weekly_missions.sql) · MVP tier: [`20260626_cohort_weekly_mvp_tier_awards.sql`](../scripts/database/20260626_cohort_weekly_mvp_tier_awards.sql)
- **週次表彰**: active **3〜9 名** → MVP（`metric_value>0`・同率 1 位可）。**10 名以上** → TOP3。全員 inactive ならその週は表彰なし
- **RPC 権限 hardening（本番適用済）**: [`scripts/database/20260621_cohort_rpc_hardening.sql`](../scripts/database/20260621_cohort_rpc_hardening.sql) — cron 系 RPC は **service_role のみ**、ユーザー RPC は **authenticated のみ**（`anon` EXECUTE 不可）

### **Supabase Security Advisor（本番運用）**

**プロジェクト**: `fstynltdfdetpyvbrswr`（FlightAcademy / ap-northeast-1 / **Free**）

#### 定期確認（MCP または Dashboard）

| 手段 | 手順 |
|------|------|
| **MCP** | `plugin-supabase-supabase` → `get_advisors`（`project_id`: `fstynltdfdetpyvbrswr`、`type`: `security`） |
| **Dashboard** | **Advisor Center** / **Database → Security Advisor** |

リリース前・月次メンテでは [ops/MCP_RELEASE_CHECKLIST.md](ops/MCP_RELEASE_CHECKLIST.md) §1 と併用する。

#### 2026-06-21 時点の WARN 7 件（対応方針）

| WARN | 件数 | 対応 |
|------|------|------|
| `authenticated_security_definer_function_executable` | 5 | **許容（意図的）** — cohort ユーザー RPC。`SECURITY DEFINER` + 関数内 `auth.uid()` / opt-in チェック + `SET search_path = public`。`anon` EXECUTE は revoke 済み。**INVOKER 化や REVOKE はアプリ破壊のため行わない** |
| `auth_leaked_password_protection` | 1 | **許容（Free 制限）** — Pro でのみ ON。他 Auth 強化は Dashboard で ON 済み |
| `vulnerable_postgres_version` | 1 | **監視** — `supabase-postgres-15.8.1.085`。Free の **Pause → Restore** 実施後も同一（プラットフォーム配信待ち）。Pro の **Infrastructure → Upgrade project** は将来オプション |

**意図的 SECURITY DEFINER（authenticated 可）**: `upsert_user_cohort`, `get_user_cohort_profile`, `get_cohort_anonymous_stats`, `mark_written_exam_complete`, `get_public_user_badges`

**service_role のみ（cron / Vercel）**: `compute_cohort_weekly_scores`, `award_cohort_weekly_top3`, `enqueue_cohort_notifications`

#### Postgres バージョンアップ（Free プラン）

**MCP では Postgres エンジンのアップグレードは不可**（`execute_sql` / `apply_migration` は DB 内操作のみ）。

| 方法 | 対象 | 手順 |
|------|------|------|
| **Pause and Restore** | **Free のみ** | **Project Settings → General** → **Pause project** → **Restore project**（ダウンタイムあり。復元後に最新マイナーへ） |
| **In-place upgrade** | Pro 以上 | **Project Settings → Infrastructure** → **Upgrade project** |

公式: [Upgrading](https://supabase.com/docs/guides/platform/upgrading)。**2026-06-21** に Pause/Restore 実施済み（`ACTIVE_HEALTHY`、バージョン表記は `.085` のまま — Advisor WARN 残存は上表どおり許容）。

**Restore 後チェック**: ログイン・cohort 登録・`/api/cron/cohort-weekly` 手動 curl・Advisor 再確認。

### **航空機レイヤー（Planning 地図・参考 ADS-B）**

- **用途**: 教育・**非商用**・参考の ADS-B 表示（`/planning` 地図タブ → レイヤー「航空機（参考・OpenSky）」※ラベルは現状維持）。実運航用ではない。
- **データ取得先**: **airplanes.live**（`https://api.airplanes.live/v2`・ADSBExchange v2 互換）を **ブラウザから直接 fetch**。**API キー不要**・**サーバ env 不要**・**Vercel プロキシ不要**（`Access-Control-Allow-Origin: *`）。レート制限 **1 req/sec**（クライアントは 3 分間隔）。
- **2026-06-24 に OpenSky から移行した理由**:
  - OpenSky は **AWS / Vercel 等のクラウド IP を意図的に遮断**（[公式ドキュメント](https://openskynetwork.github.io/opensky-api/) 明記）。Vercel サーバレスは fra1/iad1 など全リージョンで **接続タイムアウト**（恒常的 502/504）。
  - OpenSky の CORS は **自社オリジンのみ許可** → ブラウザ直 fetch も不可。
  - Vercel Static IP / Secure Compute を購入しても OpenSky のポリシー上ブロックは解除されない。
  - 結論: コードでは回避不能。CORS `*` で住宅 IP（利用者ブラウザ）から取得できる airplanes.live へ移行。
- **本番確認**（ブラウザ直 fetch のため Vercel API ではなく直接）:
  ```bash
  curl -sS "https://api.airplanes.live/v2/point/35.5/139.5/100" | head -c 200
  ```
  HTTP **200** と JSON（`ac` 配列）を期待。地図側は `/planning` を開きレイヤー「航空機（参考）」を ON にして機体マーカー表示を確認。
- **旧 OpenSky 資産**: `OPENSKY_CLIENT_ID` / `OPENSKY_CLIENT_SECRET`（Vercel env）と `api/opensky-states`・`api/_lib/openskyStatesCore.ts`・`openskyOAuthToken.ts` は **未使用**（ローカル dev のみ温存）。env は削除しても可。
- **仕様・開発**: [02_System_Spec.md](02_System_Spec.md) 地図節、[03_Development_Guide.md](03_Development_Guide.md) 航空機レイヤー節、[Component_Structure_Guide.md](Component_Structure_Guide.md) `planning/components/map`。

### **GA4（Google Analytics 4）**

- **本番 URL**: **https://flight-lms.vercel.app/**（このオリジンで計測する。GA の Web データストリームの「ウェブサイトの URL」もこれに合わせる）
- **アプリ側**: 本番ビルドかつ `VITE_GA_MEASUREMENT_ID`（`G-` で始まる測定 ID）があるとき **GA 公式手順どおり** `index.html` の `<head>` 先頭に `gtag.js` が入る（`vite/injectGoogleTagPlugin.ts` が Vite の `transformIndexHtml` **tags / head-prepend** で挿入。文字列置換のみだとビルド後段で落ちることがある）。`GoogleAnalyticsTracker.tsx` がルートごとに `page_view` を送る。`import.meta.env` 用の値は `vite.config.ts` の `define` でビルド時に埋め込むため、Vercel で変数を変えたあとは **再デプロイ**が必要。**Vercel Production**（`VERCEL_ENV=production`）で変数が空のときは、`vite.config.ts` の **フォールバック測定 ID**（`G-22VFYSM69J`）でタグを挿す（別ストリームにしたい場合は必ず環境変数で上書きすること）。

#### **Playwright / `dataLayer` は取れているのに、GA のホームやリアルタイムが空のとき**

ブラウザ上で **`window.dataLayer` に `page_view` が積まれること**と、**Google の収集エンドポイントへリクエストが届きレポートに反映されること**は別段階である。次を順に確認する。

1. **広告ブロッカー・追跡防止**（uBlock、Brave、Firefox Strict、iOS の追跡防止など）が **google-analytics.com** / **googletagmanager.com** をブロックしていないか。自動化ブラウザ（Playwright）は拡張が入らないため **計測は通るが、自分の常用ブラウザでは届かない**ことがよくある。
2. **開発者ツール → Network** で `g/collect` や `google-analytics` 系リクエストが **(blocked)** になっていないか、**ステータス 204 / 2xx** か。
3. **GA の画面**で、ストリームの **測定 ID**（`G-…`）が Vercel の `VITE_GA_MEASUREMENT_ID` と一致しているか。**別プロパティ・別ストリーム**を開いていないか。
4. **Vercel の Build Logs** で `[vite] GA4: injecting gtag.js into index.html` が出るか。`not set at build time` と出る場合、変数は **Production** 対象で保存されているか、**そのデプロイに `injectGoogleTagPlugin` を含むコミットが載っているか**（ソースに `googletagmanager` が無いのは、多くの場合「未プッシュの古いビルド」か「ビルド時に env が空」）を確認する。
5. **管理 → データの設定 → データフィルタ**で **内部トラフィック**等により自分のアクセスが除外されていないか。
6. **ホームの「データを収集できませんでした」系カード**は、プロパティ作成直後やサマリー生成の都合で **リアルタイムより遅い・残りやすい**。まず **レポート → リアルタイム** と **[DebugView](https://support.google.com/analytics/answer/7201382)**（デバッグ用）で確認する。
7. **標準レポート**（ユーザー・トラフィック取得など）は **24〜48 時間の処理遅延**があり得る。リアルタイムと混同しない。

#### **Phase B 検証記録（2026-04-12・リポジトリ側）**

- **コード**: `vite.config.ts` の `define` 経由で `VITE_GA_MEASUREMENT_ID` が `import.meta.env` に渡り、本番ビルドで `injectGoogleTagPlugin` が `gtag` を `index.html` に挿入し、`GoogleAnalyticsTracker.tsx` が **本番かつ ID ありのときだけ** `page_view` を送る実装であることを静的確認した。
- **本番**: **2026-05-06** — GA4 **リアルタイム**で本番トラフィック受信を確認（プロパティ **FlightAcademy**、下記 Post-Phase-B 表）。Vercel の変数変更のたびに **再デプロイ**とログ追記を推奨。

#### **Post-Phase-B 本番確認ログ（運用担当が記入）**

| 確認日 | Vercel Production に `VITE_GA_MEASUREMENT_ID` あり | 再デプロイ後 | GA リアルタイム or DebugView でヒット | 備考 |
|--------|------------------------------------------------------|-------------|----------------------------------------|------|
| 2026-05-06 | ☑ `G-22VFYSM69J`（Production / Preview に設定済） | —（本確認時点で変数変更なし） | ☑ **リアルタイム**でアクティブユーザー・表示回数を確認（プロパティ **FlightAcademy**） | 運用入力。**Phase B-5（本番受信）を満たす**。DebugView は未実施でも可。タグ経路の補助確認に Playwright MCP 等可（別セッション）。次回 Vercel 側で `VITE_GA_MEASUREMENT_ID` を変えたら **Redeploy** 後に本表を1行追加する。 |

> AI/エージェントは Vercel ダッシュボードにアクセスできないため **この表の実データ記入は人手**。記入後、[01_Current_Status_and_Roadmap.md](01_Current_Status_and_Roadmap.md) の Phase B 節に **1 行サマリー**を追記してもよい。

#### **Google Analytics Data API / 公式 MCP はタグの代替ではない**

- **Data API**（および [Google 公式 Analytics MCP](https://developers.google.com/analytics/devguides/MCP?hl=ja) が内部で使う同系 API）は、**収集・集計済みのデータを読み取る**ためのものである。**`g/collect` がクライアントから届いていない**、別プロパティに入っている等の場合、API のレポートも **0 件に近く**なる。UI が空なのに「API だけ直す」ことはできない。
- **切り分けに使う例**: 過去 7 日などで `screenPageViews` や `activeUsers` が **0 か非 0 か**を確認する。0 なら引き続きタグ・ブロッカー・ストリーム ID・プロパティの取り違えを疑う。非 0 なのに特定の UI だけ空なら、フィルタ・表示中のアカウント・サマリーの遅延を疑う。
- **2026-05-05（本リポジトリ上のエージェント実行）**: **Data API / GA MCP のレポート数値は取得しておらず**、Post-Phase-B 表の人手記入とタグ側確認が引き続き正本（[01](01_Current_Status_and_Roadmap.md) 更新履歴に同趣旨を記録）。
- **GA4 プロパティ ID**: 管理画面のプロパティ設定で **`properties/123456789` 形式の数値**（API では `properties/{property_id}`）を確認する。測定 ID（`G-…`）とは別。
- **Cursor での MCP 設定**: [docs/Cursor_MCP_Setup.md](Cursor_MCP_Setup.md)「Google Analytics MCP（任意・実験的）」。認証情報は **リポジトリに含めない**。**MCP 疎通は Data API での読取確認であり**、この節や上の **Post-Phase-B のログ表**で追う **`g/collect` / Realtime のタグ側経路チェックとは別物**。**両方そろって初めて**「送信→蓄積→参照」の一連が説明できる。
- **ローカル MCP の認証**: GA の管理 UI でサービスアカウントをプロパティに招待できない（「Google アカウントではない」等）場合は、**OAuth 2.0 デスクトップクライアント + `gcloud auth application-default login`**（`analytics.readonly` など）で **ユーザー ADC** を使う。**OAuth アプリがテストモード**なら、同意する **Gmail をテストユーザーに追加**する。コマンド例: [`scripts/ga4-mcp-oauth-adc-login.example.ps1`](../scripts/ga4-mcp-oauth-adc-login.example.ps1)。手順の正本は [Cursor_MCP_Setup.md](Cursor_MCP_Setup.md) および [Scripts_Repository_Tooling.md](Scripts_Repository_Tooling.md#ga4-mcp-oauth--adcローカル例)。

#### **収集経路の確認（タグ側と MCP / Data API 側）**

両面を順に確認する（どちらか一方だけ見ても足りないことが多い）。

1. **タグ側（一次）**: この節の **dataLayer〜`g/collect`〜Realtime / DebugView** の 1〜7 と、運用入力の **Post-Phase-B 本番確認ログ**表。**測定 ID（`G-…`）** と Vercel の `VITE_GA_MEASUREMENT_ID` が一致しているかまで含める。
2. **読み取り側（二次）**: Cursor の GA MCP が接続済みなら、[Cursor_MCP_Setup.md](Cursor_MCP_Setup.md) の「Google Analytics MCP」の **ローカル `mcp.json` のチェックリスト** と疎通の考え方に沿い、`run_report` 相当で **過去期間にヒットがあるか**を確認する。ここでのプロパティ指定は **`properties/{数値プロパティID}`**。**BigQuery** へのエクスポートは別タスクであり、これが無くても上記の Data API と Realtime で多くは足りる。

#### **BigQuery を使う場合（任意・フォローアップ）**

サイトを BigQuery とリンクさせる運用は **GCP 請求・アクセス権・コスト**が絡むため、**運用 MVP（タグ確認＋MCP / Data API）とは別フェーズ**として計画することが多い。[Google ヘルプ: BigQuery とリンクする](https://support.google.com/analytics/answer/9358801?hl=ja) を参照し、必要性が決まってから環境設計する。

### **テーマシステム統一（2025年12月21日）**

- **HUD固定スタイル**: Dayモード（HUDグリーン `#39FF14`）を固定使用
- **テーマ切り替え機能**: 削除（固定スタイルに統一）
- **スタイル制御**: Tailwind CSSクラスとCSS変数で直接制御

### **Supabase セキュリティLint対応**

- `public.v_mapped_questions` を SECURITY INVOKER 化
- 公開スキーマ上のバックアップテーブルを削除またはRLS有効化
- **cohort RPC（2026-06）**: [`20260621_cohort_rpc_hardening.sql`](../scripts/database/20260621_cohort_rpc_hardening.sql) — cron RPC の anon 実行 WARN を解消。ユーザー向け SECURITY DEFINER RPC の linter 0029 WARN は **設計上許容**（上記「Supabase Security Advisor」）

### **管理者機能**

- **画面**: ヘッダー **ADMIN** リンク → [`/admin` Hub](../src/pages/admin/)（`ProtectedRoute requireAdmin`）
- **UserMenu**: 管理者には「管理 Hub」1 リンクのみ（子メニュー重複は Admin Hub 内に集約）
- **将来**: ユーザーロール管理は `/admin/users` を想定（Profile には置かない）
- **注意**: RLS が有効であること、`profiles.roll = admin` のユーザーのみアクセス可

### **プロフィール — MFA / アカウント削除（運用）**

- **MFA（TOTP）**: Supabase Dashboard で Auth MFA を有効化したうえで Profile → アカウントから enroll / 解除。解除時は認証アプリの 6 桁コードで本人確認後 `mfa.unenroll` を実行。iPhone は「パスワード」App、Android は Authenticator 等（**メール非送付**）
- **リカバリーコード**: 2FA 有効化時または Profile「新しいリカバリーコードを発行」で **10 件を一度だけ表示**（`POST /api/mfa-recovery-codes?action=generate`、AAL2 必須）。再発行は認証アプリ 6 桁 → 旧 10 件は無効化。ログイン MFA 画面の「認証アプリにアクセスできない」から 1 件消費 → 2FA 解除してログイン（`?action=consume`）。**本番確認済**（2026-06-21）。実装: **`api/mfa-recovery-codes.ts`**。AAL2 判定は JWT `aal` クレーム（`3648940`）。旧 `/api/account/mfa-recovery-codes/{action}` は `vercel.json` rewrite のみ（互換）
- **ログイン時 MFA トグル**: `profiles.mfa_required_at_login`（デフォルト **false**・opt-in）。2FA 有効ユーザーは Profile でログイン時コード要求を ON にできる（OFF でもパスワード変更・削除は MFA 必須）
- **ログイン MFA フロー**: verified 因子あり + トグル ON + セッション AAL1 の場合、`/auth` で 6 桁コード入力後にリダイレクト。保護ルート直アクセス時は `/auth?mfa=required` へ誘導
- **セッション**: Supabase `persistSession` + `autoRefreshToken`（localStorage）。リフレッシュ有効期間中は再ログイン不要（個人端末向け。共有 PC は明示ログアウト推奨）
- **アカウント削除**: Profile → アカウント → Danger zone。`POST /api/account/delete` は `SUPABASE_SERVICE_ROLE_KEY` 必須。2FA 有効時は削除前に TOTP コード必須。関連行は `profiles` 等の ON DELETE CASCADE を前提（削除前に `scripts/database/` で監査推奨）

#### **Profile Hub + MFA デプロイ（2026-06-21 本番確認）**

| 項目 | 内容 |
|------|------|
| **本番 URL** | [https://flight-lms.vercel.app/](https://flight-lms.vercel.app/) |
| **リカバリーコード** | Profile 再発行 → **10 件表示 OK**（2026-06-21 手動確認） |
| **主要コミット（初期）** | `54b2a27` feat · `651990f` API tsc · `3e6442c` 統合 · `99401d3` lint |
| **主要コミット（修正）** | `d1c6ec9` login MFA default off · `6edfdc5` flat API · `3648940` AAL2 JWT |
| **Vercel API** | **`api/mfa-recovery-codes.ts`** + `?action=`（ネスト `[action].ts` はデプロイされない） |
| **AAL2（サーバー）** | access token JWT の `aal === 'aal2'`。`getAuthenticatorAssuranceLevel()` は不可 |
| **verify-build** | `WelcomeSetupPage` 非同期 teardown（`b58facd`） |
| **本番 env** | `SUPABASE_SERVICE_ROLE_KEY`（リカバリーコード・削除 API）。任意: `MFA_RECOVERY_CODE_PEPPER` |
| **DB** | [`20260622`](../scripts/database/20260622_profiles_mfa_required_at_login.sql) · [`20260623`](../scripts/database/20260623_mfa_recovery_codes.sql) · [`20260624`](../scripts/database/20260624_profiles_mfa_required_at_login_default_off.sql) |

### **プロフィールページUI改善（2025年12月21日）**

- **入力フィールドのスタイル改善**: 編集モード/非編集モードの背景色・テキスト色を統一
- **パスワード更新日時の表示機能**: `password_updated_at`カラムを追加
- **入力フィールドアイコンの可視性改善**: 時間入力フィールドのアイコンを明るく表示

---

## ⚡ パフォーマンス改善

### **コード分割の実装**

- React.lazyを使用した動的インポート
- Suspenseコンポーネントでローディング状態を管理
- 手動チャンク分割でライブラリを分離

### **パフォーマンス改善結果**

- **メインバンドル**: 1,088.55 kB → 245.07 kB（77.5%削減）
- **分割チャンク**: react-vendor、map-vendor、supabase-vendor、ui-vendor、utils-vendor

---

## 🔧 トラブルシューティング

### **よくある問題と解決方法**

#### **ThemeContext参照エラー**

- **問題**: `ThemeContext`が未定義エラー
- **解決**: 全ファイルの`ThemeContext`依存を削除し、HUD固定スタイル（Dayモード）に統一（2025年12月21日完了）

#### **TypeScript型エラー**

- **問題**: `QuestionType`のインポートエラー
- **解決**: `src/constants.ts`のインポートパスを修正

#### **デバッグログの最適化**

- **問題**: 本番環境でも不要なコンソールログが出力される
- **解決**: 環境変数ベースのロガーユーティリティを作成、開発環境でのみデバッグ情報を表示

#### **Shopページのエラー（2026年1月6日修正・ページは2026年4月撤去）**

- **問題**: `ProductCard.tsx`で`Cannot read properties of undefined (reading 'displayName')`エラーが発生
- **原因**: `RANK_INFO`に存在しないランク（`spectator`、`trainee`）を参照していた
- **解決（当時）**: `ProductCard` / `useShop` でフォールバック、`rankOrder` 更新、デフォルトランクを `fan` に変更
- **現在**: Shop ページ・フックは削除。`/shop`・`/gallery`・`/experience` ルートは **削除済み**

#### **FlightPlanner地図タブのレイヤー表示問題（2026年1月6日修正）**

- **問題**: 地球を一周させるとレイヤーが表示されなくなる
- **原因**: LeafletのGeoJSONレイヤーが地図の表示範囲（bounds）に基づいてフィルタリングされ、経度のラップ処理が適切に行われていなかった
- **解決**: `MapContainer`に`worldCopyJump={true}`を追加し、経度のラップ処理を有効化

#### **ランクアップ進捗表示の問題（2026年1月6日修正）**

- **問題**: Missionページのランクアップ進捗が100%完了のまま固定される
- **原因**: 進捗計算ロジックが現在のXPを`nextRankXpRequired`で直接割っていたため、`nextRankXpRequired`が0の場合に100%固定される
- **解決**:
  - `useGamification.ts`の進捗計算ロジックを修正（現在のランクの必要XPと次のランクの必要XPの差を考慮）
  - `RANK_INFO`の`wingman`の`nextRankXpRequired`を修正（1500に更新）
  - PPL中間ランク（XPベースでないランク）の進捗表示を改善

#### **validateDOMNesting: `<p>` / `<div>` のネスト警告（2026年3月修正）**

- **問題**: `validateDOMNesting(...): <p> cannot appear as a descendant of <p>` または `<div> cannot appear as a descendant of <p>` がMDX記事表示時に発生
- **原因**:
  - MDXパーサーがマークダウンの段落（`<p>`）内にブロック要素（`<div>`, `<blockquote>`等）を配置する構造を生成する
  - アフィリエイト枠直前のJSXコメント（`{/* ... */}`）がMDXパース時に親`<p>`の子として解釈され、その直後の`<div>`が`<p>`内にネストされる
- **対策**:
  - **MDXContent.tsx**: `p`コンポーネントを常に`<div>`でレンダリングしてネスト警告を回避（`src/components/mdx/MDXContent.tsx`）
  - **MDX記事**: アフィリエイト枠（`<div className="flex ...">`）の直前にJSXコメントを置かない。コメントが必要な場合は、前の段落と空行で区切るか、アフィリエイト枠の外側に配置する
- **関連ルール**: `.cursor/rules/mdx-article-guide.mdc` の「DOMネスト回避」を参照

#### **learning_progress 400 Bad Request / rank_code 曖昧エラー（2026年3月修正）**

- **問題**: `learning_progress` の upsert 時に 400 Bad Request、Supabase エラー `column reference "rank_code" is ambiguous` (PostgreSQL 42702)
- **原因**: `check_and_award_ppl_ranks` および `check_rank_up` 関数内の `INSERT ... ON CONFLICT (user_id, rank_code)` で、`rank_code` が PL/pgSQL 変数とテーブルカラムの両方に存在し曖昧になる
- **対策**:
  - `ON CONFLICT (user_id, rank_code)` を `ON CONFLICT ON CONSTRAINT user_ppl_ranks_user_id_rank_code_key` に変更（制約名を明示）
  - 対象ファイル: `scripts/database/ppl_rank_functions.sql`, `scripts/database/ppl_rank_system_migration.sql`
  - Supabase MCP で該当関数を更新して適用

#### **complete_mission 404 / user_cpl_ranks 不存在エラー（2026年3月修正）**

- **問題**: `POST .../rpc/complete_mission` が 404、または `relation "user_cpl_ranks" does not exist` (PostgreSQL 42P01)
- **原因**: `update_profile_rank_for_ppl` が未実装の `user_cpl_ranks` テーブルを参照していた
- **対策**:
  - `rank_integration_functions.sql` 内で `has_cpl_master` を `false` で固定（CPL マスターは将来実装）
  - `gamification_migration.sql` を Supabase で実行して `complete_mission` RPC をデプロイ

#### **記事読了判定の簡素化（2026年3月）**

- **変更**: サイドバー（TableOfContents）のスクロールによる読了判定を廃止
- **理由**: システム簡素化。読了は「一覧ボタン」「次の記事リンク」等の明示的操作でのみトリガー
- **対象**:
  - `src/pages/articles/components/TableOfContents.tsx`: スクロール連動 `updateArticleProgress` 呼び出しを削除
  - サイドバー下の読了率表示（ProgressRing・パーセンテージ）を削除
  - `useTableOfContents.ts`: セクション進捗計算（sectionProgress）を削除

---

## 📚 データベース管理

### **ブログ記事（`src/content/articles`）の精査・非公開・再公開**

自己啓発・思考法系 MDX **28 本**（ファイル名＝`learning_contents.id`＝URL の `contentId`）を内容精査するため、サイトから外す／戻す手順。仕様の正本は [02_System_Spec.md](02_System_Spec.md) の「ブログ記事の一時非表示」。

#### 二段構成（どちらも必要）

| レイヤー | 役割 |
|----------|------|
| アプリ | [`src/constants/withdrawnArticleIds.ts`](../src/constants/withdrawnArticleIds.ts) に ID を列挙し、[`ArticleDetailPage`](../src/pages/articles/ArticleDetailPage.tsx) / [`MDXLoader`](../src/components/mdx/MDXLoader.tsx) で本文を出さない（**直リンク対策**）。[`articlesIndex`](../src/utils/articlesIndex.ts) から除外し関連記事にも出さない。 |
| DB | `learning_contents.is_published = false` で **記事一覧・Prev/Next** 用データから外す。 |

DB だけでは直 URL で MDX が読める。アプリゲートだけでは一覧に残る可能性がある。**精査中は両方そろえる。**

#### 法務・キャラクター確認（再公開前ゲート・2026年6月）

ブログ 28 本は『夢をかなえるゾウ』系キャラクター（ガネーシャ／浪速のゾウ等）を使用しているため、**再公開（PR4）前に**次を完了する。

| # | 確認項目 | 担当 |
|---|----------|------|
| 1 | 文響社／著者への **Web 教育アプリ掲載** の可否（商用／無料の別を明記） | コンテンツ・法務 |
| 2 | キャラクター名・口調・ラジオ形式の **表現模倣** が許容されるか | 同上 |
| 3 | 書籍タイトル・「7つの習慣」等 **概念引用** の可否（キャラとは別枠） | 同上 |
| 4 | 本文棚卸し: `rg "ガネーシャ|夢ゾウ|浪速のゾウ" src/content/articles` | 開発 |
| 5 | 画像棚卸し: `public/images` 内 `ganesha_*` 等 | 開発 |

**許可不可時の差し替え方針**: ナレーターを **道真（Michizane）** ペルソナに統一（[mdx-article-guide](../.cursor/rules/mdx-article-guide.mdc)）。`ganesha_*.jpg` をオリジナル差し替え。meta の `author` / `excerpt` から固有名詞除去。

**再公開ゲート**: 上表 1〜3 がクリア、または 4〜5 の差し替え完了後にのみ「精査完了（再公開する）」へ進む。

#### 精査開始（非公開にする）

1. リポジトリで `withdrawnArticleIds` に 28 ID が入った状態をデプロイする（既にマージ済みならそのビルドを本番へ）。
2. Supabase プロジェクト **FlightAcademy**（`project_id`: `fstynltdfdetpyvbrswr`）に対し、次の SQL を実行する。
   - ファイル: [`scripts/database/20260414_blog_articles_unpublish_learning_contents.sql`](../scripts/database/20260414_blog_articles_unpublish_learning_contents.sql)
   - **Supabase MCP**: Cursor の `plugin-supabase-supabase` → **`execute_sql`** に、`UPDATE public.learning_contents SET is_published = false WHERE id IN (...)` の本文を貼り付けて実行（冪等）。
3. **実施記録（2026-04-14）**: 上記 `UPDATE` を MCP `execute_sql` で本番 DB に対し実行済み。

#### 精査完了（再公開する）

**前提**: 上記「法務・キャラクター確認」ゲートを完了していること。未完了の場合は `withdrawnArticleIds` を空にしない。

1. MDX の修正・法務・表現の確認を完了する。
2. [`src/constants/withdrawnArticleIds.ts`](../src/constants/withdrawnArticleIds.ts) から対象 ID を**すべて削除**し（`WITHDRAWN_ARTICLE_IDS` を空配列にする）、デプロイする。
3. Supabase で [`scripts/database/20260414_blog_articles_republish_learning_contents.sql`](../scripts/database/20260414_blog_articles_republish_learning_contents.sql) を実行し、該当行の `is_published` を **`true`** に戻す（MCP `execute_sql` 可）。
4. **メンタリティタブ**: `mindset` タブは公開中のメンタリティ／思考法記事が 1 件以上あると自動表示（[`getVisibleTabs`](../src/pages/articles/articleHubFilters.ts)）。
5. **齟齬防止**: 「DB は公開・ゲートだけ残っている」と「ゲートは外したが DB が未公開」の状態を避ける。再公開は **SQL（true）とゲート削除デプロイを同じメンテナンス枠で連続実施**する（数分の逆順は許容し、完了後に `/articles` と直リンクの両方を確認）。

#### 確認観点

- `/articles` にカードが出る／出ない（カテゴリフィルタ含む）。
- `/articles/{contentId}` 直アクセスで本文が表示されるか、精査中メッセージになるか。
- `learning_test_mapping` が `articles` の ID を指していないか（あればリンク先が精査中表示になる。必要なら別途マッピング更新）。

### **SupabaseMCPでのprofilesスキーマ確認手順**

1. プロジェクトIDを確認: `FlightAcademy (project_id: fstynltdfdetpyvbrswr)`
2. 次のSQLをMCPから実行:

```sql
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'profiles'
order by ordinal_position;
```

1. 型同期: `src/types/database.types.ts` の `profiles.Row` と齟齬があれば修正

---

## 🚀 開発環境

### **前提ツール**

- Node.js **18 以上**（[docs/README.md](README.md) と一致）
- npm 7.x以上
- Git
- Cursor IDE（推奨）

### **開発サーバー起動**

```bash
npm run dev
```

### **ビルド**

```bash
npm run build
```

---

## 💻 Git運用

### **コミットメッセージ規約**

- **言語**: 英語で記述（文字化け対策のため）
- **フォーマット**: Conventional Commits形式を推奨
  - `feat: Add new feature`
  - `fix: Fix bug in component`
  - `refactor: Refactor code structure`
  - `docs: Update documentation`
  - `chore: Update dependencies`
- **例**:
  ```bash
  git commit -m "feat: Add marketing theme branding"  # 例（英語メッセージ必須）
  git commit -m "fix: Correct rank progress calculation"
  git commit -m "refactor: Simplify Home/About page structure"
  ```

---

## 🧪 テスト・CI/CD運用

### **テスト実行**

```bash
# ローカルでのテスト実行
npm test              # ウォッチモード
npm run test:run      # 1回実行
npm run test:coverage # カバレッジ生成
npm run test:ui       # UIモード
```

### **CI/CD運用**

- **自動実行**: プルリクエスト・プッシュ時に自動実行
- **カバレッジレポート**: プルリクエストに自動コメント
- **手動実行**: GitHub Actionsの「Run workflow」から実行可能

### **トラブルシューティング（テスト）**

- **テストが失敗する場合**: `npm run lint`で型エラーを確認
- **カバレッジが生成されない場合**: `npm run test:coverage`を手動実行
- **CI/CDが失敗する場合**: GitHub Actionsのログを確認

---

## 📝 変更履歴

### **2025年1月 - CI/CD統合**

- GitHub Actionsワークフロー追加（テスト・ビルド検証）
- テストカバレッジレポート自動生成機能追加

### **2025年12月26日**

- `docs/db`ディレクトリを削除（記事作成作業管理用ファイル）

### **2025年12月21日**

- HUDテーマ削除、マーケティング用ダーク×黄テーマへ統一（当時のファンサイト文脈。現在は Flight Academy 独立運営）
- プロフィールページUI改善（入力フィールドスタイル、パスワード更新日時表示）

### **2025年12月24日**

- リポジトリ整理作業完了（未使用ファイルの退避）

### **2026年1月6日**

- Shopページのエラー修正（RANK_INFOに存在しないランクへの参照を修正）
- FlightPlanner地図タブのレイヤー表示問題修正（worldCopyJump設定追加）
- ランクアップ進捗表示の改善（進捗計算ロジックの修正）

### **2026年1月（当時のマーケティング文脈での統一）**

- Home / Header / Footer のマーケティング文言を当時のコンセプトに合わせて変更（履歴。現在の戦略は [00](00_Flight_Academy_Strategy.md)）
- About のメンバー紹介（THE CREW）セクションをコメントアウト（レガシー）

### **2026年2月 - 地図機能のACC Sector/RAPCON情報表示拡張**

- **ignore設定の変更**:
  - `.cursorignore` から `public/geojson/` を削除（Cursorでの編集・検索が可能に）
  - `.gitignore` から `public/geojson/` を削除（Git管理対象に）
- **地図ポップアップ機能**:
  - ACC Sector High/Low、RAPCONレイヤーをクリック時に、周波数・高度範囲をポップアップ表示
  - 表示項目: Callsign、VHF/UHF周波数、高度範囲（Floor-Ceiling）
- **GeoJSONプロパティ構造**:
  - `ACC_Sector_High.geojson`、`ACC_Sector_Low.geojson`、`RAPCON.geojson` の全featureに以下のプロパティを追加
  - `Freq_VHF`、`Freq_UHF`、`Floor`、`Ceiling`（AIP等の資料を参照して値を入力）
- **関連ファイル**: `src/pages/planning/components/map/popups/airspacePopup.ts`、`map/types.ts`

### **2026年2月（ファンサイト仕様強化）**

- **Aboutページ**:
  - パイロット紹介（Hero: The Pilot's Portrait）セクションをコメントアウト（本人許可取得後に復活予定）
  - MISSION BRIEFセクションを拡張: サイトの目的・立ち位置（非公式ファンサイト）、利用メリット（無料学習ツール・ファンコミュニティ・ランクシステム）、注意事項（非公式・情報保証なし・著作権配慮・自己責任）を追加
- **Shopページ**: 公式公認取得後に復活予定のため非表示
  - ナビゲーション・フッターからリンク削除
  - `/shop` 等の旧パスはルート未定義（404）
- **Scheduleページ**:
  - Marketing Section（曲技飛行サービス紹介）とFooter Noteをコメントアウト
  - 2026年空のイベントスケジュールを詳細化: 確定4件（小牧基地3/1、空の日エアポートフェス3/7、いしのまき復興マラソン3/15、岩国フレンドシップデー5/3）、例年開催15件（航空自衛隊・海上自衛隊の航空祭、空の日・空の旬間など）

### **2026年3月 - 記事・進捗・ランク関連エラー修正**

- validateDOMNesting 警告の対策（MDXContent の p→div レンダリング、MDX 記事の JSX コメント配置見直し）
- learning_progress 400 / rank_code 曖昧エラーの修正（ON CONFLICT 制約名の明示）
- complete_mission 404 / user_cpl_ranks 不存在の修正（CPL 未実装のため false 固定）
- 記事読了判定の簡素化（TableOfContents のスクロール連動読了を廃止、読了率表示・セクション進捗計算を削除）
- アフィリエイト枠レイアウトの統一（画像・テキストのバランス調整）
- 文字化け修正（RelatedArticles、ArticleJsonLd、HomePage）

### **2026年3月 - PPL記事の編集・新規とSupabase登録**

- **aero-1-2** PPL-1-1-2_AirspeedBasics 強化（CAS/EAS、2%ルール、大砲ラーメン比喩）
- **aero-2-2** PPL-1-1-7_VnDiagram リライト（大分団子汁比喩、Va=Accelerated Stall）
- **aero-2-3** PPL-1-1-10_TakeoffLandingPerformance 新規（密度高度、加速停止、50ft、追い風21%）
- **Supabase**: `learning_contents` に上記3件を登録（`scripts/database/insert_ppl_1_1_2_7_10.sql`）

**詳細な変更履歴はGitのコミット履歴を参照してください。**

---

**最終更新**: 2026年3月（PPL記事編集・新規、Supabase登録）
**バージョン**: Operations & Maintenance Guide v2.2
**管理者**: FlightAcademy開発チーム