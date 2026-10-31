import supabase from '../utils/supabase';
import { useAuthStore } from '../stores/authStore';

export const AUTH_STORAGE_KEY = 'flightacademy.auth.token';

/** ローカルの Supabase セッションと Zustand 認証状態をクリア（サーバー呼び出しなし）。 */
export async function clearLocalAuthSession(): Promise<void> {
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  const store = useAuthStore.getState();
  store.setSession(null);
  store.setUser(null);
  store.setProfile(null);
}
