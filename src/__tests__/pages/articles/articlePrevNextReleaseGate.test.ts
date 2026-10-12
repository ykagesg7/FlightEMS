import { describe, expect, it } from 'vitest';
import { filterReleasedArticleContents } from '../../../constants/articleHubCategories';
import type { LearningContent } from '../../../types';
import type { ArticleMeta } from '../../../types/articles';
import { getArticleNavigationNeighbors } from '../../../utils/articleNavigation';

function mockContent(id: string, category: string, orderIndex: number): LearningContent {
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

describe('article prev/next release gate', () => {
  const habitContents = [
    mockContent('1.1.2_EndWithFuture', 'メンタリティー', 2),
    mockContent('1.1.3_PrioritizingMostImportant', 'メンタリティー', 3),
    mockContent('1.1.4_WinWinThinking', 'メンタリティー', 4),
  ];

  const habitMetas: Record<string, ArticleMeta> = {
    '1.1.2_EndWithFuture': {
      title: 'その２',
      slug: '/articles/end-with-future',
      tags: [],
      series: '７つの習慣',
      order: 2,
      publishedAt: '2026-10-04',
    },
    '1.1.3_PrioritizingMostImportant': {
      title: 'その３',
      slug: '/articles/prioritizing-most-important',
      tags: [],
      series: '７つの習慣',
      order: 3,
      publishedAt: '2026-10-11',
    },
    '1.1.4_WinWinThinking': {
      title: 'その４',
      slug: '/articles/win-win-thinking',
      tags: [],
      series: '７つの習慣',
      order: 4,
      publishedAt: '2026-10-18',
    },
  };

  it('skips future-drip neighbors (same as PrevNextNav / usePrevNext list)', () => {
    const beforeRelease = filterReleasedArticleContents(
      habitContents,
      habitMetas,
      new Date('2026-10-12T12:00:00.000Z'),
    );
    const neighbors = getArticleNavigationNeighbors(
      '1.1.3_PrioritizingMostImportant',
      beforeRelease,
      habitMetas,
    );
    expect(neighbors.prev?.id).toBe('1.1.2_EndWithFuture');
    expect(neighbors.next).toBeUndefined();
  });

  it('includes drip article in neighbors after publishedAt JST day', () => {
    const onReleaseDay = filterReleasedArticleContents(
      habitContents,
      habitMetas,
      new Date('2026-10-17T15:00:00.000Z'),
    );
    const neighbors = getArticleNavigationNeighbors(
      '1.1.3_PrioritizingMostImportant',
      onReleaseDay,
      habitMetas,
    );
    expect(neighbors.next?.id).toBe('1.1.4_WinWinThinking');
  });
});
