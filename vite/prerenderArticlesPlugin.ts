import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { isWithdrawnArticle } from '../src/constants/withdrawnArticleIds';
import { resolveCanonicalSiteOriginFromEnv, type SiteOriginEnv } from '../src/config/siteOriginEnv';
import { articlePrettySlug } from '../src/utils/articleCanonicalPath';
import { articleHeadTags } from './articleHeadTags';
import { collectArticleMetas } from './articlesMeta';
import { writeSitemapAndRobots } from './generateSitemap';

/** Client hubs with no prerendered index. `dist/articles/` exists for OG pages, so `/articles` 404s without this. */
export const SPA_HUB_FALLBACK_PATHS = [
  'articles',
  'courses',
  'planning',
  'test',
  'auth',
  'profile',
] as const;

export function writeSpaHubFallbacks(distDir: string, template: string): number {
  let count = 0;
  for (const hub of SPA_HUB_FALLBACK_PATHS) {
    const outDir = join(distDir, hub);
    mkdirSync(outDir, { recursive: true });
    const hubIndex = join(outDir, 'index.html');
    if (existsSync(hubIndex)) continue;
    writeFileSync(hubIndex, template);
    count += 1;
  }
  return count;
}

function resolveSiteOrigin(): string {
  const env = process.env as SiteOriginEnv;
  return resolveCanonicalSiteOriginFromEnv(env);
}

function injectHead(html: string, tags: string): string {
  const withoutTitle = html.replace(/<title>[\s\S]*?<\/title>/i, '');
  if (!withoutTitle.includes('</head>')) {
    return `${withoutTitle}\n${tags}`;
  }
  return withoutTitle.replace('</head>', `${tags}\n  </head>`);
}

export function prerenderArticlesPlugin(): Plugin {
  return {
    name: 'prerender-articles',
    apply: 'build',
    closeBundle() {
      const distDir = join(process.cwd(), 'dist');
      let template: string;
      try {
        template = readFileSync(join(distDir, 'index.html'), 'utf8');
      } catch {
        console.warn('[prerender-articles] dist/index.html not found; skip');
        return;
      }

      const origin = resolveSiteOrigin();
      const collected = collectArticleMetas();
      const written = new Set<string>();
      let count = 0;

      for (const entry of collected) {
        if (isWithdrawnArticle(entry.filename)) continue;
        if (!entry.meta.publishedAt) continue;
        const tags = articleHeadTags(entry.meta, entry.filename, origin);
        const html = injectHead(template, tags);
        const keys = new Set([entry.filename, articlePrettySlug(entry.meta, entry.filename)]);
        for (const key of keys) {
          if (!key || written.has(key)) continue;
          const outDir = join(distDir, 'articles', key);
          mkdirSync(outDir, { recursive: true });
          writeFileSync(join(outDir, 'index.html'), html, 'utf8');
          written.add(key);
          count += 1;
        }
      }

      console.log(`[prerender-articles] wrote ${count} article HTML files`);
      const hubs = writeSpaHubFallbacks(distDir, template);
      console.log(`[prerender-articles] wrote ${hubs} SPA hub fallback HTML files`);
      writeSitemapAndRobots(distDir, origin);
      console.log('[prerender-articles] wrote robots.txt (runtime sitemap: /api/sitemap.xml)');
    },
  };
}
