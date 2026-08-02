/** JST date helpers for article drip (API / cron). */

export function getJstDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function isPublishDateReached(publishDate: string, now: Date = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publishDate)) return false;
  return publishDate <= getJstDateString(now);
}
