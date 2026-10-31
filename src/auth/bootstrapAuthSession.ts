import { isAuthCallbackPending } from './authCallbackPending';
import { useAuthStore } from '../stores/authStore';
import { purgeInvalidAuthStorage } from './readStoredRefreshToken';

/** 起動時: 無効ストレージを除去してから refreshSession を1回だけ実行。 */
export async function bootstrapAuthSession(): Promise<void> {
  purgeInvalidAuthStorage();
  if (isAuthCallbackPending()) {
    // PKCE / implicit コールバック中に refreshSession すると refresh_token 未保存の瞬間に
    // signOut({ scope: 'local' }) が走り、OAuth 直後のセッションが消える。
    useAuthStore.getState().setInitialized(true);
    useAuthStore.getState().setLoading(false);
    return;
  }
  await useAuthStore.getState().refreshSession();
}
