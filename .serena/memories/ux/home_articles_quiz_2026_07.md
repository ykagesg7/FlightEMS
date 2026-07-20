# HOME / Articles / Quiz UX restructure (2026-07-20)

Commits: `2647bcc` (CI), `2e69ec1` (UX). GitHub `test` + `verify-build` green.

## Principles
- 1 screen / 1 job; show every XP/milestone award in UI
- DESIGN.md HUD tokens only (no new brand system)

## HOME (`HomePage` DashboardContent)
Order: 「今日の1手」header + `InAppNotificationBell` → `LearningJourneyCard` (labels: 復習待ち not SRS) → summary×3 → `DailyTasks` → `CohortMissionSection` (Cohort+Formation; unregistered=CTA only) → continue/weak links (`buildWeakSubjectHref`) → `<details>`詳しく (radar/heatmap/time/benchmark/leaderboard) → pillars PLANNING / **学習記事** / QUIZ

Legacy: `FormationQuestCard` / `CohortCard` still exist; prefer `CohortMissionSection`.

## Articles
- Back link `/` 「学習ダッシュボードへ」
- `NextComprehensionCTA`: one read-but-not-comprehended article
- Card chips: 未読 / 読了 / 理解確認済 via `articleComprehensionStatus` + `useArticleProgress` batch (`learning_progress` + milestones `article_comprehension`)
- `ProgressSidebar` xl+ only

## Quiz
- `QuizResultsView`: 学習成果 block + Primary CTA (incorrect retry / home or article) + 「その他の操作」collapse
- Review tab copy: 「復習待ちの問題です…」
- `awardQuizSessionXp` returns `{ success, xpAwarded }`

## CI note
`structuredData` wordCount = `readingTime * 200` (test expects 3000 for 15min). eslint ignores `artifacts/**`.

## Terminology (UI)
| Internal | Display |
|----------|---------|
| BLOG | 学習記事 |
| SRS due | 復習待ち |
| delayed_retention | あとで思い出せた |
| weakness_improvement | 苦手を伸ばした |
