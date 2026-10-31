import { isWithdrawnArticle } from '../../src/constants/withdrawnArticleIds';
import { isPublishDateReached } from './articlePublishGate';

/** Keep in sync with `COURSES[].id` in `src/data/courses.ts`. */
export const INDEXABLE_COURSE_IDS = ['ppl', 'cpl', 'cp', 'fn', 'mentality'] as const;

/** Marketing / tool routes reachable without signing in (matches App.tsx public lazy routes). */
export const INDEXABLE_STATIC_PATHS = [
  '/',
  '/about',
  '/schedule',
  '/links',
  '/articles',
  '/planning',
  '/explore/airspace-3d',
  '/ranks',
] as const;

/** Runtime sitemap served by `api/sitemap.xml.ts` (JST publish gate evaluated per request). */
export const RUNTIME_SITEMAP_PATH = '/api/sitemap.xml' as const;

export const SITEMAP_ARTICLE_MANIFEST_PATH = '/sitemap-article-manifest.json' as const;

export interface SitemapArticleEntry {
  filename: string;
  slug: string;
  publishedAt?: string;
}

function articlePrettySlug(meta: { slug?: string }, filename: string): string {
  const raw = (meta.slug || filename).replace(/^\/articles\//, '').replace(/^\//, '');
  return raw || filename;
}

export function toSitemapArticleEntry(
  filename: string,
  meta: { slug?: string; publishedAt?: string },
): SitemapArticleEntry {
  return {
    filename,
    slug: articlePrettySlug(meta, filename),
    publishedAt: meta.publishedAt,
  };
}

function isArticleReleased(publishedAt?: string): boolean {
  if (!publishedAt) return false;
  const day = publishedAt.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  return isPublishDateReached(day);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function absoluteLoc(origin: string, path: string): string {
  if (path === '/') return `${origin}/`;
  return `${origin}${path}`;
}

export function buildSitemapUrlEntries(
  origin: string,
  articles: SitemapArticleEntry[],
): string[] {
  const urls = new Set<string>();

  for (const path of INDEXABLE_STATIC_PATHS) {
    urls.add(absoluteLoc(origin, path));
  }

  for (const courseId of INDEXABLE_COURSE_IDS) {
    urls.add(absoluteLoc(origin, `/courses/${courseId}`));
  }

  const seenArticleSlugs = new Set<string>();
  for (const entry of articles) {
    if (isWithdrawnArticle(entry.filename)) continue;
    if (!entry.publishedAt || !isArticleReleased(entry.publishedAt)) continue;
    const slug = entry.slug;
    if (!slug || seenArticleSlugs.has(slug)) continue;
    seenArticleSlugs.add(slug);
    urls.add(absoluteLoc(origin, `/articles/${slug}`));
  }

  return [...urls].sort((a, b) => a.localeCompare(b));
}

export function renderSitemapXml(origin: string, articles: SitemapArticleEntry[] = []): string {
  const locs = buildSitemapUrlEntries(origin, articles);
  const body = locs
    .map((loc) => `  <url>\n    <loc>${escapeXml(loc)}</loc>\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function renderRobotsTxt(origin: string): string {
  const sitemap = absoluteLoc(origin, RUNTIME_SITEMAP_PATH);
  return `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`;
}
