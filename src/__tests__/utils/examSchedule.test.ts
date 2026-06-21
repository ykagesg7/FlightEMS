import { describe, expect, it } from 'vitest';
import {
  MLIT_WRITTEN_EXAM_MONTHS,
  getDefaultExamYearMonth,
  getExamMonthOptions,
  getExamYearOptions,
  getWrittenExamUnlockHint,
  isExamMonthAllowed,
  isWrittenExamMonthReached,
  parseExamYm,
  toExamYm,
} from '@/utils/examSchedule';

describe('examSchedule utils', () => {
  const june2026 = new Date('2026-06-20T12:00:00+09:00');

  it('defines MLIT CBT exam months for PPL and CPL', () => {
    expect(MLIT_WRITTEN_EXAM_MONTHS.CPL).toEqual([1, 3, 6, 7, 9, 11]);
    expect(MLIT_WRITTEN_EXAM_MONTHS.PPL).toEqual([1, 3, 6, 7, 9, 11]);
  });

  it('parses and formats exam YM', () => {
    expect(parseExamYm('2026-06')).toEqual({ year: 2026, month: 6 });
    expect(toExamYm(2026, 6)).toBe('2026-06');
  });

  it('filters non-exam months', () => {
    expect(isExamMonthAllowed('CPL', 6)).toBe(true);
    expect(isExamMonthAllowed('CPL', 12)).toBe(false);
    expect(isExamMonthAllowed('PPL', 2)).toBe(false);
  });

  it('offers year options from current year', () => {
    expect(getExamYearOptions(june2026)).toEqual([2026, 2027, 2028]);
  });

  it('limits months to current month onward in current year', () => {
    expect(getExamMonthOptions('CPL', 2026, june2026)).toEqual([6, 7, 9, 11]);
    expect(getExamMonthOptions('CPL', 2027, june2026)).toEqual([1, 3, 6, 7, 9, 11]);
  });

  it('defaults to current year and month when it is an exam month', () => {
    const result = getDefaultExamYearMonth('CPL', june2026);
    expect(result).toEqual({ year: 2026, month: 6, examYm: '2026-06' });
  });

  it('defaults to next exam month when current month has no exam', () => {
    const feb2026 = new Date('2026-02-15T12:00:00+09:00');
    const result = getDefaultExamYearMonth('CPL', feb2026);
    expect(result).toEqual({ year: 2026, month: 3, examYm: '2026-03' });
  });

  it('gates written exam completion until target exam month (JST)', () => {
    const june2026 = new Date('2026-06-20T12:00:00+09:00');
    const septTarget = '2026-09-01';
    expect(isWrittenExamMonthReached(septTarget, june2026)).toBe(false);
    expect(getWrittenExamUnlockHint(septTarget)).toBe('2026年9月以降に記録できます');
    const sept2026 = new Date('2026-09-05T12:00:00+09:00');
    expect(isWrittenExamMonthReached(septTarget, sept2026)).toBe(true);
  });
});
