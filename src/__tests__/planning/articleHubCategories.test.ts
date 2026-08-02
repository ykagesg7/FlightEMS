import { describe, expect, it } from 'vitest';
import { WITHDRAWN_ARTICLE_IDS } from '../../constants/withdrawnArticleIds';
import {
  countMindsetArticles,
  filterPublishedArticleContents,
  filterReleasedArticleContents,
  isMindsetCategory,
} from '../../constants/articleHubCategories';
import type { LearningContent } from '../../types';
import type { ArticleMeta } from '../../types/articles';

function mockContent(
  id: string,
  category: string,
  isPublished = true
): LearningContent {
  return {
    id,
    title: id,
    category,
    is_published: isPublished,
    order_index: 0,
    description: '',
    created_at: '2026-01-01',
  } as LearningContent;
}

describe('articleHubCategories', () => {
  it('excludes withdrawn article ids even when is_published is true', () => {
    const withdrawnId = WITHDRAWN_ARTICLE_IDS[0];
    const contents = [
      mockContent(withdrawnId, 'メンタリティー', true),
      mockContent('3.1.1_AviationLegal0', 'CPL学科', true),
    ];
    const filtered = filterPublishedArticleContents(contents);
    expect(filtered.map((c) => c.id)).toEqual(['3.1.1_AviationLegal0']);
  });

  it('excludes unpublished and non-hub categories', () => {
    const contents = [
      mockContent('blog', 'メンタリティー', false),
      mockContent('other', 'その他', true),
      mockContent('ppl', 'PPL', true),
    ];
    const filtered = filterPublishedArticleContents(contents);
    expect(filtered.map((c) => c.id)).toEqual(['ppl']);
  });

  it('counts mindset articles from published non-withdrawn only', () => {
    const withdrawnId = WITHDRAWN_ARTICLE_IDS[0];
    const contents = [
      mockContent(withdrawnId, 'メンタリティー', true),
      mockContent('lesson', 'CPL学科', true),
    ];
    const published = filterPublishedArticleContents(contents);
    expect(countMindsetArticles(published)).toBe(0);
    expect(isMindsetCategory('思考法')).toBe(true);
    expect(isMindsetCategory('CPL学科')).toBe(false);
  });

  it('hides drip articles until publishedAt JST day', () => {
    const contents = [
      mockContent('4.1.1_ChoresAreTheJob', 'メンタリティー', true),
      mockContent('legacy', 'PPL', true),
    ];
    const metas: Record<string, ArticleMeta> = {
      '4.1.1_ChoresAreTheJob': {
        title: '雑用こそ、仕事ばい',
        slug: '/articles/chores-are-the-job',
        tags: [],
        publishedAt: '2026-08-03',
      },
    };
    const before = filterReleasedArticleContents(
      contents,
      metas,
      new Date('2026-08-02T03:00:00.000Z'),
    );
    expect(before.map((c) => c.id)).toEqual(['legacy']);
    const after = filterReleasedArticleContents(
      contents,
      metas,
      new Date('2026-08-02T15:00:00.000Z'),
    );
    expect(after.map((c) => c.id)).toEqual(['4.1.1_ChoresAreTheJob', 'legacy']);
  });
});
