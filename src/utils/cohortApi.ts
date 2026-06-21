import type {
  CohortAnonymousStats,
  LicenseTarget,
  PublicUserBadge,
  UserCohortProfile,
} from './cohort';
import supabase from './supabase';

function normalizeCohortRpcError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes('could not find the function')
    || lower.includes('pgrst202')
    || lower.includes('function public.upsert_user_cohort')
    || lower.includes('function public.get_user_cohort_profile')
  ) {
    return '受験予定の保存機能がサーバーに未設定です。しばらくしてから再度お試しください。';
  }
  return message;
}

export async function upsertUserCohort(params: {
  license?: LicenseTarget;
  examYm?: string | null;
  undecided?: boolean;
}): Promise<{ data: Record<string, unknown> | null; error: Error | null }> {
  const { data, error } = await supabase.rpc('upsert_user_cohort', {
    p_license: params.license ?? 'CPL',
    p_exam_ym: params.examYm ?? null,
    p_undecided: params.undecided ?? false,
  });

  if (error) {
    return { data: null, error: new Error(normalizeCohortRpcError(error.message)) };
  }
  return { data: data as Record<string, unknown>, error: null };
}

export async function fetchUserCohortProfile(): Promise<{
  profile: UserCohortProfile | null;
  error: Error | null;
}> {
  const { data, error } = await supabase.rpc('get_user_cohort_profile');
  if (error) {
    return { profile: null, error: new Error(normalizeCohortRpcError(error.message)) };
  }
  if (!data || typeof data !== 'object') {
    return { profile: null, error: null };
  }
  return { profile: data as UserCohortProfile, error: null };
}

export async function fetchCohortAnonymousStats(cohortKey?: string): Promise<{
  stats: CohortAnonymousStats | null;
  error: Error | null;
}> {
  const { data, error } = await supabase.rpc('get_cohort_anonymous_stats', {
    p_cohort_key: cohortKey ?? null,
  });
  if (error) {
    return { stats: null, error: new Error(error.message) };
  }
  return { stats: data as CohortAnonymousStats, error: null };
}

export async function markWrittenExamComplete(): Promise<{ error: Error | null }> {
  const { error } = await supabase.rpc('mark_written_exam_complete');
  if (error) {
    return { error: new Error(error.message) };
  }
  return { error: null };
}

export async function fetchPublicUserBadges(userId: string): Promise<{
  badges: PublicUserBadge[];
  error: Error | null;
}> {
  const { data, error } = await supabase.rpc('get_public_user_badges', {
    p_user_id: userId,
  });
  if (error) {
    return { badges: [], error: new Error(error.message) };
  }
  return { badges: (data ?? []) as PublicUserBadge[], error: null };
}

export async function fetchUnreadInAppNotifications(userId: string) {
  return supabase
    .from('in_app_notifications')
    .select('*')
    .eq('user_id', userId)
    .is('read_at', null)
    .order('created_at', { ascending: false })
    .limit(20);
}

export async function markInAppNotificationRead(notificationId: string) {
  return supabase
    .from('in_app_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId);
}

export async function savePushSubscription(payload: {
  endpoint: string;
  p256dh: string;
  auth: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: new Error('not authenticated') };
  }
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint: payload.endpoint,
      p256dh: payload.p256dh,
      auth: payload.auth,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,endpoint' },
  );
  return { error: error ? new Error(error.message) : null };
}
