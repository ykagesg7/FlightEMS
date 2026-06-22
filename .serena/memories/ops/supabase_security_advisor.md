# Supabase Security Advisor — FlightAcademy 本番

**Project**: `fstynltdfdetpyvbrswr` (Free, ap-northeast-1)
**Docs**: `docs/04_Operations_Guide.md` § Supabase Security Advisor

## 2026-06-22 状態（mfa_recovery_codes RLS ポリシー追加後）

7 WARN — いずれも即時修正不要:

0. ~~**rls_enabled_no_policy** (`mfa_recovery_codes`)~~ — **解消**（`20260625_mfa_recovery_codes_rls_policies.sql` で anon/authenticated 向け deny ポリシー追加。service_role API のみ）

1. **authenticated_security_definer_function_executable ×5** — 許容。cohort ユーザー RPC（`upsert_user_cohort`, `get_user_cohort_profile`, `get_cohort_anonymous_stats`, `mark_written_exam_complete`, `get_public_user_badges`）。`SECURITY DEFINER` + `auth.uid()`/opt-in + `SET search_path=public`。`anon` EXECUTE revoke 済（`20260621_cohort_rpc_hardening.sql`）。INVOKER 化禁止。

2. **auth_leaked_password_protection** — Free 制限。Pro でのみ ON。

3. **vulnerable_postgres_version** — `15.8.1.085`。Pause/Restore 後も同一。プラットフォーム配信待ち or Pro in-place upgrade。

## cron RPC（解消済）

`compute_cohort_weekly_scores`, `award_cohort_weekly_top3`, `enqueue_cohort_notifications` → **service_role only**（anon WARN 解消）。

## MCP

- 監査: `get_advisors` (type: security)
- 不可: Postgres upgrade, Auth templates, Auth UI toggles

## Brevo キー 3 種

MCP token / `BREVO_API_KEY` (Vercel) / SMTP key (Supabase Auth) — 混同禁止。
