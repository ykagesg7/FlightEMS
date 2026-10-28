import manifest from '../_generated/sitemapArticleManifest.json';
import { renderSitemapXml, type SitemapArticleEntry } from './sitemapCore';
import { resolveAppBaseUrlFromEnv, type AppBaseUrlEnv } from './appBaseUrl';

export type BuildRuntimeSitemapOptions = {
  /** Test override (skips bundled manifest). */
  articles?: SitemapArticleEntry[];
};

function loadBundledArticles(): SitemapArticleEntry[] {
  const articles = (manifest as { articles?: SitemapArticleEntry[] }).articles;
  return Array.isArray(articles) ? articles : [];
}

export function buildRuntimeSitemapXml(
  env: AppBaseUrlEnv = process.env,
  options: BuildRuntimeSitemapOptions = {},
): string {
  const origin = resolveAppBaseUrlFromEnv(env);
  const articles = options.articles !== undefined ? options.articles : loadBundledArticles();
  return renderSitemapXml(origin, articles);
}
