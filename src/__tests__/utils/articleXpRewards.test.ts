import { describe, it, expect } from 'vitest';
import type { ArticleMeta } from '../../types/articles';
import {
  getArticleXp,
  getFirstReadBonus,
  getSeriesCompletionMultiplier,
  calculateBaseArticleXp,
  calculateTotalArticleXp,
} from '../../utils/articleXpRewards';
import { calculateQuizSessionXp, getRegistrationXp } from '../../utils/xpRewards';

describe('articleXpRewards', () => {
  const pplMeta: ArticleMeta = {
    title: 't',
    slug: '/articles/x',
    tags: ['PPL'],
  };

  it('returns per-article override from config when slug matches articles map', () => {
    expect(getArticleXp('millionaire-teaching-1')).toBe(25);
    expect(getArticleXp('logical-presentation-1')).toBe(20);
  });

  it('returns category Xp from first tag when no per-article entry', () => {
    expect(getArticleXp('/articles/unknown', pplMeta)).toBe(5);
  });

  it('returns default when slug and category do not match', () => {
    expect(getArticleXp('no-such-article')).toBe(15);
  });

  it('getFirstReadBonus and getSeriesCompletionMultiplier read config', () => {
    expect(getFirstReadBonus()).toBe(5);
    expect(getSeriesCompletionMultiplier()).toBe(1.5);
  });

  it('calculateBaseArticleXp aliases getArticleXp', () => {
    expect(calculateBaseArticleXp('millionaire-teaching-1')).toBe(25);
  });

  it('calculateTotalArticleXp applies series multiplier and first-read bonus', () => {
    const base = 25;
    expect(calculateTotalArticleXp('millionaire-teaching-1', undefined, false, false)).toBe(base);
    expect(calculateTotalArticleXp('millionaire-teaching-1', undefined, false, true)).toBe(38);
    expect(calculateTotalArticleXp('millionaire-teaching-1', undefined, true, false)).toBe(30);
    expect(calculateTotalArticleXp('millionaire-teaching-1', undefined, true, true)).toBe(43);
  });
});

describe('xpRewards', () => {
  it('getRegistrationXp returns configured welcome bonus', () => {
    expect(getRegistrationXp()).toBe(100);
  });

  it('calculateQuizSessionXp scales by mode and perfect score', () => {
    // practice: 10 + 3*2 = 16
    expect(calculateQuizSessionXp(3, 5, 'practice')).toBe(16);
    // perfect practice: 10 + 5*2 + 15 = 35
    expect(calculateQuizSessionXp(5, 5, 'practice')).toBe(35);
    // exam multiplier: round(35 * 1.25) = 44
    expect(calculateQuizSessionXp(5, 5, 'exam')).toBe(44);
    expect(calculateQuizSessionXp(0, 0, 'practice')).toBe(0);
  });
});
