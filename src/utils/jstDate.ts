/** Asia/Tokyo calendar helpers. Do not use the browser local timezone for study-time buckets. */

export const JST_TIME_ZONE = 'Asia/Tokyo';

/** YYYY-MM-DD in Japan Standard Time */
export function formatJstYmd(date: Date = new Date()): string {
  return date.toLocaleDateString('en-CA', { timeZone: JST_TIME_ZONE });
}

/** Instant of 00:00 JST on the calendar day that contains `date` */
export function startOfJstDayUtc(date: Date = new Date()): Date {
  const ymd = formatJstYmd(date);
  return new Date(`${ymd}T00:00:00+09:00`);
}

export function addJstCalendarDays(ymd: string, deltaDays: number): string {
  const noonJst = new Date(`${ymd}T12:00:00+09:00`);
  noonJst.setUTCDate(noonJst.getUTCDate() + deltaDays);
  return formatJstYmd(noonJst);
}

/** 00:00 JST of the calendar day `daysAgo` days before today (0 = today) */
export function startOfJstCalendarDaysAgoUtc(daysAgo: number, now: Date = new Date()): Date {
  const ymd = addJstCalendarDays(formatJstYmd(now), -daysAgo);
  return new Date(`${ymd}T00:00:00+09:00`);
}

/** 0 = Sunday … 6 = Saturday for a JST calendar date */
export function jstWeekday(ymd: string): number {
  return new Date(`${ymd}T12:00:00+09:00`).getUTCDay();
}

export function parseJstYmd(ymd: string): Date {
  return new Date(`${ymd}T12:00:00+09:00`);
}
