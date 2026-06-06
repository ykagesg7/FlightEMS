import { getAuthCallbackType } from './authRedirectUrl';
import { useAuthStore } from '../stores/authStore';

export const PASSWORD_RECOVERY_STORAGE_KEY = 'flightacademy.auth.recovery-pending';

/** sessionStorage にリカバリー中フラグを保持（URL クリーンアップ後も維持） */
export function isPasswordRecoveryStored(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(PASSWORD_RECOVERY_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function markPasswordRecoveryPending(): void {
  useAuthStore.getState()?.setPasswordRecoveryPending(true);
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(PASSWORD_RECOVERY_STORAGE_KEY, '1');
    } catch {
      // sessionStorage unavailable
    }
  }
}

export function clearPasswordRecoveryPending(): void {
  useAuthStore.getState()?.setPasswordRecoveryPending(false);
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(PASSWORD_RECOVERY_STORAGE_KEY);
    } catch {
      // sessionStorage unavailable
    }
  }
}

/** ストアまたは sessionStorage 上でリカバリー UI を表示すべきか */
export function isPasswordRecoveryActive(): boolean {
  const state = useAuthStore.getState();
  return (state?.passwordRecoveryPending ?? false) || isPasswordRecoveryStored();
}

function isRecoveryPathname(pathname: string): boolean {
  return pathname === '/auth/recovery' || pathname.endsWith('/auth/recovery');
}

/** アプリ起動直後（React 描画前）に URL からリカバリー状態を確定する */
export function primePasswordRecoveryFromUrl(): boolean {
  if (typeof window === 'undefined') return false;

  const { pathname, hash, search } = window.location;
  const isRecovery =
    getAuthCallbackType() === 'recovery'
    || isRecoveryPathname(pathname)
    || new URLSearchParams(search).get('mode') === 'recovery';

  if (isRecovery) {
    markPasswordRecoveryPending();
    return true;
  }

  if (isPasswordRecoveryStored()) {
    markPasswordRecoveryPending();
    return true;
  }

  // ハッシュにトークンがあるが type 未確認の間はリダイレクトを抑止（コールバック処理待ち）
  if (hash.includes('access_token') && pathname !== '/auth/recovery') {
    markPasswordRecoveryPending();
    return true;
  }

  return false;
}
