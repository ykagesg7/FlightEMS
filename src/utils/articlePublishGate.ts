/**
 * JST calendar-date publish gate for Articles (MDX meta.publishedAt).
 * Date-only strings (YYYY-MM-DD) release at the start of that JST day.
 *
 * Local preview: set VITE_ARTICLE_PREVIEW_IDS in .env.local (comma-separated
 * learning_contents ids). Dev server only; ignored in production builds.
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

export function getArticlePreviewIds(): Set<string> {
  if (!import.meta.env.DEV) return new Set();
  const raw = import.meta.env.VITE_ARTICLE_PREVIEW_IDS;
  if (typeof raw !== 'string' || !raw.trim()) return new Set();
  return new Set(raw.split(',').map((id) => id.trim()).filter(Boolean));
}

export function isArticlePreviewAllowed(articleId: string): boolean {
  return getArticlePreviewIds().has(articleId);
}

/** Release gate with optional dev preview bypass for specific article ids. */
export function isArticleReadable(
  publishedAt: string | undefined | null,
  articleId?: string,
  now: Date = new Date(),
): boolean {
  if (articleId && isArticlePreviewAllowed(articleId)) return true;
  return isArticleReleased(publishedAt, now);
}
