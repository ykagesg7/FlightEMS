/**
 * JST calendar-date publish gate for Articles (MDX meta.publishedAt).
 * Date-only strings (YYYY-MM-DD) release at the start of that JST day.
 */

export function getJstDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** True when publishedAt is today (JST) or earlier. Missing/invalid → not released. */
export function isArticleReleased(
  publishedAt: string | undefined | null,
  now: Date = new Date(),
): boolean {
  if (!publishedAt) return false;
  const day = publishedAt.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  return day <= getJstDateString(now);
}
