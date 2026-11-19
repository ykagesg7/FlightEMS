import legacyRedirects from '../../config/article-legacy-redirects.json';
import reservedSlugs from '../../config/article-reserved-slugs.json';
import articleMetas from 'virtual:articles-index';
import {
  articleHrefForContentId,
  buildArticleCanonicalPath,
  canonicalArticlePathIfNeeded,
  normalizeArticleRouteSegment,
  reservedArticleSlug,
} from './articleCanonicalPath';
import { findArticleByRouteParamSync } from './articlesIndex';

type LegacyRedirect = { source: string; destination: string };

const legacyPathBySource = new Map(
  (legacyRedirects as LegacyRedirect[]).map((rule) => [rule.source, rule.destination]),
);

for (const [contentId, slug] of Object.entries(reservedSlugs as Record<string, string>)) {
  legacyPathBySource.set(`/articles/${contentId}`, `/articles/${slug}`);
}

function reservedCanonicalArticlePath(contentId: string): string | null {
  const slug = reservedArticleSlug(contentId);
  if (!slug) return null;
  return `/articles/${slug}`;
}

/**
 * Normalize SPA paths so GA4 `page_path` always uses the canonical article URL
 * (avoids a legacy hit before client-side redirect).
 */
export function canonicalizeAnalyticsPagePath(pagePath: string): string {
  const queryIndex = pagePath.indexOf('?');
  const pathname = queryIndex >= 0 ? pagePath.slice(0, queryIndex) : pagePath;
  const search = queryIndex >= 0 ? pagePath.slice(queryIndex) : '';

  const fromRules = legacyPathBySource.get(pathname);
  if (fromRules) {
    return `${fromRules}${search}`;
  }

  const learningMatch = pathname.match(/^\/learning\/([^/]+)$/);
  if (learningMatch) {
    const canonical = articleHrefForContentId(learningMatch[1], articleMetas);
    return `${canonical}${search}`;
  }

  const articleMatch = pathname.match(/^\/articles\/([^/]+)$/);
  if (!articleMatch) {
    return pagePath;
  }

  const segment = articleMatch[1];
  const matched = findArticleByRouteParamSync(segment);
  if (!matched) {
    const reserved = reservedCanonicalArticlePath(segment);
    if (reserved) return `${reserved}${search}`;
    return pagePath;
  }

  const canonicalPath = canonicalArticlePathIfNeeded(
    segment,
    matched.meta,
    matched.filename,
  );
  if (canonicalPath) {
    return `${canonicalPath}${search}`;
  }

  const expected = buildArticleCanonicalPath(matched.meta, matched.filename);
  if (pathname !== expected) {
    return `${expected}${search}`;
  }

  return pagePath;
}

/** Absolute in-app path (`/articles/...`) when the route param should redirect, else null. */
export function resolveInAppArticleRedirectPath(routeParam: string): string | null {
  const matched = findArticleByRouteParamSync(routeParam);
  if (matched) {
    return canonicalArticlePathIfNeeded(routeParam, matched.meta, matched.filename);
  }
  const reserved = reservedCanonicalArticlePath(routeParam);
  if (reserved && reserved !== `/articles/${normalizeArticleRouteSegment(routeParam)}`) {
    return reserved;
  }
  return null;
}

export function articlePrefetchHref(slugOrPath: string): string {
  const segment = normalizeArticleRouteSegment(slugOrPath);
  const matched = findArticleByRouteParamSync(segment);
  if (matched) {
    return buildArticleCanonicalPath(matched.meta, matched.filename);
  }
  const reserved = reservedCanonicalArticlePath(segment);
  if (reserved) return reserved;
  return `/articles/${segment}`;
}