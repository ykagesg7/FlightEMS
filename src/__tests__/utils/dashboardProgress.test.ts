import { describe, expect, it } from 'vitest';
import type { DashboardMetrics } from '../../types/dashboard';
import { hasDashboardLearningProgress } from '../../utils/dashboardProgress';

const emptyMetrics = (): DashboardMetrics => ({
  overallProgressPct: 0,
  testAccuracyPct: 0,
  testTotalAttempts: 0,
  todayStudyMinutes: 0,
  weeklyStudyMinutes: 0,
  streakDays: 0,
  weakTopics: [],
  publicLeaderboard: [],
});

describe('hasDashboardLearningProgress', () => {
  it('returns false for a brand-new user snapshot', () => {
    expect(hasDashboardLearningProgress(emptyMetrics(), { xpPoints: 0 })).toBe(false);
  });

  it('returns true when quiz attempts exist', () => {
    expect(
      hasDashboardLearningProgress({ ...emptyMetrics(), testTotalAttempts: 1 }),
    ).toBe(true);
  });

  it('returns true when profile XP is positive', () => {
    expect(hasDashboardLearningProgress(emptyMetrics(), { xpPoints: 100 })).toBe(true);
  });

  it('returns true when article completion progress exists', () => {
    expect(
      hasDashboardLearningProgress({ ...emptyMetrics(), overallProgressPct: 1 }),
    ).toBe(true);
  });

  it('returns true when a next lesson is in progress', () => {
    expect(
      hasDashboardLearningProgress({
        ...emptyMetrics(),
        nextLesson: { id: 'ppl-1', title: '記事' },
      }),
    ).toBe(true);
  });

  it('returns true when study time is recorded', () => {
    expect(
      hasDashboardLearningProgress({ ...emptyMetrics(), todayStudyMinutes: 5 }),
    ).toBe(true);
  });
});
