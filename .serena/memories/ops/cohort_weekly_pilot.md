# Phase D cohort weekly pilot (本番)

**Status**: Live on production (2026-06-21)
**Docs**: `docs/02_System_Spec.md` (cohort), `docs/04_Operations_Guide.md` (cron/notify)

## Schedule
- Vercel Cron: `0 0 * * 0` UTC = **Sun 09:00 JST**
- Endpoint: `api/cron/cohort-weekly.ts`
- Flow: prev week scores → MVP/TOP3 badges → in-app enqueue → Brevo email (parallel)

## Weekly awards (tiered)
- **3–9** active members in cohort → **MVP** (`rank=1`, `metric_value>0`, co-MVP ties allowed)
- **10+** active → **TOP3** (`rank<=3`, `metric_value>0`)
- **0–2** → no awards
- RPC: `award_cohort_weekly_top3` (name unchanged); metadata: `award_mode`, `participant_count`
- Migration: `20260626_cohort_weekly_mvp_tier_awards.sql` (applied via MCP)
- Frontend: `MIN_COHORT_FOR_MVP=3`, `MIN_COHORT_FOR_TOP3=10`; `get_cohort_anonymous_stats` returns `award_tier`

## Vercel env (Production)
- `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL` or `SUPABASE_URL`
- `BREVO_API_KEY`, `BREVO_SENDER_EMAIL` (verified: `1031102104290504kage@gmail.com`)
- `VITE_APP_URL` (default: `https://flight-lms.vercel.app`)

## DB
- `20260620_cohort_weekly_missions.sql` — schema + RPC
- `20260621_cohort_rpc_hardening.sql` — service_role cron RPCs, authenticated user RPCs
- `20260626_cohort_weekly_mvp_tier_awards.sql` — MVP/TOP3 tier thresholds

## Auth email (separate path)
- Supabase Custom SMTP (Brevo SMTP key, not API key)
- Japanese templates manual in Dashboard
- UI spam hints: `EmailDeliveryHint`

## Related Serena
- `mem:ops/supabase_security_advisor`
