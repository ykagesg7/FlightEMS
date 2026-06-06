import type { User } from '@supabase/supabase-js';

/** Google OAuth 等で username メタが無い場合の表示名フォールバック */
export function deriveOAuthUsername(user: User): string {
  const meta = user.user_metadata ?? {};
  const fromUsername = typeof meta.username === 'string' ? meta.username.trim() : '';
  if (fromUsername) return fromUsername;

  const fromFullName = typeof meta.full_name === 'string' ? meta.full_name.trim() : '';
  if (fromFullName) return fromFullName;

  const fromName = typeof meta.name === 'string' ? meta.name.trim() : '';
  if (fromName) return fromName;

  const emailPrefix = user.email?.split('@')[0]?.trim();
  if (emailPrefix) return emailPrefix;

  return 'Learner';
}
