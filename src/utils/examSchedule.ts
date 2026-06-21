import type { LicenseTarget } from './cohort';

/**
 * 国土交通省 CBT 学科試験の実施月（年6回）。
 * 参照: https://www.mlit.go.jp/koku/koku_tk12_000005.html
 *       令和8年度「航空従事者技能証明等学科試験実施予定年月日」
 *       ①CBT化後の学科試験手引き（PPL/CPL 飛行機は CBT 化・年6回）
 *
 * 実施「期」の代表月: 1月期・3月期・6月期・7月期・9月期・11月期
 */
export const MLIT_WRITTEN_EXAM_MONTHS: Record<LicenseTarget, readonly number[]> = {
  CPL: [1, 3, 6, 7, 9, 11],
  PPL: [1, 3, 6, 7, 9, 11],
};

export const MLIT_EXAM_SCHEDULE_SOURCE =
  '国土交通省 航空従事者技能証明等学科試験（CBT・年6回）';

const MONTH_LABELS = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
] as const;

export interface JstDateParts {
  year: number;
  month: number;
}

export function getJstDateParts(date: Date = new Date()): JstDateParts {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
  });
  const [year, month] = fmt.format(date).split('-').map(Number);
  return { year, month };
}

export function toExamYm(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function parseExamYm(examYm: string): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(examYm);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return { year, month };
}

export function isExamMonthAllowed(license: LicenseTarget, month: number): boolean {
  return MLIT_WRITTEN_EXAM_MONTHS[license].includes(month);
}

/** 選択可能な年（当年〜+2年） */
export function getExamYearOptions(now: Date = new Date()): number[] {
  const { year } = getJstDateParts(now);
  return [year, year + 1, year + 2];
}

/** 指定年・資格で選択可能な月（当年は今月以降かつ実施月のみ） */
export function getExamMonthOptions(
  license: LicenseTarget,
  year: number,
  now: Date = new Date(),
): number[] {
  const { year: currentYear, month: currentMonth } = getJstDateParts(now);
  return MLIT_WRITTEN_EXAM_MONTHS[license].filter((month) => {
    if (year > currentYear) return true;
    if (year < currentYear) return false;
    return month >= currentMonth;
  });
}

/** デフォルトは JST の現在年月（実施月でない／過去月の場合は次の受験可能月） */
export function getDefaultExamYearMonth(
  license: LicenseTarget,
  now: Date = new Date(),
): { year: number; month: number; examYm: string } {
  const { year: currentYear, month: currentMonth } = getJstDateParts(now);
  const monthsThisYear = getExamMonthOptions(license, currentYear, now);

  if (monthsThisYear.includes(currentMonth)) {
    return { year: currentYear, month: currentMonth, examYm: toExamYm(currentYear, currentMonth) };
  }

  if (monthsThisYear.length > 0) {
    const month = monthsThisYear[0];
    return { year: currentYear, month, examYm: toExamYm(currentYear, month) };
  }

  for (const year of getExamYearOptions(now)) {
    if (year <= currentYear) continue;
    const months = getExamMonthOptions(license, year, now);
    if (months.length > 0) {
      const month = months[0];
      return { year, month, examYm: toExamYm(year, month) };
    }
  }

  const fallbackMonth = MLIT_WRITTEN_EXAM_MONTHS[license][0];
  return {
    year: currentYear,
    month: fallbackMonth,
    examYm: toExamYm(currentYear, fallbackMonth),
  };
}

export function formatExamYmLabel(examYm: string): string {
  const parsed = parseExamYm(examYm);
  if (!parsed) return examYm;
  return `${parsed.year}年${MONTH_LABELS[parsed.month - 1]}`;
}

export function formatExamMonthOption(month: number): string {
  return MONTH_LABELS[month - 1] ?? `${month}月`;
}

/** 受験月（JST）に入ったら学科試験完了 UI を表示可能 */
export function isWrittenExamMonthReached(
  targetTestDate: string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!targetTestDate) return false;
  const datePart = targetTestDate.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return false;
  const { year: currentYear, month: currentMonth } = getJstDateParts(now);
  const [targetYear, targetMonth] = datePart.split('-').map(Number);
  if (currentYear > targetYear) return true;
  if (currentYear < targetYear) return false;
  return currentMonth >= targetMonth;
}

export function getWrittenExamUnlockHint(targetTestDate: string | null | undefined): string | null {
  if (!targetTestDate) return null;
  const ym = targetTestDate.slice(0, 7);
  if (!parseExamYm(ym)) return null;
  return `${formatExamYmLabel(ym)}以降に記録できます`;
}
