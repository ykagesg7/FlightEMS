# Admin Management Hub

## Access control
- Admin check: `src/utils/isAdminUser.ts` — `profile.roll.toLowerCase() === 'admin'`
- Routes wrapped in `<ProtectedRoute requireAdmin>` in `src/App.tsx`

## Routes
| Path | Component |
|------|-----------|
| `/admin` | `AdminHubPage.tsx` |
| `/admin/question-reports` | `QuestionReportsPage.tsx` |
| `/admin/ranks` | `RankConfigPage.tsx` |
| `/admin/xp` | `XpConfigPage.tsx` |

## Navigation
- Nav items: `src/constants/adminNav.ts` (`ADMIN_NAV_ITEMS`)
- Header: `MarketingLayout.tsx` shows **ADMIN** link when `isAdminUser(profile)`
- User menu: `UserMenu.tsx` lists admin hub + sub-pages for admins

## Shared UI
- `src/pages/admin/components/AdminPageShell.tsx` — brand-consistent layout, `ADMIN_INPUT_CLASS`, `ADMIN_CARD_CLASS`
- Hub page uses `showHubLink={false}` to hide redundant "管理 Hub" button

## Rank config (`/admin/ranks`)
- Reads/deletes from Supabase `rank_requirements` table
- Grouped by `RANK_INFO` from `src/types/gamification.ts`
- Fixed prior bug: removed undefined `isAdmin` guard (ProtectedRoute handles auth)

## XP config (`/admin/xp`)
- Edits `articleXpRewards.json` defaults in UI
- Persists to `localStorage` key `articleXpConfig` (browser-local only; DB migration TBD)
- Supports categories, first_read_bonus, series_completion_bonus (incl. PPL/CPL completion bonus fields from JSON)
