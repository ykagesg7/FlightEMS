import { describe, expect, it } from 'vitest';
import {
  hasQuizRewardSummary,
  type QuizSessionRewardSummary,
} from '../../types/quizRewards';

describe('hasQuizRewardSummary', () => {
  it('returns false for empty summary', () => {
    expect(hasQuizRewardSummary(null)).toBe(false);
    expect(hasQuizRewardSummary({})).toBe(false);
  });

  it('returns true when any reward is present', () => {
    const withSession: QuizSessionRewardSummary = { sessionXp: 12 };
    const withComprehension: QuizSessionRewardSummary = { comprehensionAchieved: true };
    const withSrs: QuizSessionRewardSummary = { srsCardsUpdated: 3 };
    expect(hasQuizRewardSummary(withSession)).toBe(true);
    expect(hasQuizRewardSummary(withComprehension)).toBe(true);
    expect(hasQuizRewardSummary(withSrs)).toBe(true);
  });
});
