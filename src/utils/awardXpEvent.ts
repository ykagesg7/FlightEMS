import type { QueryClient } from '@tanstack/react-query';

export interface AwardXpEventResult {
  success: boolean;
  xpAwarded?: number;
  newXp?: number;
  error?: string;
}

export async function invalidateGamificationProfile(
  queryClient: QueryClient,
  userId: string
): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: ['gamification', 'profile', userId] });
}
