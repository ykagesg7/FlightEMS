# Profile Hub + MFA (2026-06)

**Status**: **Production deployed** on `main` (2026-06-21, `https://flight-lms.vercel.app/`)
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
- **Single serverless handler**: `api/mfa-recovery-codes/[action].ts` + `vercel.json` rewrite to `/api/account/mfa-recovery-codes/{action}`
- Client URLs unchanged:
  - `POST /api/account/mfa-recovery-codes/generate` (AAL2)
  - `POST .../consume` (login lockout)
  - `GET .../status`, `POST .../clear` on unenroll
- Core logic: `api/_lib/mfaRecoveryCodesCore.ts`; client `src/utils/mfaRecoveryCodesApi.ts`
- 10 one-time codes shown once at enroll; Profile can regenerate (invalidates old)
- Env: `SUPABASE_SERVICE_ROLE_KEY` required; optional `MFA_RECOVERY_CODE_PEPPER`

## Account delete
- `POST /api/account/delete` — confirm phrase + password if email provider

## DB migrations (applied via Supabase MCP)
- `20260622_profiles_mfa_required_at_login.sql`
- `20260623_mfa_recovery_codes.sql`
- `20260624_profiles_mfa_required_at_login_default_off.sql` (default false, existing rows reset)

## Deploy / CI notes (2026-06-21)
- Commits: `54b2a27` (feat), `651990f` (API tsc), `3e6442c` (consolidate `[action].ts`), `99401d3` (lint: remove unused `onSuccess`)
- Vercel failure after feat: **13 serverless functions** > Hobby **12** limit → consolidate recovery routes
- verify-build failure: ESLint unused `onSuccess` in `NotificationPreferences.tsx` after autosave refactor

## Tests
- Vitest: `mfaAuth`, `mfaRecoveryCodesCore`, profile hub, ProtectedRoute, notification autosave (426 tests green)
- E2E: `e2e/profile-settings.spec.ts`
