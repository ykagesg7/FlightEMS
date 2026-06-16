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
      weeklyStudyMinutes: 0,
      streakDays: 0,
      weakTopics: [],
      publicLeaderboard: [],
    });
    expect(metrics.nextLesson).toBeUndefined();
    expect(metrics.xpBenchmark).toBeUndefined();
  });
});
