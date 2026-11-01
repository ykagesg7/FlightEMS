import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { collectArticleMetas } from '../../../vite/articlesMeta';
import {
  buildArticleCatalog,
  findDevCodesInMdxFiles,
  sanitizeMdxBodyForDevCodes,
} from '../../utils/mdxReaderVisibleDevCodes';

const contentRoot = join(process.cwd(), 'src/content');

function loadMdxContentFiles(): Array<{ path: string; source: string }> {
  const dirs = ['articles', 'lessons'] as const;
  const files: Array<{ path: string; source: string }> = [];
  for (const dir of dirs) {
    const folder = join(contentRoot, dir);
    let names: string[];
    try {
      names = readdirSync(folder);
    } catch {
      continue;
    }
    for (const name of names) {
      if (!name.endsWith('.mdx')) continue;
      const abs = join(folder, name);
      files.push({
        path: relative(process.cwd(), abs),
        source: readFileSync(abs, 'utf8'),
      });
    }
  }
  return files;
}

describe('MDX reader-visible dev codes', () => {
  it('sanitizer strips dev codes from markdown link labels', () => {
    const catalog = buildArticleCatalog(collectArticleMetas());
    const unresolved = new Set<string>();
    const input =
      '前回 [無線フレーズの基礎（PPL-4-2-1）](/articles/PPL-4-2-1_RadioPhraseologyBasics) や。';
    const out = sanitizeMdxBodyForDevCodes(input, catalog, unresolved);
    expect(out).toContain('[無線フレーズの基礎](/articles/');
    expect(out).not.toContain('（PPL-4-2-1）');
    expect(unresolved.size).toBe(0);
  });

  it('has no reader-visible dev codes in src/content MDX bodies', () => {
    const files = loadMdxContentFiles();
    const catalog = buildArticleCatalog(collectArticleMetas());
    const violations = findDevCodesInMdxFiles(files, catalog);
    expect(violations).toEqual([]);
  });
});
