/** ISO week for closed-week batch (previous JST week on Sunday delivery). */
export function getIsoWeekJst(date: Date = new Date()): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const [y, m, d] = fmt.format(date).split('-').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function getPreviousIsoWeekJst(date: Date = new Date()): string {
  return getIsoWeekJst(new Date(date.getTime() - 7 * 86400000));
}

/** Next ISO week in JST calendar (Sunday evening digest → coming Mon–Fri week). */
export function getNextIsoWeekJst(date: Date = new Date()): string {
  return getIsoWeekJst(new Date(date.getTime() + 7 * 86400000));
}

/** 0=Sun … 6=Sat in Asia/Tokyo. */
export function getJstWeekday(date: Date = new Date()): number {
  const wd = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tokyo',
    weekday: 'short',
  }).format(date);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[wd] ?? 0;
}

/**
 * Digest target week: Sunday JST → next ISO week (preview);
 * Mon–Sat JST → current ISO week (Mon morning catch-up / fallback).
 */
export function resolveArticleDigestIsoWeek(date: Date = new Date()): string {
  return getJstWeekday(date) === 0 ? getNextIsoWeekJst(date) : getIsoWeekJst(date);
}
