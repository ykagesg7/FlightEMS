import type { QueryClient } from '@tanstack/react-query';
import type { AwardXpEventResult } from './awardXpEvent';
import { invalidateGamificationProfile } from './awardXpEvent';
import { supabase } from './supabase';

export type QuizSessionMode = 'practice' | 'exam' | 'review' | 'cpl_exam';

export interface AwardQuizSessionXpParams {
  userId: string;
  sessionId: string;
  correctCount: number;
  totalQuestions: number;
  mode: QuizSessionMode;
  queryClient?: QueryClient;
}

export interface AwardQuizSessionXpResult {
  success: boolean;
  xpAwarded?: number;
  error?: string;
}

/**
 * Awards XP for a completed quiz session (idempotent via session id).
 */
export async function awardQuizSessionXp({
  userId,
  sessionId,
  correctCount: _correctCount,
  totalQuestions: _totalQuestions,
  mode: _mode,
  queryClient,
}: AwardQuizSessionXpParams): Promise<AwardQuizSessionXpResult> {
  if (!sessionId || sessionId === 'temp-session-id') {
    return { success: false, error: 'invalid_session' };
  }

  const { data, error } = await supabase.rpc('award_quiz_session_xp', {
    p_session_id: sessionId,
  });
  if (error) {
    return { success: false, error: error.message };
  }

  const payload = data as {
    success?: boolean;
    xp_awarded?: number;
    error?: string;
  } | null;

  if (!payload?.success) {
    return { success: false, error: payload?.error ?? 'award_failed' };
  }

  if (queryClient) {
    await invalidateGamificationProfile(queryClient, userId);
  }

  return {
    success: true,
    xpAwarded: payload.xp_awarded ?? 0,
  };
}

/**
 * Awards one-time registration XP after welcome setup completes.
 */
export async function awardRegistrationXp(
  userId: string,
  queryClient?: QueryClient
): Promise<AwardXpEventResult> {
  const { data, error } = await supabase.rpc('award_registration_xp');
  if (error) {
    return { success: false, error: error.message };
  }

  const payload = data as {
    success?: boolean;
    xp_awarded?: number;
    new_xp?: number;
    error?: string;
  } | null;
  const result: AwardXpEventResult = payload?.success
    ? {
        success: true,
        xpAwarded: payload.xp_awarded,
        newXp: payload.new_xp,
      }
    : { success: false, error: payload?.error ?? 'award_failed' };

  if (result.success && queryClient) {
    await invalidateGamificationProfile(queryClient, userId);
  }
  return result;
}
