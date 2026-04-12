import { describe, it, expect, vi, afterEach } from 'vitest';
import type { ArticleMeta } from '../../types/articles';
import {
  calculateLearningStats,
  type ArticleProgress,
} from '../../hooks/useArticleProgress';

describe('calculateLearningStats', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const metaA: ArticleMeta = {
    title: 'A',
    slug: '/articles/a',
    tags: ['Cat1'],
    series: 'S1',
  };
  const metaB: ArticleMeta = {
    title: 'B',
    slug: '/articles/b',
    tags: ['Cat1'],
    series: 'S1',
  };
  const metaC: ArticleMeta = {
    title: 'C',
    slug: '/articles/c',
    tags: ['Cat2'],
  };

  const articleIndex: Record<string, ArticleMeta> = {
    '/articles/a': metaA,
    '/articles/b': metaB,
    '/articles/c': metaC,
  };
  const articleIndexByFilename: Record<string, ArticleMeta> = {
    fileA: metaA,
  };

  it('counts totals, category read/percentage, and resolves slug or filename keys', () => {
    const fixed = new Date('2026-04-13T12:00:00Z');
    vi.setSystemTime(fixed);

    const progress: Record<string, ArticleProgress> = {
      '/articles/a': {
        articleSlug: '/articles/a',
        readAt: fixed,
        readingTime: 60,
        scrollProgress: 100,
        completed: true,
        bookmarked: false,
        lastPosition: 0,
        rating: 4,
      },
      fileA_dup: {
        articleSlug: 'fileA',
        readAt: fixed,
        readingTime: 30,
        scrollProgress: 50,
        completed: false,
        bookmarked: false,
        lastPosition: 0,
      },
      '/articles/c': {
        articleSlug: '/articles/c',
        readAt: fixed,
        readingTime: 120,
        scrollProgress: 100,
        completed: true,
        bookmarked: true,
        lastPosition: 0,
        rating: 5,
      },
    };

    const stats = calculateLearningStats(
      progress,
      articleIndex,
      articleIndexByFilename,
      { current_streak_days: 3 },
      { completed_missions: [{ mission_id: 'm1' }], rank: 'pilot' },
      42
    );

    expect(stats.totalArticles).toBe(3);
    expect(stats.readArticles).toBe(3);
    expect(stats.completedArticles).toBe(2);
    expect(stats.streakDays).toBe(3);
    expect(stats.completedMissions).toBe(1);
    expect(stats.rankProgress).toBe(42);
    expect(stats.currentRank).toBe('pilot');
    expect(stats.averageRating).toBeCloseTo(4.5);

    expect(stats.categoriesProgress.Cat1).toEqual({ read: 1, total: 2, percentage: 50 });
    expect(stats.categoriesProgress.Cat2).toEqual({ read: 1, total: 1, percentage: 100 });

    expect(stats.seriesProgress.S1).toEqual({ read: 1, total: 2, percentage: 50 });

    expect(stats.readingGoals.achieved).toBe(true);
    expect(stats.favoriteCategories[0]).toBe('Cat2');
  });

  it('marks reading goal not achieved when fewer than 2 completions today', () => {
    vi.setSystemTime(new Date('2026-04-13T10:00:00Z'));
    const today = new Date('2026-04-13T08:00:00Z');
    const progress: Record<string, ArticleProgress> = {
      '/articles/a': {
        articleSlug: '/articles/a',
        readAt: today,
        readingTime: 10,
        scrollProgress: 100,
        completed: true,
        bookmarked: false,
        lastPosition: 0,
      },
    };

    const stats = calculateLearningStats(
      progress,
      articleIndex,
      articleIndexByFilename
    );

    expect(stats.readingGoals.achieved).toBe(false);
  });
});
