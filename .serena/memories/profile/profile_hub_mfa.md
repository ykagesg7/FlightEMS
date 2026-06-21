# Profile Hub + MFA (2026-06)

**Status**: Implemented on main (deploy after push)
**Docs**: `docs/02_System_Spec.md` (Profile Hub), `docs/04_Operations_Guide.md` (MFA ops), `DESIGN.md`

## Profile Hub IA
- 4 sections via `?tab=`: `profile` | `learning` | `privacy` | `account`
- Legacy: `leaderboard`→privacy, `cohort`→learning, `social`→profile, `security`→account
- Mobile: section list → drill-down + back link; Desktop: `ProfileHubSidebar`
- Completion: `ProfileCompletionStrip` (cohort excluded; notification autosave counts)
- Unsaved guard: explicit Save forms only (`useUnsavedFormGuard`); notifications debounce autosave

## MFA (Supabase TOTP)
- `profiles.mfa_required_at_login` (default true) — login-time MFA toggle in Profile when 2FA enrolled
- Login gate: `AuthPage` + `ProtectedRoute` → `/auth?mfa=required`; sensitive ops always need TOTP if factors exist
- Core: `src/auth/mfaAuth.ts`, UI `LoginMfaChallenge`, `ProfileMfaSection`
- iPhone: codes in **Passwords** app; Android: Authenticator apps; **no email codes**

## Recovery codes
- Table: `mfa_recovery_codes` (hashed); SQL `20260623_mfa_recovery_codes.sql`
- API (needs `SUPABASE_SERVICE_ROLE_KEY`):
  - `POST /api/account/mfa-recovery-codes/generate` (AAL2)
  - `POST /api/account/mfa-recovery-codes/consume` (login lockout)
  - `GET .../status`, `POST .../clear` on unenroll
- 10 one-time codes shown once at enroll; Profile can regenerate (invalidates old)
- Optional env: `MFA_RECOVERY_CODE_PEPPER`

## Account delete
- `POST /api/account/delete` — confirm phrase + password if email provider

## DB migrations
- `20260622_profiles_mfa_required_at_login.sql`
- `20260623_mfa_recovery_codes.sql`

## Tests
- Vitest: `mfaAuth`, `mfaRecoveryCodesCore`, profile hub, ProtectedRoute, notification autosave
- E2E: `e2e/profile-settings.spec.ts`
