import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { collectArticleMetas, type ExtractedArticleMeta } from './articlesMeta';

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

const SITE_NAME = 'FlightAcademy';
const DEFAULT_ORIGIN = 'https://flightacademy.com';

function resolveSiteOrigin(): string {
  const fromEnv = String(process.env.VITE_SITE_ORIGIN ?? '').trim().replace(/\/$/, '');
  return fromEnv || DEFAULT_ORIGIN;
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function prettySlug(meta: ExtractedArticleMeta, filename: string): string {
  const raw = (meta.slug || filename).replace(/^\/articles\//, '').replace(/^\//, '');
  return raw || filename;
}

function articleHeadTags(
  meta: ExtractedArticleMeta,
  filename: string,
  origin: string,
): string {
  const pathSlug = prettySlug(meta, filename);
  const url = `${origin}/articles/${pathSlug}`;
  const description =
    meta.excerpt || `${meta.title} - ${SITE_NAME}で学ぶ航空知識`;
  const ogImage = meta.heroImage || `${origin}/images/og-default.jpg`;
  const released = isArticleReleased(meta.publishedAt);
  const robots = released ? '' : '\n    <meta data-rh="true" name="robots" content="noindex" />';

  const tagLines = (meta.tags ?? [])
    .map((tag) => `    <meta data-rh="true" property="article:tag" content="${escapeAttr(tag)}" />`)
    .join('\n');

  return `    <title data-rh="true">${escapeAttr(meta.title)} | ${SITE_NAME}</title>
    <meta data-rh="true" name="description" content="${escapeAttr(description)}" />
    <link data-rh="true" rel="canonical" href="${escapeAttr(url)}" />
    <meta data-rh="true" property="og:type" content="article" />
    <meta data-rh="true" property="og:title" content="${escapeAttr(meta.title)}" />
    <meta data-rh="true" property="og:description" content="${escapeAttr(description)}" />
    <meta data-rh="true" property="og:url" content="${escapeAttr(url)}" />
    <meta data-rh="true" property="og:site_name" content="${SITE_NAME}" />
    <meta data-rh="true" property="og:image" content="${escapeAttr(ogImage)}" />
    <meta data-rh="true" property="og:locale" content="ja_JP" />
    <meta data-rh="true" name="twitter:card" content="summary_large_image" />
    <meta data-rh="true" name="twitter:title" content="${escapeAttr(meta.title)}" />
    <meta data-rh="true" name="twitter:description" content="${escapeAttr(description)}" />
    <meta data-rh="true" name="twitter:image" content="${escapeAttr(ogImage)}" />${robots}
${tagLines}`;
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
        if (!entry.meta.publishedAt) continue;
        const tags = articleHeadTags(entry.meta, entry.filename, origin);
        const html = injectHead(template, tags);
        const keys = new Set([entry.filename, prettySlug(entry.meta, entry.filename)]);
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
    },
  };
}
