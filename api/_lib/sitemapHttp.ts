import {
  renderSitemapXml,
  SITEMAP_ARTICLE_MANIFEST_PATH,
  type SitemapArticleEntry,
} from './sitemapCore';
import { resolveAppBaseUrlFromEnv, type AppBaseUrlEnv } from './appBaseUrl';

interface SitemapArticleManifestFile {
  articles?: SitemapArticleEntry[];
}

export type BuildRuntimeSitemapOptions = {
  /** Test / local override when manifest HTTP is unavailable. */
  articles?: SitemapArticleEntry[];
};

async function fetchSitemapArticleEntries(origin: string): Promise<SitemapArticleEntry[]> {
  const manifestUrl = `${origin}${SITEMAP_ARTICLE_MANIFEST_PATH}`;
  const res = await fetch(manifestUrl, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`sitemap manifest fetch failed (${res.status}) for ${manifestUrl}`);
  }
  const body = (await res.json()) as SitemapArticleManifestFile;
  return Array.isArray(body.articles) ? body.articles : [];
}

export async function buildRuntimeSitemapXml(
  env: AppBaseUrlEnv = process.env,
  options: BuildRuntimeSitemapOptions = {},
): Promise<string> {
  const origin = resolveAppBaseUrlFromEnv(env);
  const articles =
    options.articles !== undefined ? options.articles : await fetchSitemapArticleEntries(origin);
  return renderSitemapXml(origin, articles);
}
