# Phase D cohort weekly pilot (本番)

**Status**: Live on production (2026-06-21)
**Docs**: `docs/02_System_Spec.md` (cohort), `docs/04_Operations_Guide.md` (cron/notify)

## Schedule
- Vercel Cron: `0 0 * * 0` UTC = **Sun 09:00 JST**
- Endpoint: `api/cron/cohort-weekly.ts`
- Flow: prev week scores → TOP3 badges → in-app enqueue → Brevo email (parallel)

## Vercel env (Production)
- `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL` or `SUPABASE_URL`
- `BREVO_API_KEY`, `BREVO_SENDER_EMAIL` (verified: `1031102104290504kage@gmail.com`)
- `VITE_APP_URL` (default: `https://flight-lms.vercel.app`)

## DB
- `20260620_cohort_weekly_missions.sql` — schema + RPC
- `20260621_cohort_rpc_hardening.sql` — service_role cron RPCs, authenticated user RPCs

## Auth email (separate path)
- Supabase Custom SMTP (Brevo SMTP key, not API key)
- Japanese templates manual in Dashboard
- UI spam hints: `EmailDeliveryHint`

## Related Serena
- `mem:ops/supabase_security_advisor`
