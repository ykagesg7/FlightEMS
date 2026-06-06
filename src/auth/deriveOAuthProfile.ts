import type { User } from '@supabase/supabase-js';
import { deriveOAuthUsername } from './deriveOAuthUsername';

function readMetaString(meta: Record<string, unknown>, key: string): string {
  const value = meta[key];
  return typeof value === 'string' ? value.trim() : '';
}

/** Google OAuth 等のプロフィール画像 URL（Supabase は avatar_url、Google raw は picture） */
export function deriveOAuthAvatarUrl(user: User): string | null {
  const meta = user.user_metadata ?? {};
  const fromAvatar = readMetaString(meta, 'avatar_url');
  if (fromAvatar) return fromAvatar;

  const fromPicture = readMetaString(meta, 'picture');
  if (fromPicture) return fromPicture;

  return null;
}

/** ランキング表示名 prefill 用（full_name / name を優先、なければ username フォールバック） */
export function deriveOAuthDisplayName(user: User): string {
  const meta = user.user_metadata ?? {};
  const fromFullName = readMetaString(meta, 'full_name');
  if (fromFullName) return fromFullName;

  const fromName = readMetaString(meta, 'name');
  if (fromName) return fromName;

  return deriveOAuthUsername(user);
}
