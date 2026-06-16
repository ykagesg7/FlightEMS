import type { QueryClient } from '@tanstack/react-query';
import type { XpEventType } from './xpRewards';
import { supabase } from './supabase';

export interface AwardXpEventResult {
  success: boolean;
  xpAwarded?: number;
  newXp?: number;
  error?: string;
}

export async function awardXpEvent(
  userId: string,
  eventType: XpEventType,
  eventKey: string,
  xpAmount: number
): Promise<AwardXpEventResult> {
  if (xpAmount <= 0) {
    return { success: false, error: 'zero_xp' };
  }

  const { data, error } = await supabase.rpc('award_xp_event', {
    p_user_id: userId,
    p_event_type: eventType,
    p_event_key: eventKey,
    p_xp_amount: xpAmount,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const payload = data as {
    success?: boolean;
    xp_awarded?: number;
    new_xp?: number;
    error?: string;
  } | null;

  if (!payload?.success) {
    return { success: false, error: payload?.error ?? 'award_failed' };
  }

  return {
    success: true,
    xpAwarded: payload.xp_awarded ?? xpAmount,
    newXp: payload.new_xp,
  };
}

export async function invalidateGamificationProfile(
  queryClient: QueryClient,
  userId: string
): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: ['gamification', 'profile', userId] });
}
