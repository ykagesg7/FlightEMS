import { describe, expect, it } from 'vitest';
import {
  MIN_COHORT_FOR_MVP,
  MIN_COHORT_FOR_TOP3,
  buildCohortKey,
  cohortWeekIndexFromIsoWeek,
  formatCohortAwardTierHint,
  formatCohortKeyLabel,
  formatCohortWeeklyBadgeLabel,
  getCohortAwardTier,
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

  it('uses min population constants', () => {
    expect(MIN_COHORT_FOR_MVP).toBe(3);
    expect(MIN_COHORT_FOR_TOP3).toBe(10);
  });

  it('resolves award tier by participant count', () => {
    expect(getCohortAwardTier(2)).toBe('none');
    expect(getCohortAwardTier(3)).toBe('mvp');
    expect(getCohortAwardTier(9)).toBe('mvp');
    expect(getCohortAwardTier(10)).toBe('top3');
  });

  it('formats award tier hints', () => {
    expect(formatCohortAwardTierHint(2)).toContain('3 名以上');
    expect(formatCohortAwardTierHint(5)).toContain('MVP');
    expect(formatCohortAwardTierHint(12)).toContain('TOP3');
  });

  it('formats weekly badge labels', () => {
    expect(
      formatCohortWeeklyBadgeLabel('cohort_weekly_w2_rank1', { award_mode: 'mvp' }),
    ).toBe('週次 MVP（W2）');
    expect(
      formatCohortWeeklyBadgeLabel('cohort_weekly_w1_rank2', { award_mode: 'top3' }),
    ).toBe('週次 TOP2（W1）');
    expect(formatCohortWeeklyBadgeLabel('cohort_weekly_w3_rank1', null)).toBe(
      '週次 TOP1（ローテ W3）',
    );
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
