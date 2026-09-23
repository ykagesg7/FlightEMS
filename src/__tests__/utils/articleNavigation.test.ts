import { describe, expect, it } from 'vitest';
import type { LearningContent } from '../../types';
import type { ArticleMeta } from '../../types/articles';
import { getArticleNavigationNeighbors } from '../../utils/articleNavigation';

function mockContent(
  id: string,
  category: string,
  orderIndex: number
): LearningContent {
  return {
    id,
    title: id,
    category,
    sub_category: null,
    description: null,
    order_index: orderIndex,
    parent_id: null,
    content_type: 'article',
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    is_published: true,
  };
}

describe('getArticleNavigationNeighbors', () => {
  const contents = [
    mockContent('a', 'CPL学科', 10),
    mockContent('b', 'CPL学科', 20),
    mockContent('c', 'CPL学科', 30),
    mockContent('x', 'PPL', 5),
  ];

  it('uses series order within the same series', () => {
    const metas: Record<string, ArticleMeta> = {
      a: { title: 'A', slug: '/a', tags: [], series: 'Nav', order: 2 },
      b: { title: 'B', slug: '/b', tags: [], series: 'Nav', order: 1 },
      c: { title: 'C', slug: '/c', tags: [], series: 'Nav', order: 3 },
    };

    const neighbors = getArticleNavigationNeighbors('a', contents, metas);
    expect(neighbors.prev?.id).toBe('b');
    expect(neighbors.next?.id).toBe('c');
  });

  it('falls back to category order_index when series is missing', () => {
    const metas: Record<string, ArticleMeta> = {
      x: { title: 'X', slug: '/x', tags: [] },
    };

    const neighbors = getArticleNavigationNeighbors('b', contents, metas);
    expect(neighbors.prev?.id).toBe('a');
    expect(neighbors.next?.id).toBe('c');
  });
});
