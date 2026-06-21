# Test Hub Refactor (June 2026)

## Entry point
- `src/pages/test/TestPage.tsx` — hub tabs via URL search params (`testHubFilters.ts`)

## Key extracted modules
| Module | Role |
|--------|------|
| `testHubFilters.ts` | Parse/build hub URL params (tab, mode, count, contentId, etc.) |
| `testQuizFetch.ts` | Question pool fetch; includes `fetchQuestionPreviewById` for admin preview |
| `quizQuestionUtils.ts` | Map `unified_cpl_questions` rows → `QuizQuestion` |
| `formatQuizQuestionText.ts` | Question text formatter; supports `(ア)(イ)(ウ)(エ)` katakana choices |
| `buildQuizLearningSession.ts` | Correct `learning_sessions` insert shape (`session_metadata`, `content_id`, `session_duration`) |
| `useTestSubjectFilters.ts` | Subject filter state for PPL/CPL pools |

## UI components (under `src/pages/test/components/`)
- `QuizHubToolbar`, `QuizFilterDrawer`, `QuizActiveFilterChips`, `TestSubjectFilterSection`, `WeakAreasHero`, `QuizQuestionText`, `FilterListbox`

## Known fixes applied
- `user_test_results` uses column `session_id` (not `quiz_session_id`)
- `QuizComponent` auto-scroll uses `prevQuestionIndexRef` (not `prevQuestionIndexForScrollRef`)
- Report dialog must use portal — nested form caused quiz abort + failed DB insert

## Tests
- `src/__tests__/planning/buildQuizLearningSession.test.ts`
- `src/__tests__/planning/formatQuizQuestionText.test.ts`
- `src/__tests__/planning/testHubFilters.test.ts`
- `src/__tests__/planning/questionReportLinks.test.ts`
- `src/__tests__/planning/canDeleteQuestionReport.test.ts`

## Docs updated (in commit 865c6d9)
- `docs/02_System_Spec.md`, `docs/Component_Structure_Guide.md`, `docs/README.md`, `docs/Scripts_Repository_Tooling.md`

## Uncommitted work (as of 2026-06-07, separate from 865c6d9)
- Airspace map layer refactor (`planning/components/map/*`, RAPCON.geojson)
- Various docs/content pipeline edits
- `HomeQuizDiagnostic`, lift/drag MDX mapping SQL
