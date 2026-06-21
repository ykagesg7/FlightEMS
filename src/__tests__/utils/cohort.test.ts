import { describe, expect, it } from 'vitest';
import {
  MIN_COHORT_FOR_TOP3,
  buildCohortKey,
  cohortWeekIndexFromIsoWeek,
  formatCohortKeyLabel,
  getIsoWeekJst,
  isInCohortScoringWindow,
} from '@/utils/cohort';

describe('cohort utils', () => {
  it('builds keys for set and undecided', () => {
    expect(buildCohortKey('CPL', '2026-12', false)).toBe('CPL-2026-12');
    expect(buildCohortKey('CPL', null, true)).toBe('CPL-UNDECIDED');
    expect(() => buildCohortKey('CPL', null, false)).toThrow();
  });

  it('formats cohort labels', () => {
    expect(formatCohortKeyLabel('CPL-2026-12')).toBe('CPL · 2026年12月');
    expect(formatCohortKeyLabel('CPL-UNDECIDED')).toBe('CPL · 受験日未定');
    expect(formatCohortKeyLabel(null)).toBe('未登録');
  });

  it('uses min population constant', () => {
    expect(MIN_COHORT_FOR_TOP3).toBe(10);
  });

  it('rotates week index 1-4', () => {
    expect(cohortWeekIndexFromIsoWeek('2026-W01')).toBe(1);
    expect(cohortWeekIndexFromIsoWeek('2026-W05')).toBe(1);
    expect(cohortWeekIndexFromIsoWeek('2026-W02')).toBe(2);
  });

  it('computes ISO week in JST', () => {
    const week = getIsoWeekJst(new Date('2026-06-15T00:00:00+09:00'));
    expect(week).toMatch(/^\d{4}-W\d{2}$/);
  });

  it('scores activity within ISO week window', () => {
    const isoWeek = getIsoWeekJst(new Date('2026-06-18T12:00:00+09:00'));
    const ts = new Date('2026-06-18T12:00:00+09:00');
    expect(isInCohortScoringWindow(isoWeek, ts)).toBe(true);
  });
});
