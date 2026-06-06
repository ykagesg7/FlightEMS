import { describe, expect, it } from 'vitest';
import { WITHDRAWN_ARTICLE_IDS } from '../../constants/withdrawnArticleIds';
import {
  countMindsetArticles,
  filterPublishedArticleContents,
  isMindsetCategory,
} from '../../constants/articleHubCategories';
import type { LearningContent } from '../../types';

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
});
