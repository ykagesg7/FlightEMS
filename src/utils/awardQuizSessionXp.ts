import type { QueryClient } from '@tanstack/react-query';
import { awardXpEvent, invalidateGamificationProfile } from './awardXpEvent';
import { calculateQuizSessionXp, getRegistrationXp } from './xpRewards';

export type QuizSessionMode = 'practice' | 'exam' | 'review' | 'cpl_exam';

export interface AwardQuizSessionXpParams {
  userId: string;
  sessionId: string;
  correctCount: number;
  totalQuestions: number;
  mode: QuizSessionMode;
  queryClient?: QueryClient;
}

/**
 * Awards XP for a completed quiz session (idempotent via session id).
 */
export async function awardQuizSessionXp({
  userId,
  sessionId,
  correctCount,
  totalQuestions,
  mode,
  queryClient,
}: AwardQuizSessionXpParams): Promise<void> {
  if (!sessionId || sessionId === 'temp-session-id') {
    return;
  }

  const xpAmount = calculateQuizSessionXp(correctCount, totalQuestions, mode);
  if (xpAmount <= 0) {
    return;
  }

  const result = await awardXpEvent(userId, 'quiz_session', sessionId, xpAmount);
  if (result.success && queryClient) {
    await invalidateGamificationProfile(queryClient, userId);
  }
}

/**
 * Awards one-time registration XP after welcome setup completes.
 */
export async function awardRegistrationXp(
  userId: string,
  queryClient?: QueryClient
): Promise<void> {
  const xpAmount = getRegistrationXp();
  if (xpAmount <= 0) {
    return;
  }

  const result = await awardXpEvent(userId, 'registration', 'welcome_setup', xpAmount);
  if (result.success && queryClient) {
    await invalidateGamificationProfile(queryClient, userId);
  }
}
