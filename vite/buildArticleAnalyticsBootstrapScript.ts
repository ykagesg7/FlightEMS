import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import reservedSlugs from '../config/article-reserved-slugs.json';
import {
  buildArticleCanonicalPath,
} from '../src/utils/articleCanonicalPath';
import { collectArticleMetas } from './articlesMeta';

export type ArticleAnalyticsBootstrapMap = {
  pathMap: Record<string, string>;
  learning: Record<string, string>;
};

export function buildArticleAnalyticsBootstrapMap(
  contentRoot = join(process.cwd(), 'src/content'),
): ArticleAnalyticsBootstrapMap {
  const pathMap: Record<string, string> = {};
  const legacyPath = join(process.cwd(), 'config/article-legacy-redirects.json');
  const legacyRedirects = JSON.parse(readFileSync(legacyPath, 'utf8')) as Array<{
    source: string;
    destination: string;
  }>;
  for (const rule of legacyRedirects) {
    pathMap[rule.source] = rule.destination;
  }

  for (const [contentId, slug] of Object.entries(reservedSlugs as Record<string, string>)) {
    pathMap[`/articles/${contentId}`] = `/articles/${slug}`;
  }

  const learning: Record<string, string> = {};
  for (const { filename, meta } of collectArticleMetas(contentRoot)) {
    learning[filename] = buildArticleCanonicalPath(meta, filename);
  }
  for (const [contentId, slug] of Object.entries(reservedSlugs as Record<string, string>)) {
    learning[contentId] = `/articles/${slug}`;
  }

  return { pathMap, learning };
}

/** gtag.js より前に実行するインライン同期スクリプト（document.location を正本へ）。 */
export function buildArticleAnalyticsBootstrapInlineScript(map: ArticleAnalyticsBootstrapMap): string {
  const mapJson = JSON.stringify(map);
  return `(function(w){var MAP=${mapJson};var p=w.location.pathname;var q=w.location.search||'';var dest=MAP.pathMap[p];if(!dest){var m=p.match(/^\\/learning\\/([^/]+)$/);if(m&&MAP.learning[m[1]])dest=MAP.learning[m[1]];}if(dest&&dest!==p){w.history.replaceState(null,'',dest+q);}w.__FA_GA_CANONICAL_PATH__=(dest&&dest!==p?dest+q:p+q);})(window);`;
}

export function buildGtagInitInlineScript(measurementId: string): string {
  return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());var __faCp=window.__FA_GA_CANONICAL_PATH__||(window.location.pathname+window.location.search);var __faPp=__faCp.split('?')[0];gtag('config','${measurementId}',{send_page_view:false,page_path:__faPp,page_location:window.location.origin+__faCp});`;
}