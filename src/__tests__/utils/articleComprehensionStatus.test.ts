import { describe, expect, it } from 'vitest';
import type { ArticleProgress } from '../../hooks/useArticleProgress';
import type { LearningContent } from '../../types';
import {
  comprehensionIdsFromMilestoneKeys,
  isArticleReadProgress,
  pickNextComprehensionArticle,
  resolveArticleComprehensionStatus,
} from '../../utils/articleComprehensionStatus';

function progress(
  overrides: Partial<ArticleProgress> & Pick<ArticleProgress, 'articleSlug'>,
): ArticleProgress {
  return {
    readAt: new Date('2026-07-01T00:00:00Z'),
    readingTime: 0,
    scrollProgress: 0,
    completed: false,
    bookmarked: false,
    lastPosition: 0,
    ...overrides,
  };
}

function content(id: string, title = id): LearningContent {
  return {
    id,
    title,
    category: 'PPL',
    sub_category: '航空工学',
    description: null,
    order_index: 0,
    parent_id: null,
    content_type: 'article',
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    is_published: true,
  };
}

describe('articleComprehensionStatus', () => {
  it('isArticleReadProgress treats completed or >=95% as read', () => {
    expect(isArticleReadProgress(null)).toBe(false);
    expect(isArticleReadProgress(progress({ articleSlug: 'a', scrollProgress: 50 }))).toBe(
      false,
    );
    expect(isArticleReadProgress(progress({ articleSlug: 'a', scrollProgress: 95 }))).toBe(
      true,
    );
    expect(
      isArticleReadProgress(progress({ articleSlug: 'a', completed: true, scrollProgress: 10 })),
    ).toBe(true);
  });

  it('resolveArticleComprehensionStatus prefers comprehended over read', () => {
    const read = progress({ articleSlug: 'a', completed: true, scrollProgress: 100 });
    expect(resolveArticleComprehensionStatus(read, true)).toBe('comprehended');
    expect(resolveArticleComprehensionStatus(read, false)).toBe('read');
    expect(resolveArticleComprehensionStatus(null, false)).toBe('unread');
    expect(resolveArticleComprehensionStatus(null, true)).toBe('comprehended');
  });

  it('pickNextComprehensionArticle returns most recently read unread-comprehension', () => {
    const older = content('old');
    const newer = content('new');
    const map: Record<string, ArticleProgress> = {
      old: progress({
        articleSlug: 'old',
        completed: true,
        scrollProgress: 100,
        readAt: new Date('2026-07-01T00:00:00Z'),
      }),
      new: progress({
        articleSlug: 'new',
        completed: true,
        scrollProgress: 100,
        readAt: new Date('2026-07-10T00:00:00Z'),
      }),
    };
    const pick = pickNextComprehensionArticle(
      [older, newer],
      (id) => map[id] ?? null,
      new Set(),
    );
    expect(pick?.id).toBe('new');
  });

  it('pickNextComprehensionArticle skips comprehension milestones and unread', () => {
    const read = content('read');
    const done = content('done');
    const unread = content('unread');
    const map: Record<string, ArticleProgress> = {
      read: progress({ articleSlug: 'read', completed: true, scrollProgress: 100 }),
      done: progress({ articleSlug: 'done', completed: true, scrollProgress: 100 }),
    };
    const pick = pickNextComprehensionArticle(
      [read, done, unread],
      (id) => map[id] ?? null,
      new Set(['done']),
    );
    expect(pick?.id).toBe('read');
  });

  it('pickNextComprehensionArticle returns null when none', () => {
    expect(
      pickNextComprehensionArticle([content('a')], () => null, new Set()),
    ).toBeNull();
  });

  it('comprehensionIdsFromMilestoneKeys maps milestone_key to set', () => {
    expect(
      comprehensionIdsFromMilestoneKeys([
        { milestone_key: 'PPL-1-1-1' },
        { milestone_key: '  ' },
        null,
        { milestone_key: 'PPL-1-1-2' },
      ]),
    ).toEqual(new Set(['PPL-1-1-1', 'PPL-1-1-2']));
  });
});
