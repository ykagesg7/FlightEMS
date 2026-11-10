import { isPublishDateReached } from './articlePublishGate';

/** Per-article opt-out from sitemap / robots index (MDX `meta.noindex`). */
export function isArticleNoindexMeta(meta: { noindex?: boolean } | undefined | null): boolean {
  return meta?.noindex === true;
}

/** True when prerender / runtime head should emit `robots: noindex`. */
export function shouldEmitRobotsNoindex(
  meta: { publishedAt?: string; noindex?: boolean },
  now: Date = new Date(),
): boolean {
  if (isArticleNoindexMeta(meta)) return true;
  if (!meta.publishedAt) return true;
  const day = meta.publishedAt.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return true;
  return !isPublishDateReached(day, now);
}

/** Learner-facing catalog lists (course modules, article search with publishedOnly). */
export function isArticleListedForLearners(meta: { noindex?: boolean } | undefined): boolean {
  return !isArticleNoindexMeta(meta);
}
