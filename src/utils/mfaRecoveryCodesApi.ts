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

async function readJsonPayload<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text.trim()) {
    return null;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function recoveryApiFailureMessage(
  response: Response,
  payload: { error?: string } | null,
  fallback: string,
): string {
  if (payload?.error) {
    return translateRecoveryApiError(payload.error, fallback);
  }
  if (response.status === 405) {
    return 'リカバリーコード API に接続できません。しばらく待ってから再試行してください。';
  }
  return fallback;
}

export async function generateMfaRecoveryCodes(): Promise<{ codes: string[]; error: string | null }> {
  const response = await authFetch('/api/account/mfa-recovery-codes/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  const payload = await readJsonPayload<{ codes?: string[]; error?: string }>(response);
  if (!response.ok) {
    return {
      codes: [],
      error: recoveryApiFailureMessage(
        response,
        payload,
        'リカバリーコードの発行に失敗しました',
      ),
    };
  }
  return { codes: payload?.codes ?? [], error: null };
}

export async function consumeMfaRecoveryCode(
  code: string,
): Promise<{ error: string | null }> {
  const response = await authFetch('/api/account/mfa-recovery-codes/consume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  const payload = await readJsonPayload<{ error?: string }>(response);
  if (!response.ok) {
    return {
      error: recoveryApiFailureMessage(
        response,
        payload,
        'リカバリーコードの確認に失敗しました',
      ),
    };
  }
  return { error: null };
}

export async function fetchMfaRecoveryCodeStatus(): Promise<{
  remaining: number;
  hasMfa: boolean;
  error: string | null;
}> {
  const response = await authFetch('/api/account/mfa-recovery-codes/status');
  const payload = await readJsonPayload<{
    remaining?: number;
    hasMfa?: boolean;
    error?: string;
  }>(response);
  if (!response.ok) {
    return {
      remaining: 0,
      hasMfa: false,
      error: recoveryApiFailureMessage(response, payload, '状態の取得に失敗しました'),
    };
  }
  return {
    remaining: payload?.remaining ?? 0,
    hasMfa: payload?.hasMfa ?? false,
    error: null,
  };
}

export async function clearMfaRecoveryCodes(): Promise<{ error: string | null }> {
  const response = await authFetch('/api/account/mfa-recovery-codes/clear', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  const payload = await readJsonPayload<{ error?: string }>(response);
  if (!response.ok) {
    return {
      error: recoveryApiFailureMessage(response, payload, 'リカバリーコードの削除に失敗しました'),
    };
  }
  return { error: null };
}
