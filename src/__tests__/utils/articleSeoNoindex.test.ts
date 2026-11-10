import { describe, expect, it } from 'vitest';
import { isArticleNoindexMeta, shouldEmitRobotsNoindex } from '../../utils/articleSeoNoindex';

describe('articleSeoNoindex', () => {
  it('treats meta.noindex as robots and sitemap opt-out', () => {
    expect(isArticleNoindexMeta({ noindex: true })).toBe(true);
    expect(isArticleNoindexMeta({ noindex: false })).toBe(false);
    expect(isArticleNoindexMeta({})).toBe(false);
  });

  it('emits noindex for unreleased publishedAt or explicit flag', () => {
    expect(shouldEmitRobotsNoindex({ publishedAt: '2099-01-01' }, new Date('2026-01-01'))).toBe(
      true,
    );
    expect(
      shouldEmitRobotsNoindex(
        { publishedAt: '2020-01-01', noindex: true },
        new Date('2026-01-01'),
      ),
    ).toBe(true);
    expect(shouldEmitRobotsNoindex({ publishedAt: '2020-01-01' }, new Date('2026-01-01'))).toBe(
      false,
    );
  });
});
