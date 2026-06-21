import supabase from './supabase';

async function getAccessToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

function translateRecoveryApiError(error: string | undefined, fallback: string): string {
  if (error === 'MFA verification required') {
    return 'セッションの二要素認証が未完了です。6桁コードを入力してからもう一度お試しください。';
  }
  return error || fallback;
}

async function authFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('セッションが無効です。再ログインしてください');
  }
  return fetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
}

export async function generateMfaRecoveryCodes(): Promise<{ codes: string[]; error: string | null }> {
  const response = await authFetch('/api/account/mfa-recovery-codes/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const payload = (await response.json()) as { codes?: string[]; error?: string };
  if (!response.ok) {
    return {
      codes: [],
      error: translateRecoveryApiError(payload.error, 'リカバリーコードの発行に失敗しました'),
    };
  }
  return { codes: payload.codes ?? [], error: null };
}

export async function consumeMfaRecoveryCode(
  code: string,
): Promise<{ error: string | null }> {
  const response = await authFetch('/api/account/mfa-recovery-codes/consume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  const payload = (await response.json()) as { error?: string };
  if (!response.ok) {
    return { error: payload.error || 'リカバリーコードの確認に失敗しました' };
  }
  return { error: null };
}

export async function fetchMfaRecoveryCodeStatus(): Promise<{
  remaining: number;
  hasMfa: boolean;
  error: string | null;
}> {
  const response = await authFetch('/api/account/mfa-recovery-codes/status');
  const payload = (await response.json()) as {
    remaining?: number;
    hasMfa?: boolean;
    error?: string;
  };
  if (!response.ok) {
    return { remaining: 0, hasMfa: false, error: payload.error || '状態の取得に失敗しました' };
  }
  return {
    remaining: payload.remaining ?? 0,
    hasMfa: payload.hasMfa ?? false,
    error: null,
  };
}

export async function clearMfaRecoveryCodes(): Promise<{ error: string | null }> {
  const response = await authFetch('/api/account/mfa-recovery-codes/clear', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const payload = (await response.json()) as { error?: string };
  if (!response.ok) {
    return { error: payload.error || 'リカバリーコードの削除に失敗しました' };
  }
  return { error: null };
}
