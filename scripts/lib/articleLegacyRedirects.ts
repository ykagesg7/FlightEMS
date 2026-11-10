import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  articlePrettySlug,
  buildArticleCanonicalPath,
} from '../../src/utils/articleCanonicalPath';
import { collectArticleMetas } from '../../vite/articlesMeta';

export type ArticleLegacyRedirect = {
  source: string;
  destination: string;
  permanent: true;
};

function withdrawnIds(): Set<string> {
  try {
    const path = join(process.cwd(), 'api/_lib/withdrawnArticleIds.ts');
    const source = readFileSync(path, 'utf8');
    const match = source.match(
      /export const WITHDRAWN_ARTICLE_IDS[^=]*=\s*\[([\s\S]*?)\]\s*as const/,
    );
    if (!match) return new Set();
    const ids = [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
    return new Set(ids);
  } catch {
    return new Set();
  }
}

/** Legacy `/articles/<mdx-basename>` → canonical `/articles/<meta.slug>` (permanent). */
export function buildArticleLegacyRedirects(
  contentRoot = join(process.cwd(), 'src/content'),
): ArticleLegacyRedirect[] {
  const withdrawn = withdrawnIds();
  const redirects: ArticleLegacyRedirect[] = [];

  for (const { filename, meta } of collectArticleMetas(contentRoot)) {
    if (withdrawn.has(filename)) continue;
    const canonicalSegment = articlePrettySlug(meta, filename);
    if (filename === canonicalSegment) continue;
    redirects.push({
      source: `/articles/${filename}`,
      destination: buildArticleCanonicalPath(meta, filename),
      permanent: true,
    });
  }

  redirects.sort((a, b) => a.source.localeCompare(b.source));
  return redirects;
}

export function assertArticleLegacyRedirectsValid(
  redirects: ArticleLegacyRedirect[],
  contentRoot = join(process.cwd(), 'src/content'),
): void {
  const sources = new Set(redirects.map((r) => r.source));
  const destinations = new Set(redirects.map((r) => r.destination));

  for (const redirect of redirects) {
    if (redirect.source === redirect.destination) {
      throw new Error(`self redirect: ${redirect.source}`);
    }
    if (destinations.has(redirect.source)) {
      throw new Error(`redirect chain at source: ${redirect.source}`);
    }
  }

  const covered = new Set(redirects.map((r) => r.source.replace(/^\/articles\//, '')));
  const withdrawn = withdrawnIds();

  for (const { filename, meta } of collectArticleMetas(contentRoot)) {
    if (withdrawn.has(filename)) continue;
    const canonicalSegment = articlePrettySlug(meta, filename);
    if (filename === canonicalSegment) continue;
    if (!covered.has(filename)) {
      throw new Error(`missing legacy redirect for ${filename}`);
    }
    const expectedDest = buildArticleCanonicalPath(meta, filename);
    const rule = redirects.find((r) => r.source === `/articles/${filename}`);
    if (!rule || rule.destination !== expectedDest) {
      throw new Error(`redirect mismatch for ${filename}`);
    }
  }

  for (const redirect of redirects) {
    const segment = redirect.destination.replace(/^\/articles\//, '');
    if (sources.has(redirect.destination) || sources.has(`/articles/${segment}`)) {
      throw new Error(`canonical target is also a legacy source: ${redirect.destination}`);
    }
  }
}
