import { createHash, randomBytes } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

export const MFA_RECOVERY_CODE_COUNT = 10;

export function generatePlainRecoveryCodes(count = MFA_RECOVERY_CODE_COUNT): string[] {
  return Array.from({ length: count }, () => {
    const raw = randomBytes(4).toString('hex').toUpperCase();
    return `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
  });
}

export function normalizeRecoveryCode(input: string): string {
  return input.replace(/[\s-]/g, '').toUpperCase();
}

export function hashRecoveryCode(normalized: string): string {
  const pepper =
    process.env.MFA_RECOVERY_CODE_PEPPER?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    '';
  if (!pepper) {
    throw new Error('MFA recovery code pepper missing');
  }
  return createHash('sha256').update(`${pepper}:${normalized}`).digest('hex');
}

export async function deleteAllRecoveryCodesForUser(
  service: SupabaseClient,
  userId: string,
): Promise<void> {
  const { error } = await service.from('mfa_recovery_codes').delete().eq('user_id', userId);
  if (error) {
    throw new Error(error.message);
  }
}

export async function storeRecoveryCodesForUser(
  service: SupabaseClient,
  userId: string,
  plainCodes: string[],
): Promise<void> {
  await deleteAllRecoveryCodesForUser(service, userId);
  const rows = plainCodes.map((code) => ({
    user_id: userId,
    code_hash: hashRecoveryCode(normalizeRecoveryCode(code)),
  }));
  const { error } = await service.from('mfa_recovery_codes').insert(rows);
  if (error) {
    throw new Error(error.message);
  }
}

export async function countUnusedRecoveryCodes(
  service: SupabaseClient,
  userId: string,
): Promise<number> {
  const { count, error } = await service
    .from('mfa_recovery_codes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('used_at', null);
  if (error) {
    throw new Error(error.message);
  }
  return count ?? 0;
}

export async function consumeRecoveryCode(
  service: SupabaseClient,
  userId: string,
  rawCode: string,
): Promise<{ ok: true } | { ok: false; reason: 'invalid' | 'none_left' }> {
  const normalized = normalizeRecoveryCode(rawCode);
  if (normalized.length < 8) {
    return { ok: false, reason: 'invalid' };
  }

  const targetHash = hashRecoveryCode(normalized);
  const { data, error } = await service
    .from('mfa_recovery_codes')
    .select('id')
    .eq('user_id', userId)
    .eq('code_hash', targetHash)
    .is('used_at', null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    const remaining = await countUnusedRecoveryCodes(service, userId);
    return { ok: false, reason: remaining === 0 ? 'none_left' : 'invalid' };
  }

  const { error: updateError } = await service
    .from('mfa_recovery_codes')
    .update({ used_at: new Date().toISOString() })
    .eq('id', data.id);
  if (updateError) {
    throw new Error(updateError.message);
  }

  return { ok: true };
}

export async function userHasVerifiedTotpFactor(
  service: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await service.auth.admin.mfa.listFactors({ userId });
  if (error) {
    throw new Error(error.message);
  }
  const factors = data?.factors ?? [];
  return factors.some((factor) => factor.factor_type === 'totp' && factor.status === 'verified');
}

export async function removeAllVerifiedMfaFactors(
  service: SupabaseClient,
  userId: string,
): Promise<void> {
  const { data, error } = await service.auth.admin.mfa.listFactors({ userId });
  if (error) {
    throw new Error(error.message);
  }
  const factors = (data?.factors ?? []).filter(
    (factor) => factor.factor_type === 'totp' && factor.status === 'verified',
  );

  for (const factor of factors) {
    const { error: deleteError } = await service.auth.admin.mfa.deleteFactor({
      id: factor.id,
      userId,
    });
    if (deleteError) {
      throw new Error(deleteError.message);
    }
  }
}
