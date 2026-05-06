import { describe, it, expect } from 'vitest';
import type { ArticleMeta } from '../../types/articles';
import {
  getArticleXp,
  getFirstReadBonus,
  getSeriesCompletionMultiplier,
  calculateBaseArticleXp,
  calculateTotalArticleXp,
} from '../../utils/articleXpRewards';

describe('articleXpRewards', () => {
  const pplMeta: ArticleMeta = {
    title: 't',
    slug: '/articles/x',
    tags: ['PPL'],
  };

  it('returns per-article override from config when slug matches articles map', () => {
    expect(getArticleXp('millionaire-teaching-1')).toBe(30);
    expect(getArticleXp('logical-presentation-1')).toBe(25);
  });

  it('returns category Xp from first tag when no per-article entry', () => {
    expect(getArticleXp('/articles/unknown', pplMeta)).toBe(2);
  });

  it('returns default when slug and category do not match', () => {
    expect(getArticleXp('no-such-article')).toBe(25);
  });

  it('getFirstReadBonus and getSeriesCompletionMultiplier read config', () => {
    expect(getFirstReadBonus()).toBe(10);
    expect(getSeriesCompletionMultiplier()).toBe(1.5);
  });

  it('calculateBaseArticleXp aliases getArticleXp', () => {
    expect(calculateBaseArticleXp('millionaire-teaching-1')).toBe(30);
  });

  it('calculateTotalArticleXp applies series multiplier and first-read bonus', () => {
    const base = 30;
    expect(calculateTotalArticleXp('millionaire-teaching-1', undefined, false, false)).toBe(base);
    // series complete: round(30 * 1.5) = 45
    expect(calculateTotalArticleXp('millionaire-teaching-1', undefined, false, true)).toBe(45);
    // first read only: 30 + 10
    expect(calculateTotalArticleXp('millionaire-teaching-1', undefined, true, false)).toBe(40);
    // both: round(30 * 1.5) + 10 = 55
    expect(calculateTotalArticleXp('millionaire-teaching-1', undefined, true, true)).toBe(55);
  });
});
