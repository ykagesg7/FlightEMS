/** Same slug segment as prerender (`vite/prerenderArticlesPlugin.ts`). */
export function articlePrettySlug(meta: { slug?: string }, filename: string): string {
  const raw = (meta.slug || filename).replace(/^\/articles\//, '').replace(/^\//, '');
  return raw || filename;
}

/** Canonical article path (`/articles/<slug>`, no trailing slash). */
export function buildArticleCanonicalPath(meta: { slug?: string }, filename: string): string {
  return `/articles/${articlePrettySlug(meta, filename)}`;
}
