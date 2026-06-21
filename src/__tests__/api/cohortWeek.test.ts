import { describe, expect, it } from 'vitest';
import { getIsoWeekJst, getPreviousIsoWeekJst } from '../../../api/_lib/cohortWeek';

describe('api/lib/cohortWeek', () => {
  it('returns ISO week string', () => {
    expect(getIsoWeekJst(new Date('2026-06-15T00:00:00+09:00'))).toMatch(/^\d{4}-W\d{2}$/);
  });

  it('returns previous week', () => {
    const prev = getPreviousIsoWeekJst(new Date('2026-06-15T00:00:00+09:00'));
    expect(prev).toMatch(/^\d{4}-W\d{2}$/);
  });
});
