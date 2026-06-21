# Profile Hub + MFA (2026-06)

**Status**: **Production deployed & recovery codes verified** on `main` (2026-06-21, `https://flight-lms.vercel.app/`)
**Docs**: `docs/02_System_Spec.md` (Profile Hub), `docs/04_Operations_Guide.md` (MFA ops), `docs/03_Development_Guide.md` (Vercel 12-fn limit), `DESIGN.md`

## Profile Hub IA
- 4 sections via `?tab=`: `profile` | `learning` | `privacy` | `account`
- Legacy: `leaderboard`→privacy, `cohort`→learning, `social`→profile, `security`→account
- Mobile: section list → drill-down + back link; Desktop: `ProfileHubSidebar`
- Completion: `ProfileCompletionStrip` (cohort excluded; notification autosave counts)
- Unsaved guard: explicit Save forms only (`useUnsavedFormGuard`); notifications debounce autosave (inline status, no `onSuccess` toast)

## MFA (Supabase TOTP)
- `profiles.mfa_required_at_login` (default **false**, opt-in) — login-time MFA toggle in Profile when 2FA enrolled
- Login gate: `AuthPage` + `ProtectedRoute` → `/auth?mfa=required`; sensitive ops always need TOTP if factors exist
- Core: `src/auth/mfaAuth.ts`, UI `LoginMfaChallenge`, `ProfileMfaSection`
- Session: `persistSession` + `autoRefreshToken` in `src/utils/supabase.ts` (~1 week refresh; no idle timeout)
- iPhone: codes in **Passwords** app; Android: Authenticator apps; **no email codes**

## Recovery codes
- Table: `mfa_recovery_codes` (hashed); SQL `20260623_mfa_recovery_codes.sql`
- **Single serverless handler**: `api/mfa-recovery-codes.ts` — **flat file** (Vercel does not deploy nested `[action].ts` reliably)
- Client calls: `/api/mfa-recovery-codes?action=generate|consume|status|clear`
- Legacy rewrite: `vercel.json` maps `/api/account/mfa-recovery-codes/{action}` → `?action=` (compat only)
- **AAL2 on server**: decode JWT `aal` claim from verified access token — **do not** use `getAuthenticatorAssuranceLevel()` on stateless per-request client (always reports below aal2 → 403)
- Core logic: `api/_lib/mfaRecoveryCodesCore.ts`; client `src/utils/mfaRecoveryCodesApi.ts`
- Profile UI: inline recovery panel + form errors (`ProfileMfaSection.tsx`); safe JSON parse in client API
- 10 one-time codes shown once at enroll or regenerate; Profile regenerate requires TOTP then AAL2 token
- **Production verified (2026-06-21)**: Profile → 新しいリカバリーコードを発行 → 10 件表示 OK
- Env: `SUPABASE_SERVICE_ROLE_KEY` required; optional `MFA_RECOVERY_CODE_PEPPER`

## Account delete
- `POST /api/account/delete` — confirm phrase + password if email provider

## DB migrations (applied via Supabase MCP)
- `20260622_profiles_mfa_required_at_login.sql`
- `20260623_mfa_recovery_codes.sql`
- `20260624_profiles_mfa_required_at_login_default_off.sql` (default false, existing rows reset)

## Deploy / CI notes (2026-06-21)
- Initial feat: `54b2a27` (feat), `651990f` (API tsc), `3e6442c` (consolidate `[action].ts`), `99401d3` (lint)
- Post-deploy fixes: `d1c6ec9` (login MFA default off + regenerate UX), `b58facd` (API routing attempt), `6edfdc5` (flat `mfa-recovery-codes.ts`), `3648940` (**AAL2 JWT** — root cause for 403)
- Vercel failure after feat: **13 serverless functions** > Hobby **12** limit → consolidate recovery routes
- **Nested `[action].ts` not deployed on Vercel** → use flat `api/mfa-recovery-codes.ts` + `?action=` query
- verify-build: `WelcomeSetupPage.test.tsx` async teardown fix (`b58facd`); `NotificationPreferences` unused `onSuccess` (`99401d3`)

## Tests
- Vitest: `mfaAuth`, `mfaRecoveryCodesCore`, profile hub, ProtectedRoute, notification autosave, WelcomeSetupPage (427+ tests green)
- E2E: `e2e/profile-settings.spec.ts`
- Manual E2E (2026-06-21): Profile recovery code regenerate → 10 codes displayed
