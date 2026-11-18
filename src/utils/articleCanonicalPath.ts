import reservedSlugByContentId from '../../config/article-reserved-slugs.json';

const reservedSlugByContentIdMap = reservedSlugByContentId as Record<string, string>;

const reservedContentIdBySlug = new Map<string, string>(
  Object.entries(reservedSlugByContentIdMap).map(([contentId, slug]) => [slug, contentId]),
);

/** MDX 未整備だが `learning_contents.id` だけ先に存在する記事の予約 slug。 */
export function reservedArticleSlug(contentId: string): string | undefined {
  return reservedSlugByContentIdMap[contentId];
}

export function isReservedCatalogContentId(contentId: string): boolean {
  return Boolean(reservedSlugByContentIdMap[contentId]);
}

/** 正本 slug（ルート param）から `learning_contents.id` / MDX basename を逆引き。 */
export function reservedContentIdFromSlug(routeSegment: string): string | undefined {
  const key = normalizeArticleRouteSegment(routeSegment);
  return reservedContentIdBySlug.get(key);
}

/**
 * URL 上の segment から MDX・DB 用のコンテンツ ID を決定する（予約 slug → DB id）。
 */
export function resolveArticleMdxContentId(routeParam: string): string {
  const fromReserved = reservedContentIdFromSlug(routeParam);
  if (fromReserved) return fromReserved;
  return normalizeArticleRouteSegment(routeParam);
}

export function buildReservedCatalogArticleMeta(
  contentId: string,
  learning?: { title?: string; description?: string | null; category?: string | null },
): ArticleMeta {
  const slug = reservedArticleSlug(contentId) ?? contentId;
  return {
    title: learning?.title ?? contentId,
    slug,
    tags: learning?.category ? [learning.category] : ['PPL'],
    type: 'lesson',
    readingTime: 5,
    excerpt: learning?.description ?? undefined,
  };
}

/** Same slug segment as prerender (`vite/prerenderArticlesPlugin.ts`). */
export function articlePrettySlug(meta: { slug?: string }, filename: string): string {
  const raw = (meta.slug || reservedArticleSlug(filename) || filename)
    .replace(/^\/articles\//, '')
    .replace(/^\//, '');
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
