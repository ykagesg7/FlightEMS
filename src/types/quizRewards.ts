export interface QuizSessionRewardSummary {
  sessionXp?: number;
  comprehensionXp?: number;
  comprehensionAchieved?: boolean;
  delayedXp?: number;
  delayedCount?: number;
  weaknessXp?: number;
  weaknessCount?: number;
  srsCardsUpdated?: number;
}

export function hasQuizRewardSummary(summary: QuizSessionRewardSummary | null | undefined): boolean {
  if (!summary) return false;
  return Boolean(
    (summary.sessionXp && summary.sessionXp > 0)
    || summary.comprehensionAchieved
    || (summary.delayedXp && summary.delayedXp > 0)
    || (summary.weaknessXp && summary.weaknessXp > 0)
    || (summary.srsCardsUpdated && summary.srsCardsUpdated > 0),
  );
}
