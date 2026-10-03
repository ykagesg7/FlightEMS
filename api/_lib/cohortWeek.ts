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

/** Monday 12:00 JST within the given ISO week label (digest bundle key). */
function dateInIsoWeek(isoWeek: string): Date {
  const match = /^(\d{4})-W(\d{2})$/.exec(isoWeek);
  if (!match) {
    throw new Error(`Invalid ISO week: ${isoWeek}`);
  }
  const year = Number(match[1]);
  const week = Number(match[2]);
  const jan4 = new Date(Date.UTC(year, 0, 4, 3, 0, 0));
  const jan4Day = jan4.getUTCDay() || 7;
  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setUTCDate(jan4.getUTCDate() - jan4Day + 1);
  const monday = new Date(mondayWeek1);
  monday.setUTCDate(mondayWeek1.getUTCDate() + (week - 1) * 7);
  monday.setUTCHours(3, 0, 0, 0);
  return monday;
}

/** Previous digest key (W41 → W40; W01 → prior year’s last week). */
export function getPreviousIsoWeekKey(isoWeek: string): string {
  const anchor = dateInIsoWeek(isoWeek);
  return getIsoWeekJst(new Date(anchor.getTime() - 7 * 86400000));
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
