import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, describe, expect, it } from 'vitest';
import {
  collectArticleMetas,
  extractMetaObjectText,
  parseArticleMeta,
} from './articlesMeta';

describe('extractMetaObjectText / parseArticleMeta', () => {
  it('parses a standard ESM meta export', () => {
    const source = `
export const meta = {
  type: 'article',
  title: '雑用こそ、仕事ばい',
  slug: '/articles/chores-are-the-job',
  tags: ['訓練作法', 'メンタル'],
  excerpt: '集合時刻に座れただけでは準備完了ではない。',
  publishedAt: '2026-08-03',
}
`;
    const parsed = parseArticleMeta(source);
    expect(parsed).toMatchObject({
      title: '雑用こそ、仕事ばい',
      slug: '/articles/chores-are-the-job',
      tags: ['訓練作法', 'メンタル'],
      publishedAt: '2026-08-03',
    });
  });

  it('keeps braces inside excerpt strings', () => {
    const source = `
export const meta = {
  title: 'Brace test',
  slug: 'brace',
  tags: [],
  excerpt: 'Lift {L} and drag {D} together.',
}
`;
    const text = extractMetaObjectText(source);
    expect(text).toContain('Lift {L} and drag {D}');
    const parsed = parseArticleMeta(source);
    expect(parsed?.excerpt).toBe('Lift {L} and drag {D} together.');
  });

  it('returns null when meta is missing', () => {
    expect(parseArticleMeta('# No meta here\n')).toBeNull();
  });

  it('returns null when title is missing after parse (normalize happens in collect)', () => {
    const parsed = parseArticleMeta(`export const meta = { slug: 'x', tags: [] }`);
    expect(parsed).toEqual({ slug: 'x', tags: [] });
  });
});

describe('collectArticleMetas', () => {
  const root = join(tmpdir(), `fa-articles-meta-${process.pid}`);

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('skips files without title, UUID names, and missing meta', () => {
    mkdirSync(join(root, 'articles'), { recursive: true });
    mkdirSync(join(root, 'lessons'), { recursive: true });

    writeFileSync(
      join(root, 'articles', 'Good_One.mdx'),
      `export const meta = { title: 'Good', slug: 'good', tags: ['a'] }\n`,
    );
    writeFileSync(
      join(root, 'articles', 'NoTitle.mdx'),
      `export const meta = { slug: 'none', tags: [] }\n`,
    );
    writeFileSync(join(root, 'articles', 'NoMeta.mdx'), `# just heading\n`);
    writeFileSync(
      join(root, 'articles', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.mdx'),
      `export const meta = { title: 'UUID', slug: 'uuid', tags: [] }\n`,
    );
    writeFileSync(
      join(root, 'lessons', 'PPL-1-1-1_Topic.mdx'),
      `export const meta = { title: 'Lesson', slug: 'lesson', tags: ['PPL'], type: 'lesson' }\n`,
    );

    const collected = collectArticleMetas(root);
    expect(collected.map((entry) => entry.filename).sort()).toEqual([
      'Good_One',
      'PPL-1-1-1_Topic',
    ]);
    expect(collected.find((entry) => entry.filename === 'PPL-1-1-1_Topic')?.dir).toBe(
      'lessons',
    );
  });
});
