import { isArticleNoindexMeta } from '../../api/_lib/articleSeoNoindex';
import { isArticleReleased } from './articlePublishGate';

export { isArticleNoindexMeta };

/** True when prerender / runtime head should emit `robots: noindex`. */
export function shouldEmitRobotsNoindex(
  meta: { publishedAt?: string; noindex?: boolean },
  now: Date = new Date(),
): boolean {
  if (isArticleNoindexMeta(meta)) return true;
  return !isArticleReleased(meta.publishedAt, now);
}

/** Learner-facing catalog lists (course modules, article search with publishedOnly). */
export function isArticleListedForLearners(meta: { noindex?: boolean } | undefined): boolean {
  return !isArticleNoindexMeta(meta);
}
