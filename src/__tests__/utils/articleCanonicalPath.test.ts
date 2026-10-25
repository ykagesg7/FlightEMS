import { describe, expect, it } from 'vitest';
import {
  articlePrettySlug,
  buildArticleCanonicalPath,
} from '../../utils/articleCanonicalPath';
import type { ArticleMeta } from '../../types/articles';

const metaWithPrettySlug: ArticleMeta = {
  title: 'Sample',
  slug: '/articles/chores-are-the-job',
  tags: [],
};

describe('articleCanonicalPath', () => {
  it('uses meta slug segment, not filename', () => {
    expect(articlePrettySlug(metaWithPrettySlug, '4.1.1_ChoresAreTheJob')).toBe(
      'chores-are-the-job',
    );
    expect(buildArticleCanonicalPath(metaWithPrettySlug, '4.1.1_ChoresAreTheJob')).toBe(
      '/articles/chores-are-the-job',
    );
  });

  it('falls back to filename when slug is missing', () => {
    const meta: ArticleMeta = { title: 'Legacy', tags: [] };
    expect(buildArticleCanonicalPath(meta, '1.1.1_UnconsciousSuccess')).toBe(
      '/articles/1.1.1_UnconsciousSuccess',
    );
  });
});
