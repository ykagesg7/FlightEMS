# Gamification Phase 1–2 (2026-07-20)

> Note: memory filename must not match repo `.gitignore` pattern `phase*.md`.

## Production
- Project: `fstynltdfdetpyvbrswr`
- SQL: `scripts/database/20260720_gamification_phase1_foundation.sql`, `..._production_hardening.sql`, `..._phase2_mastery_loop.sql`, `..._phase2_rpc_invoker_wrappers.sql` — **applied**

## XP / ALPM (server-calculated, auth.uid fixed)
| Event | XP | Notes |
|-------|---:|-------|
| registration | 100 | welcome setup |
| article_read | 5 | ≥95% progress |
| article_comprehension | 10 | content quiz ≥3 Q, ≥80% |
| quiz_session | 10+2/correct+15 perfect | exam ×1.25 |
| delayed_retention | 10/qid | due SRS or prior wrong ≥7d then correct |
| weakness_improvement | 15/subject/ISO week | recent 10 ≥70% after weak history |
| weekly_mission | 20 | cohort |
| formation_quest | 10 | ≥50% cohort qualified |
| MVP / TOP3 | +30 / +20 | |

## Mastery loop order (critical)
Client `runMasteryLoopAfterSession(sessionId)` after quiz save:
1. `award_delayed_retention_xp` **before** SRS sync (due check)
2. `sync_srs_after_session` → `user_unified_srs_status` SM-2-lite
3. `award_weakness_improvement_xp` (calls `refresh_user_weak_areas`)

Wired from `TestPage` / `CPLExamSession`. Results shown in `QuizResultsView` via `QuizSessionRewardSummary`.

## Key RPCs
- `get_learning_journey`, `get_cohort_formation_progress` — public INVOKER → private DEFINER impl
- `user_weak_areas` UNIQUE (user_id, subject_category, sub_category); trend: improving|declining|stable
- SRS `question_id` uuid → `unified_cpl_questions`; set `unified_question_id` on insert

## Related memory
- UI: `mem:ux/home_articles_quiz_2026_07`

## Docs
- Spec: `docs/02_System_Spec.md` gamification + Home/Articles/Quiz UX
- Ops: `docs/04_Operations_Guide.md` release checklist
- NSM: `docs/Product_North_Star_and_GTM.md`
