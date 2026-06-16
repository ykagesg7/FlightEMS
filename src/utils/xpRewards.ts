import xpRewardsConfig from '../config/xpRewards.json';
import type { ArticleXpConfig } from '../types/articles';

export type XpEventType = 'registration' | 'quiz_session' | 'article_read';

export interface QuizSessionXpConfig {
  base: number;
  perCorrect: number;
  perfectScoreBonus: number;
  examModeMultiplier: number;
  minQuestions: number;
}

export interface XpRewardsConfig {
  registration: number;
  quizSession: QuizSessionXpConfig;
  articles: ArticleXpConfig;
}

export function getXpRewardsConfig(): XpRewardsConfig {
  return xpRewardsConfig as XpRewardsConfig;
}

export function getRegistrationXp(): number {
  return getXpRewardsConfig().registration;
}

export function calculateQuizSessionXp(
  correctCount: number,
  totalQuestions: number,
  mode: 'practice' | 'exam' | 'review' | 'cpl_exam'
): number {
  const cfg = getXpRewardsConfig().quizSession;
  if (totalQuestions < cfg.minQuestions) {
    return 0;
  }

  let xp = cfg.base + correctCount * cfg.perCorrect;
  if (totalQuestions > 0 && correctCount === totalQuestions) {
    xp += cfg.perfectScoreBonus;
  }
  if (mode === 'exam' || mode === 'cpl_exam') {
    xp = Math.round(xp * cfg.examModeMultiplier);
  }
  return xp;
}
