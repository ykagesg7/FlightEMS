import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRpc = vi.fn();

vi.mock('../../utils/supabase', () => ({
  supabase: {
    from: vi.fn(() => {
      throw new Error('from_failed');
    }),
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

import {
  fetchDashboardMetrics,
  MIN_POPULATION_FOR_XP_BENCHMARK,
  splitStudyMinutesJst,
} from '../../utils/dashboard';

describe('dashboard utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRpc.mockResolvedValue({ data: null, error: null });
  });

  it('exports minimum population threshold for XP benchmark', () => {
    expect(MIN_POPULATION_FOR_XP_BENCHMARK).toBe(5);
  });

  it('fetchDashboardMetrics falls back when all safeGet sources throw or RPC fail', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'rpc err' } });

    const metrics = await fetchDashboardMetrics('user-xyz');

    expect(metrics).toMatchObject({
      overallProgressPct: 0,
      testAccuracyPct: 0,
      todayStudyMinutes: 0,
      weeklyStudyMinutes: 0,
      streakDays: 0,
      weakTopics: [],
      publicLeaderboard: [],
    });
    expect(metrics.nextLesson).toBeUndefined();
    expect(metrics.xpBenchmark).toEqual({
      xpPoints: 0,
      populationN: 0,
      percentile: null,
      rankTier: null,
      cohortN: null,
      cohortPercentile: null,
    });
  });

  it('splitStudyMinutesJst buckets today vs the 7-day window in JST', () => {
    const now = new Date('2026-08-16T16:00:00.000Z'); // 2026-08-17 01:00 JST
    const split = splitStudyMinutesJst(
      [
        { duration_minutes: 10, created_at: '2026-08-16T16:30:00.000Z' },
        { duration_minutes: 20, created_at: '2026-08-16T14:00:00.000Z' },
        { duration_minutes: 5, created_at: null },
      ],
      now,
    );
    expect(split.todayMinutes).toBe(10);
    expect(split.weeklyMinutes).toBe(30);
  });
});
