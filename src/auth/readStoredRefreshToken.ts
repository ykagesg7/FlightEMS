import { AUTH_STORAGE_KEY } from './clearLocalAuthSession';

type StoredSessionShape = {
  refresh_token?: string | null;
};

type StoredPayload = StoredSessionShape & {
  currentSession?: StoredSessionShape | null;
};

/** localStorage 上の GoTrue セッションから refresh_token を読む。 */
export function readStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as StoredPayload;
    const token =
      parsed.refresh_token ?? parsed.currentSession?.refresh_token ?? null;
    return typeof token === 'string' && token.length > 0 ? token : null;
  } catch {
    return null;
  }
}

export function purgeInvalidAuthStorage(): void {
  if (typeof window === 'undefined') {
    return;
  }
  if (!readStoredRefreshToken()) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}
