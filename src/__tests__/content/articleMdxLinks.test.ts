import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildLegacyArticleHrefMap,
  findLegacyArticleHrefsInText,
  MDX_LINK_FIX_ALLOWLIST,
} from '../../../scripts/lib/fixArticleMdxLinks.ts';

function walkMdxFiles(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, name.name);
    if (name.isDirectory()) walkMdxFiles(full, acc);
    else if (name.name.endsWith('.mdx')) acc.push(full);
  }
  return acc;
}

describe('MDX internal article links', () => {
  it('does not reference legacy filename paths (except temporary allowlist)', () => {
    const legacySegments = new Set(buildLegacyArticleHrefMap().keys());
    const contentRoot = join(process.cwd(), 'src/content');
    const violations: { file: string; segments: string[] }[] = [];

    for (const file of walkMdxFiles(contentRoot)) {
      const rel = relative(process.cwd(), file).replace(/\\/g, '/');
      if (MDX_LINK_FIX_ALLOWLIST.has(rel)) continue;

      const text = readFileSync(file, 'utf8');
      const hits = [...new Set(findLegacyArticleHrefsInText(text, legacySegments))];
      if (hits.length > 0) violations.push({ file: rel, segments: hits });
    }

    expect(violations).toEqual([]);
  });
});
