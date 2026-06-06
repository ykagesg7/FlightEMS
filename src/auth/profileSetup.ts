import type { Profile } from '../stores/authStore';
import { useAuthStore } from '../stores/authStore';
import supabase from '../utils/supabase';

export function needsWelcomeSetup(profile: Profile | null): boolean {
  return profile != null && profile.onboarding_completed_at == null;
}

export function getWelcomeRedirectTarget(searchParams: URLSearchParams): string {
  const next = searchParams.get('next');
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    return next;
  }
  return '/';
}

export function getPostAuthPath(profile: Profile | null, from: string): string {
  if (needsWelcomeSetup(profile)) {
    return `/welcome?next=${encodeURIComponent(from)}`;
  }
  return from;
}

export async function completeWelcomeSetup(userId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      return { error };
    }

    await useAuthStore.getState().fetchProfile(userId);
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err : new Error('セットアップ完了処理に失敗しました') };
  }
}
