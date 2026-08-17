import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockGte = vi.fn();

vi.mock('../../utils/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn((_col: string, _iso: string) => mockGte()),
        })),
      })),
    })),
  },
}));

import { buildDailyStudyStats } from '../../utils/heatmapData';

describe('buildDailyStudyStats', () => {
  beforeEach(() => {
    mockGte.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-06T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty array when Supabase returns error', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGte.mockResolvedValue({ data: null, error: { message: 'err' } });

    const rows = await buildDailyStudyStats('user-1', 7);

    expect(rows).toEqual([]);
    errSpy.mockRestore();
  });

  it('fills calendar days and maps minutes to intensity tiers', async () => {
    mockGte.mockResolvedValue({
      data: [
        {
          duration_minutes: 5,
          created_at: '2026-05-06T08:00:00.000Z',
        },
        {
          duration_minutes: 40,
          created_at: '2026-05-06T09:00:00.000Z',
        },
      ],
      error: null,
    });

    const rows = await buildDailyStudyStats('user-2', 3);

    expect(rows).toHaveLength(3);
    expect(rows.every((r) => r.date.match(/^\d{4}-\d{2}-\d{2}$/))).toBe(true);
    const peak = rows.find((r) => r.minutes === 45);
    expect(peak).toBeDefined();
    expect(peak?.intensity).toBe(2);
    expect(peak?.sessionCount).toBe(2);
  });

  it('assigns intensity 0 for no study and 3 for long sessions', async () => {
    mockGte.mockResolvedValue({
      data: [{ duration_minutes: 50, created_at: '2026-05-04T12:00:00.000Z' }],
      error: null,
    });

    const rows = await buildDailyStudyStats('user-3', 5);
    const quiet = rows.filter((r) => r.minutes === 0);
    expect(quiet.length).toBeGreaterThan(0);
    expect(quiet.every((r) => r.intensity === 0)).toBe(true);

    const heavy = rows.find((r) => r.minutes >= 46);
    expect(heavy?.intensity).toBe(3);
  });

  it('buckets sessions after 15:00 UTC onto the next JST calendar day', async () => {
    vi.setSystemTime(new Date('2026-08-16T16:00:00.000Z'));
    mockGte.mockResolvedValue({
      data: [{ duration_minutes: 12, created_at: '2026-08-16T15:30:00.000Z' }],
      error: null,
    });

    const rows = await buildDailyStudyStats('user-jst', 3);
    const nextJstDay = rows.find((r) => r.date === '2026-08-17');
    expect(nextJstDay?.minutes).toBe(12);
    expect(rows.find((r) => r.date === '2026-08-16')?.minutes).toBe(0);
  });
});
