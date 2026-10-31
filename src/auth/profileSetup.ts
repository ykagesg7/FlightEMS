import type { Profile } from '../stores/authStore';
import { useAuthStore } from '../stores/authStore';
import supabase from '../utils/supabase';

/** Users with XP already earned the app without finishing the welcome wizard. */
export function profileHasPriorEngagement(profile: Profile): boolean {
  return (profile.xp_points ?? 0) > 0;
}

export function needsWelcomeSetup(profile: Profile | null): boolean {
  if (profile == null) return false;
  if (profile.onboarding_completed_at != null) return false;
  if (profileHasPriorEngagement(profile)) return false;
  return true;
}

/** Persist onboarding completion for returning users who skipped the wizard. */
export async function reconcileOnboardingForReturningUser(
  userId: string,
  profile: Profile,
): Promise<Profile> {
  if (profile.onboarding_completed_at != null || !profileHasPriorEngagement(profile)) {
    return profile;
  }

  const { error } = await completeWelcomeSetup(userId);
  if (error) {
    return profile;
  }

  return useAuthStore.getState().profile ?? profile;
}

export function isCohortOnlyWelcomeMode(searchParams: URLSearchParams): boolean {
  return searchParams.get('mode') === 'cohort';
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
