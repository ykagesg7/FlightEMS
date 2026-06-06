import { describe, expect, it } from 'vitest';
import {
  buildArticleHubSearchParams,
  filterArticleHubContents,
  getTopTags,
  getVisibleTabs,
  parseArticleHubSearchParams,
  parseLegacyArticleHubParams,
  pickNextToReadArticle,
  type ArticleHubState,
} from '../../pages/articles/articleHubFilters';
import type { LearningContent } from '../../types';
import type { ArticleMeta } from '../../types/articles';

function mockContent(id: string, category: string, title?: string): LearningContent {
  return {
    id,
    title: title ?? id,
    category,
    is_published: true,
    order_index: 0,
    description: 'desc',
    created_at: '2026-01-01',
  } as LearningContent;
}

const metas: Record<string, ArticleMeta> = {
  a: { title: 'Alpha VOR', slug: '/a', tags: ['VOR', 'CPL'], series: 'Nav', order: 1 },
  b: { title: 'Beta GPS', slug: '/b', tags: ['GPS', 'CPL'], series: 'Nav', order: 2 },
  c: { title: 'PPL Intro', slug: '/c', tags: ['PPL'], series: 'PPL', order: 1 },
};

describe('articleHubFilters', () => {
  const contents = [
    mockContent('a', 'CPL学科', 'Alpha VOR'),
    mockContent('b', 'CPL学科', 'Beta GPS'),
    mockContent('c', 'PPL', 'PPL Intro'),
  ];

  const defaultState: ArticleHubState = {
    tab: 'continue',
    query: '',
    tags: [],
    status: 'all',
    sort: 'date',
  };

  it('maps legacy mainFilter=学科 to tab cpl', () => {
    const params = new URLSearchParams('mainFilter=学科&category=CPL学科');
    const legacy = parseLegacyArticleHubParams(params);
    expect(legacy.tab).toBe('cpl');
  });

  it('parses q search param', () => {
    const visible = getVisibleTabs(contents);
    const state = parseArticleHubSearchParams(new URLSearchParams('q=VOR'), visible);
    expect(state.query).toBe('VOR');
  });

  it('filters by keyword query', () => {
    const filtered = filterArticleHubContents({
      contents,
      metas,
      state: { ...defaultState, query: 'vor' },
      getProgress: () => null,
    });
    expect(filtered.map((c) => c.id)).toEqual(['a']);
  });

  it('filters by tab cpl', () => {
    const filtered = filterArticleHubContents({
      contents,
      metas,
      state: { ...defaultState, tab: 'cpl' },
      getProgress: () => null,
    });
    expect(filtered).toHaveLength(2);
  });

  it('filters by status in-progress', () => {
    const filtered = filterArticleHubContents({
      contents,
      metas,
      state: { ...defaultState, status: 'in-progress' },
      getProgress: (id) => (id === 'a' ? { completed: true } : null),
    });
    expect(filtered.map((c) => c.id)).not.toContain('a');
  });

  it('pickNextToReadArticle prefers lowest order in series', () => {
    const next = pickNextToReadArticle(contents, metas, () => null);
    expect(next?.id).toBe('a');
  });

  it('getTopTags returns most frequent tags', () => {
    const tags = getTopTags(contents, metas, 2);
    expect(tags).toContain('CPL');
  });

  it('buildArticleHubSearchParams omits default continue tab', () => {
    const params = buildArticleHubSearchParams(defaultState);
    expect(params.has('tab')).toBe(false);
  });

  it('mindset tab hidden when no mindset articles', () => {
    const visible = getVisibleTabs(contents);
    expect(visible).not.toContain('mindset');
    expect(visible).toContain('cpl');
    expect(visible).toContain('ppl');
  });
});
