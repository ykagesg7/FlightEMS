import { describe, expect, it } from 'vitest';
import {
  addJstCalendarDays,
  formatJstYmd,
  jstWeekday,
  startOfJstCalendarDaysAgoUtc,
  startOfJstDayUtc,
} from '../../utils/jstDate';

describe('jstDate', () => {
  it('maps 15:00 UTC to the next JST calendar day', () => {
    const utc = new Date('2026-08-16T15:00:00.000Z');
    expect(formatJstYmd(utc)).toBe('2026-08-17');
    expect(startOfJstDayUtc(utc).toISOString()).toBe('2026-08-16T15:00:00.000Z');
  });

  it('keeps 14:59 UTC on the previous JST calendar day', () => {
    const utc = new Date('2026-08-16T14:59:00.000Z');
    expect(formatJstYmd(utc)).toBe('2026-08-16');
  });

  it('adds calendar days across month boundaries', () => {
    expect(addJstCalendarDays('2026-08-01', -1)).toBe('2026-07-31');
    expect(addJstCalendarDays('2026-08-17', 0)).toBe('2026-08-17');
  });

  it('returns Sunday as 0 for a known JST date', () => {
    // 2026-08-16 is Sunday in JST
    expect(jstWeekday('2026-08-16')).toBe(0);
    expect(jstWeekday('2026-08-17')).toBe(1);
  });

  it('startOfJstCalendarDaysAgoUtc covers today plus six prior JST days', () => {
    const now = new Date('2026-08-17T01:00:00.000Z'); // 10:00 JST Aug 17
    const start = startOfJstCalendarDaysAgoUtc(6, now);
    expect(formatJstYmd(start)).toBe('2026-08-11');
    expect(start.toISOString()).toBe('2026-08-10T15:00:00.000Z');
  });
});
