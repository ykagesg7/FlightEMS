import type { AuthError } from '@supabase/supabase-js';
import type { Profile } from '../stores/authStore';
import supabase from '../utils/supabase';

export type VerifiedTotpFactor = {
  id: string;
  friendly_name?: string;
  factor_type: string;
  status: string;
};

export async function getVerifiedTotpFactors(): Promise<{
  factors: VerifiedTotpFactor[];
  error: AuthError | null;
}> {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) {
    return { factors: [], error };
  }

  const byId = new Map<string, VerifiedTotpFactor>();
  for (const factor of [...(data.all ?? []), ...(data.totp ?? [])]) {
    if (factor.factor_type === 'totp' && factor.status === 'verified') {
      byId.set(factor.id, factor);
    }
  }

  return { factors: [...byId.values()], error: null };
}

export function profileRequiresLoginMfa(profile: Profile | null): boolean {
  if (!profile) {
    return false;
  }
  return profile.mfa_required_at_login === true;
}

export async function shouldPromptLoginMfa(profile: Profile | null): Promise<{
  required: boolean;
  factorId: string | null;
  error: string | null;
}> {
  if (!profileRequiresLoginMfa(profile)) {
    return { required: false, factorId: null, error: null };
  }

  const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aalError) {
    return { required: false, factorId: null, error: aalError.message };
  }

  if (aalData.currentLevel === 'aal2' || aalData.nextLevel !== 'aal2') {
    return { required: false, factorId: null, error: null };
  }

  const { factors, error } = await getVerifiedTotpFactors();
  if (error) {
    return { required: false, factorId: null, error: error.message };
  }

  if (factors.length === 0) {
    return { required: false, factorId: null, error: null };
  }

  return { required: true, factorId: factors[0].id, error: null };
}

export async function verifyMfaFactorCode(factorId: string, code: string) {
  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
  if (challengeError) {
    return { error: challengeError };
  }

  return supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code: code.trim(),
  });
}

export async function verifyMfaForSensitiveAction(
  factorId: string,
  code: string,
): Promise<{ error: AuthError | null }> {
  const { error } = await verifyMfaFactorCode(factorId, code);
  if (error) {
    return { error };
  }

  const { error: refreshError } = await supabase.auth.refreshSession();
  if (refreshError) {
    return { error: refreshError };
  }

  const { data: aalData, error: aalError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aalError) {
    return { error: aalError };
  }
  if (aalData.currentLevel !== 'aal2') {
    return {
      error: {
        name: 'MfaVerificationIncomplete',
        message: '二要素認証の確認が完了していません。コードを確認してもう一度お試しください。',
      } as AuthError,
    };
  }

  return { error: null };
}

export async function unenrollVerifiedMfaFactor(factorId: string, code: string) {
  const { error: verifyError } = await verifyMfaFactorCode(factorId, code);
  if (verifyError) {
    return { error: verifyError };
  }

  const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId });
  if (unenrollError) {
    return { error: unenrollError };
  }

  await supabase.auth.refreshSession();
  return { error: null };
}

export async function userRequiresMfaForSensitiveAction(): Promise<{
  required: boolean;
  factorId: string | null;
}> {
  const { factors } = await getVerifiedTotpFactors();
  if (factors.length === 0) {
    return { required: false, factorId: null };
  }
  return { required: true, factorId: factors[0].id };
}
