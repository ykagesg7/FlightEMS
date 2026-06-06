import type { User } from '@supabase/supabase-js';
import { deriveOAuthAvatarUrl } from '../auth/deriveOAuthProfile';
import supabase from './supabase';

export interface ImportOAuthAvatarResult {
  avatarUrl: string | null;
  error: Error | null;
}

/**
 * Google 等 OAuth のプロフィール画像を avatars バケットへ取り込み、profiles.avatar_url を更新する。
 * 既存 avatar_url がある場合は何もしない。
 */
export async function importOAuthAvatarIfAvailable(
  user: User,
  existingAvatarUrl: string | null | undefined,
): Promise<ImportOAuthAvatarResult> {
  if (existingAvatarUrl?.trim()) {
    return { avatarUrl: existingAvatarUrl, error: null };
  }

  const sourceUrl = deriveOAuthAvatarUrl(user);
  if (!sourceUrl) {
    return { avatarUrl: null, error: null };
  }

  try {
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      return {
        avatarUrl: null,
        error: new Error(`OAuth avatar fetch failed: ${response.status}`),
      };
    }

    const blob = await response.blob();
    if (!blob.type.startsWith('image/')) {
      return { avatarUrl: null, error: new Error('OAuth avatar is not an image') };
    }

    const extension = blob.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const fileName = `avatar_${user.id}_${Date.now()}.${extension}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: false,
        contentType: blob.type,
      });

    if (uploadError || !uploadData?.path) {
      return {
        avatarUrl: null,
        error: uploadError ?? new Error('OAuth avatar upload failed'),
      };
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(uploadData.path);
    if (!publicUrl) {
      return { avatarUrl: null, error: new Error('Failed to resolve avatar public URL') };
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      return { avatarUrl: null, error: updateError };
    }

    return { avatarUrl: publicUrl, error: null };
  } catch (err) {
    return {
      avatarUrl: null,
      error: err instanceof Error ? err : new Error('OAuth avatar import failed'),
    };
  }
}
