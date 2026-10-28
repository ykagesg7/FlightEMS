import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  renderRobotsTxt,
  renderSitemapXml,
  toSitemapArticleEntry,
} from '../api/_lib/sitemapCore';
import { collectArticleMetas } from './articlesMeta';

export {
  INDEXABLE_COURSE_IDS,
  INDEXABLE_STATIC_PATHS,
  RUNTIME_SITEMAP_PATH,
  renderRobotsTxt,
  renderSitemapXml,
} from '../api/_lib/sitemapCore';

/** Writes robots.txt and the article manifest consumed by the runtime sitemap API. */
export function writeSitemapAndRobots(distDir: string, origin: string): void {
  const articles = collectArticleMetas().map(({ filename, meta }) =>
    toSitemapArticleEntry(filename, meta),
  );
  writeFileSync(
    join(distDir, 'sitemap-article-manifest.json'),
    `${JSON.stringify({ articles }, null, 0)}\n`,
    'utf8',
  );
  writeFileSync(join(distDir, 'robots.txt'), renderRobotsTxt(origin), 'utf8');
}

/** Build-time helper (tests / local) using MDX on disk. */
export function renderSitemapXmlFromWorkspace(origin: string): string {
  const articles = collectArticleMetas().map(({ filename, meta }) =>
    toSitemapArticleEntry(filename, meta),
  );
  return renderSitemapXml(origin, articles);
}
