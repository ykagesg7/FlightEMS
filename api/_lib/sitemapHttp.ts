import {
  renderSitemapXml,
  SITEMAP_ARTICLE_MANIFEST_PATH,
  type SitemapArticleEntry,
} from './sitemapCore';
import { resolveAppBaseUrlFromEnv, type AppBaseUrlEnv } from './appBaseUrl';

interface SitemapArticleManifestFile {
  articles?: SitemapArticleEntry[];
}

function normalizeOrigin(value: string): string {
  let candidate = value.trim();
  while (candidate.endsWith('/')) {
    candidate = candidate.slice(0, -1);
  }
  return candidate;
}

/** Origin for fetching static assets from the active deployment (preview vs production). */
function resolveManifestFetchOrigin(env: AppBaseUrlEnv): string {
  if (env.VERCEL_URL && String(env.VERCEL_URL).trim()) {
    return normalizeOrigin(`https://${String(env.VERCEL_URL).trim()}`);
  }
  return resolveAppBaseUrlFromEnv(env);
}

async function fetchSitemapArticleEntries(env: AppBaseUrlEnv): Promise<SitemapArticleEntry[]> {
  const fetchOrigin = resolveManifestFetchOrigin(env);
  const manifestUrl = `${fetchOrigin}${SITEMAP_ARTICLE_MANIFEST_PATH}`;
  const res = await fetch(manifestUrl, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`sitemap manifest fetch failed (${res.status}) for ${manifestUrl}`);
  }
  const body = (await res.json()) as SitemapArticleManifestFile;
  return Array.isArray(body.articles) ? body.articles : [];
}

export type BuildRuntimeSitemapOptions = {
  /** Test / local override when manifest HTTP is unavailable. */
  articles?: SitemapArticleEntry[];
};

export async function buildRuntimeSitemapXml(
  env: AppBaseUrlEnv = process.env,
  options: BuildRuntimeSitemapOptions = {},
): Promise<string> {
  const origin = resolveAppBaseUrlFromEnv(env);
  const articles =
    options.articles !== undefined ? options.articles : await fetchSitemapArticleEntries(env);
  return renderSitemapXml(origin, articles);
}
