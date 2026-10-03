import { describe, expect, it } from 'vitest';
import {
  getIsoWeekJst,
  getPreviousIsoWeekJst,
  getPreviousIsoWeekKey,
} from '../../../api/_lib/cohortWeek';

describe('api/lib/cohortWeek', () => {
  it('returns ISO week string', () => {
    expect(getIsoWeekJst(new Date('2026-06-15T00:00:00+09:00'))).toMatch(/^\d{4}-W\d{2}$/);
  });

  it('returns previous week', () => {
    const prev = getPreviousIsoWeekJst(new Date('2026-06-15T00:00:00+09:00'));
    expect(prev).toMatch(/^\d{4}-W\d{2}$/);
  });

  it('returns previous digest key (W41 → W40; W01 → prior year)', () => {
    expect(getPreviousIsoWeekKey('2026-W41')).toBe('2026-W40');
    expect(getPreviousIsoWeekKey('2026-W01')).toBe('2025-W52');
  });
});
