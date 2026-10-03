import { supabase } from '../../../utils/supabase';
import type { UserSavedWaypoint, UserSavedWaypointInput } from './types';

const TABLE = 'user_saved_waypoints';

export function isGracefulSupabaseError(error: { code?: string; message?: string }): boolean {
  const code = error.code ?? '';
  const msg = (error.message ?? '').toLowerCase();
  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    msg.includes('does not exist') ||
    msg.includes('could not find the table')
  );
}

export async function listUserSavedWaypoints(userId: string): Promise<UserSavedWaypoint[]> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (error) {
      if (isGracefulSupabaseError(error)) return [];
      console.warn('[user_saved_waypoints] list failed', error.message);
      return [];
    }
    return (data ?? []) as UserSavedWaypoint[];
  } catch (e) {
    console.warn('[user_saved_waypoints] list exception', e);
    return [];
  }
}

export async function createUserSavedWaypoint(
  userId: string,
  input: UserSavedWaypointInput,
): Promise<{ row: UserSavedWaypoint | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        user_id: userId,
        name: input.name.trim(),
        ident: input.ident?.trim() || null,
        memo: input.memo?.trim() || null,
        latitude: input.latitude,
        longitude: input.longitude,
      })
      .select('*')
      .single();
    if (error) {
      if (isGracefulSupabaseError(error)) {
        return { row: null, error: 'マイポイント機能は準備中です（DB マイグレーション未適用）' };
      }
      return { row: null, error: error.message };
    }
    return { row: data as UserSavedWaypoint, error: null };
  } catch (e) {
    return { row: null, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function updateUserSavedWaypoint(
  userId: string,
  id: string,
  patch: Partial<UserSavedWaypointInput>,
): Promise<{ ok: boolean; error: string | null }> {
  try {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (patch.name !== undefined) payload.name = patch.name.trim();
    if (patch.ident !== undefined) payload.ident = patch.ident?.trim() || null;
    if (patch.memo !== undefined) payload.memo = patch.memo?.trim() || null;
    if (patch.latitude !== undefined) payload.latitude = patch.latitude;
    if (patch.longitude !== undefined) payload.longitude = patch.longitude;

    const { error } = await supabase.from(TABLE).update(payload).eq('id', id).eq('user_id', userId);
    if (error) {
      if (isGracefulSupabaseError(error)) {
        return { ok: false, error: 'マイポイント機能は準備中です' };
      }
      return { ok: false, error: error.message };
    }
    return { ok: true, error: null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function deleteUserSavedWaypoint(
  userId: string,
  id: string,
): Promise<{ ok: boolean; error: string | null }> {
  try {
    const { error } = await supabase.from(TABLE).delete().eq('id', id).eq('user_id', userId);
    if (error) {
      if (isGracefulSupabaseError(error)) {
        return { ok: false, error: 'マイポイント機能は準備中です' };
      }
      return { ok: false, error: error.message };
    }
    return { ok: true, error: null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
