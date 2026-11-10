/** Per-article opt-out from sitemap / robots index (MDX `meta.noindex`). */
export function isArticleNoindexMeta(meta: { noindex?: boolean } | undefined | null): boolean {
  return meta?.noindex === true;
}
