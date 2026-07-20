import type { QueryClient } from '@tanstack/react-query';
import { sendGa4Event } from '../lib/googleAnalytics';
import { invalidateGamificationProfile } from './awardXpEvent';
import { supabase } from './supabase';

export interface MasteryLoopResult {
  success: boolean;
  delayedXp?: number;
  delayedCount?: number;
  weaknessXp?: number;
  weaknessCount?: number;
  srsCardsUpdated?: number;
  error?: string;
}

/**
 * Post-quiz mastery loop (order matters):
 * 1. delayed retention XP while SRS due dates are still pre-sync
 * 2. sync SRS cards from this session
 * 3. weakness improvement XP (refreshes weak areas server-side)
 */
export async function runMasteryLoopAfterSession(
  sessionId: string,
  options?: { userId?: string; queryClient?: QueryClient },
): Promise<MasteryLoopResult> {
  if (!sessionId || sessionId === 'temp-session-id') {
    return { success: false, error: 'invalid_session' };
  }

  const { data: delayedData, error: delayedError } = await supabase.rpc(
    'award_delayed_retention_xp',
    { p_session_id: sessionId },
  );
  if (delayedError) {
    return { success: false, error: delayedError.message };
  }

  const delayed = delayedData as {
    success?: boolean;
    xp_awarded?: number;
    milestones_awarded?: number;
    error?: string;
  } | null;

  const { data: srsData, error: srsError } = await supabase.rpc('sync_srs_after_session', {
    p_session_id: sessionId,
  });
  if (srsError) {
    return { success: false, error: srsError.message };
  }

  const srs = srsData as {
    success?: boolean;
    cards_updated?: number;
    error?: string;
  } | null;

  const { data: weaknessData, error: weaknessError } = await supabase.rpc(
    'award_weakness_improvement_xp',
    { p_session_id: sessionId },
  );
  if (weaknessError) {
    return { success: false, error: weaknessError.message };
  }

  const weakness = weaknessData as {
    success?: boolean;
    xp_awarded?: number;
    subjects_awarded?: number;
    error?: string;
  } | null;

  const delayedXp = delayed?.xp_awarded ?? 0;
  const weaknessXp = weakness?.xp_awarded ?? 0;
  const delayedCount = delayed?.milestones_awarded ?? 0;
  const weaknessCount = weakness?.subjects_awarded ?? 0;
  const srsCardsUpdated = srs?.cards_updated ?? 0;

  if (delayedXp > 0) {
    sendGa4Event('learning_milestone_achieved', {
      milestone_type: 'delayed_retention',
      session_id: sessionId,
      xp_awarded: delayedXp,
      milestones_awarded: delayedCount,
    });
  }
  if (weaknessXp > 0) {
    sendGa4Event('learning_milestone_achieved', {
      milestone_type: 'weakness_improvement',
      session_id: sessionId,
      xp_awarded: weaknessXp,
      subjects_awarded: weaknessCount,
    });
  }

  if ((delayedXp > 0 || weaknessXp > 0) && options?.userId && options.queryClient) {
    await invalidateGamificationProfile(options.queryClient, options.userId);
  }

  return {
    success: true,
    delayedXp,
    delayedCount,
    weaknessXp,
    weaknessCount,
    srsCardsUpdated,
  };
}
