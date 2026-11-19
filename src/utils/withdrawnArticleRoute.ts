import articleMetas from 'virtual:articles-index';
import { isWithdrawnArticle, WITHDRAWN_ARTICLE_IDS } from '../constants/withdrawnArticleIds';
import { articlePrettySlug, normalizeArticleRouteSegment } from './articleCanonicalPath';

let withdrawnSlugToBasename: Map<string, string> | null = null;

function withdrawnSlugMap(): Map<string, string> {
  if (!withdrawnSlugToBasename) {
    withdrawnSlugToBasename = new Map();
    for (const basename of WITHDRAWN_ARTICLE_IDS) {
      withdrawnSlugToBasename.set(basename, basename);
      const meta = articleMetas[basename];
      if (!meta) continue;
      const slug = normalizeArticleRouteSegment(articlePrettySlug(meta, basename));
      withdrawnSlugToBasename.set(slug, basename);
    }
  }
  return withdrawnSlugToBasename;
}

/** Map a route param (basename, canonical slug, or /articles/… slug) to a withdrawn MDX basename. */
export function resolveWithdrawnArticleBasename(routeParam: string): string | null {
  const key = normalizeArticleRouteSegment(routeParam);
  if (isWithdrawnArticle(key)) return key;
  return withdrawnSlugMap().get(key) ?? null;
}

export function isWithdrawnArticleRouteParam(routeParam: string): boolean {
  return resolveWithdrawnArticleBasename(routeParam) !== null;
}