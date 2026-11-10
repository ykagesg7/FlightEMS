import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { buildArticleLegacyRedirects } from './articleLegacyRedirects.ts';

/** Skipped while other PRs touch these files (keep in sync with articleMdxLinks.test.ts). */
export const MDX_LINK_FIX_ALLOWLIST = new Set([
  'src/content/lessons/3.3.10_CloudTypes.mdx',
  'src/content/lessons/PPL-2-1-6_CloudTypesAndFormation.mdx',
  'src/content/lessons/CPL-Hub-Navigation.mdx',
  'src/content/lessons/CPL-Hub-Meteorology.mdx',
  'src/content/lessons/CPL-Hub-Communication.mdx',
]);

function walkMdxFiles(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, name.name);
    if (name.isDirectory()) walkMdxFiles(full, acc);
    else if (name.name.endsWith('.mdx')) acc.push(full);
  }
  return acc;
}

export function buildLegacyArticleHrefMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const { source, destination } of buildArticleLegacyRedirects()) {
    const legacySegment = source.replace(/^\/articles\//, '');
    map.set(legacySegment, destination);
  }
  return map;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function rewriteLegacyArticleHrefsInText(
  text: string,
  legacyToCanonical: Map<string, string>,
): { next: string; replacements: number } {
  const keys = [...legacyToCanonical.keys()].sort((a, b) => b.length - a.length);
  let next = text;
  let replacements = 0;
  for (const legacy of keys) {
    const destination = legacyToCanonical.get(legacy)!;
    const pattern = new RegExp(`(/articles/${escapeRegExp(legacy)})(?=[#"'\\s\\])>|]|$)`, 'g');
    let count = 0;
    next = next.replace(pattern, () => {
      count += 1;
      return destination;
    });
    replacements += count;
  }
  return { next, replacements };
}

export type FixArticleMdxLinksResult = {
  filesChanged: number;
  totalReplacements: number;
  perFile: { rel: string; replacements: number }[];
};

export function fixArticleMdxLinks(
  contentRoot = join(process.cwd(), 'src/content'),
): FixArticleMdxLinksResult {
  const legacyToCanonical = buildLegacyArticleHrefMap();
  const files = walkMdxFiles(contentRoot);
  const perFile: { rel: string; replacements: number }[] = [];
  let filesChanged = 0;
  let totalReplacements = 0;

  for (const file of files) {
    const rel = relative(process.cwd(), file).replace(/\\/g, '/');
    if (MDX_LINK_FIX_ALLOWLIST.has(rel)) continue;

    const original = readFileSync(file, 'utf8');
    const { next, replacements } = rewriteLegacyArticleHrefsInText(original, legacyToCanonical);
    if (replacements > 0) {
      writeFileSync(file, next, 'utf8');
      filesChanged += 1;
      totalReplacements += replacements;
      perFile.push({ rel, replacements });
    }
  }

  return { filesChanged, totalReplacements, perFile };
}

export function findLegacyArticleHrefsInText(
  text: string,
  legacySegments: Set<string>,
): string[] {
  const hits: string[] = [];
  const pattern = /\/articles\/([^"'#\s\])>]+)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const segment = match[1].replace(/#.*$/, '');
    if (legacySegments.has(segment)) hits.push(segment);
  }
  return hits;
}
