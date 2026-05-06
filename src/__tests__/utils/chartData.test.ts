import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockEq = vi.fn();

vi.mock('../../utils/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn((_col: string, _userId: string) => mockEq()),
      })),
    })),
  },
}));

import { buildSubjectRadarData } from '../../utils/chartData';

describe('buildSubjectRadarData', () => {
  beforeEach(() => {
    mockEq.mockReset();
  });

  it('returns zero-filled radar when query errors or has no rows', async () => {
    mockEq.mockResolvedValueOnce({ data: null, error: { message: 'db' } });
    const errCase = await buildSubjectRadarData('u1');
    expect(errCase.labels).toHaveLength(5);
    expect(errCase.values).toEqual([0, 0, 0, 0, 0]);

    mockEq.mockResolvedValueOnce({ data: [], error: null });
    const empty = await buildSubjectRadarData('u2');
    expect(empty.values).toEqual([0, 0, 0, 0, 0]);
  });

  it('aggregates correct rate per subject including alias mapping', async () => {
    mockEq.mockResolvedValue({
      data: [
        { subject_category: '航空工学', is_correct: true },
        { subject_category: '航空工学', is_correct: false },
        { subject_category: '機体', is_correct: true },
        { subject_category: '通信', is_correct: true },
        { subject_category: '航空法規', is_correct: false },
        { subject_category: '航空法規', is_correct: true },
      ],
      error: null,
    });

    const radar = await buildSubjectRadarData('u3');

    expect(radar.labels).toEqual([
      '航空工学',
      '航空気象',
      '空中航法',
      '航空通信',
      '航空法規',
    ]);
    // 航空工学: 2 / 3 → 67%
    expect(radar.values[0]).toBe(67);
    // 航空通信: 1/1 → 100%
    expect(radar.values[3]).toBe(100);
    // 航空法規: 1/2 → 50%
    expect(radar.values[4]).toBe(50);
    expect(radar.values[1]).toBe(0);
    expect(radar.values[2]).toBe(0);
  });
});
