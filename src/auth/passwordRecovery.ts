import { getAuthCallbackType } from './authRedirectUrl';
import { useAuthStore } from '../stores/authStore';

export const PASSWORD_RECOVERY_STORAGE_KEY = 'flightacademy.auth.recovery-pending';

/** リセットリンクの有効期限に合わせてフラグ自体も失効させる（取り残されたフラグが通常ログインを塞ぐのを防ぐ） */
export const PASSWORD_RECOVERY_TTL_MS = 15 * 60 * 1000;

function readIssuedAt(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(PASSWORD_RECOVERY_STORAGE_KEY);
    if (!raw) return null;
    const issuedAt = Number(raw);
    return Number.isFinite(issuedAt) && issuedAt > 0 ? issuedAt : null;
  } catch {
    return null;
  }
}

function syncStoreFlag(pending: boolean): void {
  useAuthStore.getState()?.setPasswordRecoveryPending(pending);
}

/** sessionStorage 上のリカバリー中フラグ（URL クリーンアップ後も維持。TTL 超過分はここで破棄） */
export function isPasswordRecoveryStored(): boolean {
  const issuedAt = readIssuedAt();
  if (issuedAt === null) {
    return false;
  }
  if (Date.now() - issuedAt > PASSWORD_RECOVERY_TTL_MS) {
    clearPasswordRecoveryPending();
    return false;
  }
  return true;
}

export function markPasswordRecoveryPending(): void {
  syncStoreFlag(true);
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(PASSWORD_RECOVERY_STORAGE_KEY, String(Date.now()));
    } catch {
      // sessionStorage unavailable
    }
  }
}

export function clearPasswordRecoveryPending(): void {
  syncStoreFlag(false);
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
  // sessionStorage を先に見る（期限切れならここでストアも落ちる）
  if (isPasswordRecoveryStored()) {
    return true;
  }
  return useAuthStore.getState()?.passwordRecoveryPending ?? false;
}

function isRecoveryPathname(pathname: string): boolean {
  return pathname === '/auth/recovery' || pathname.endsWith('/auth/recovery');
}

/**
 * アプリ起動直後（React 描画前）に URL からリカバリー状態を確定する。
 * `type=recovery` / `/auth/recovery` / `mode=recovery` のみを根拠にする。
 * ハッシュに `access_token` があるだけでは判定しない（Magic Link や Google OAuth も
 * implicit flow では同じ形で戻るため、通常ログインを誤ってリセット扱いにしてしまう）。
 */
export function primePasswordRecoveryFromUrl(): boolean {
  if (typeof window === 'undefined') return false;

  const { pathname, search } = window.location;
  const isRecovery =
    getAuthCallbackType() === 'recovery'
    || isRecoveryPathname(pathname)
    || new URLSearchParams(search).get('mode') === 'recovery';

  if (isRecovery) {
    markPasswordRecoveryPending();
    return true;
  }

  // 同一タブのリロード時は保存済みフラグを引き継ぐ（TTL は延長しない）
  if (isPasswordRecoveryStored()) {
    syncStoreFlag(true);
    return true;
  }

  return false;
}
