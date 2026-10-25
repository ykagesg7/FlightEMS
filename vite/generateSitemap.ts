import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { articlePrettySlug } from '../src/utils/articleCanonicalPath';
import { collectArticleMetas } from './articlesMeta';

/** Keep in sync with `COURSES[].id` in `src/data/courses.ts` (avoid importing courses in vite/node TS). */
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

function isArticleReleased(publishedAt?: string): boolean {
  if (!publishedAt) return false;
  const day = publishedAt.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const now = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  return day <= now;
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

export function buildSitemapUrlEntries(origin: string): string[] {
  const urls = new Set<string>();

  for (const path of INDEXABLE_STATIC_PATHS) {
    urls.add(absoluteLoc(origin, path));
  }

  for (const courseId of INDEXABLE_COURSE_IDS) {
    urls.add(absoluteLoc(origin, `/courses/${courseId}`));
  }

  const seenArticleSlugs = new Set<string>();
  for (const entry of collectArticleMetas()) {
    if (!entry.meta.publishedAt || !isArticleReleased(entry.meta.publishedAt)) continue;
    const slug = articlePrettySlug(entry.meta, entry.filename);
    if (!slug || seenArticleSlugs.has(slug)) continue;
    seenArticleSlugs.add(slug);
    urls.add(absoluteLoc(origin, `/articles/${slug}`));
  }

  return [...urls].sort((a, b) => a.localeCompare(b));
}

export function renderSitemapXml(origin: string): string {
  const locs = buildSitemapUrlEntries(origin);
  const body = locs
    .map((loc) => `  <url>\n    <loc>${escapeXml(loc)}</loc>\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function renderRobotsTxt(origin: string): string {
  const sitemap = absoluteLoc(origin, '/sitemap.xml');
  return `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`;
}

export function writeSitemapAndRobots(distDir: string, origin: string): void {
  writeFileSync(join(distDir, 'sitemap.xml'), renderSitemapXml(origin), 'utf8');
  writeFileSync(join(distDir, 'robots.txt'), renderRobotsTxt(origin), 'utf8');
}
