/** Same slug segment as prerender (`vite/prerenderArticlesPlugin.ts`). */
export function articlePrettySlug(meta: { slug?: string }, filename: string): string {
  const raw = (meta.slug || filename).replace(/^\/articles\//, '').replace(/^\//, '');
  return raw || filename;
}

/** Canonical article path (`/articles/<slug>`, no trailing slash). */
export function buildArticleCanonicalPath(meta: { slug?: string }, filename: string): string {
  return `/articles/${articlePrettySlug(meta, filename)}`;
}

/** Strip `/articles/` (or leading `/`) from a route param or slug string. */
export function normalizeArticleRouteSegment(slugOrParam: string): string {
  return slugOrParam.replace(/^\/articles\//, '').replace(/^\//, '');
}

/** In-app link for a learning content id (MDX basename) using build-time metas. */
export function articleHrefForContentId(
  contentId: string,
  metas: Record<string, { slug?: string } | undefined>,
): string {
  return buildArticleCanonicalPath(metas[contentId] ?? {}, contentId);
}

/**
 * When the URL segment differs from the canonical pretty slug, return the canonical path
 * (for `history.replace` on legacy filename or alias params).
 */
export function canonicalArticlePathIfNeeded(
  routeParam: string,
  meta: { slug?: string },
  filename: string,
): string | null {
  const canonicalSegment = articlePrettySlug(meta, filename);
  const currentSegment = normalizeArticleRouteSegment(routeParam);
  if (currentSegment === canonicalSegment) return null;
  return buildArticleCanonicalPath(meta, filename);
}
