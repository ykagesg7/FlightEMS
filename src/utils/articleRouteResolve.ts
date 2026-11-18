import legacyRedirects from '../../config/article-legacy-redirects.json';
import {
  buildArticleCanonicalPath,
  canonicalArticlePathIfNeeded,
  normalizeArticleRouteSegment,
} from './articleCanonicalPath';
import { findArticleByRouteParamSync } from './articlesIndex';

type LegacyRedirect = { source: string; destination: string };

const legacyPathBySource = new Map(
  (legacyRedirects as LegacyRedirect[]).map((rule) => [rule.source, rule.destination]),
);

/**
 * Normalize SPA paths so GA4 `page_path` always uses the canonical article URL
 * (avoids a legacy hit before client-side redirect).
 */
export function canonicalizeAnalyticsPagePath(pagePath: string): string {
  const queryIndex = pagePath.indexOf('?');
  const pathname = queryIndex >= 0 ? pagePath.slice(0, queryIndex) : pagePath;
  const search = queryIndex >= 0 ? pagePath.slice(queryIndex) : '';

  const fromVercelRules = legacyPathBySource.get(pathname);
  if (fromVercelRules) {
    return `${fromVercelRules}${search}`;
  }

  const articleMatch = pathname.match(/^\/articles\/([^/]+)$/);
  if (!articleMatch) {
    return pagePath;
  }

  const segment = articleMatch[1];
  const matched = findArticleByRouteParamSync(segment);
  if (!matched) {
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
  if (!matched) return null;
  return canonicalArticlePathIfNeeded(routeParam, matched.meta, matched.filename);
}

export function articlePrefetchHref(slugOrPath: string): string {
  const segment = normalizeArticleRouteSegment(slugOrPath);
  const matched = findArticleByRouteParamSync(segment);
  if (matched) {
    return buildArticleCanonicalPath(matched.meta, matched.filename);
  }
  return `/articles/${segment}`;
}