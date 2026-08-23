import supabase from '../utils/supabase';
import { useAuthStore } from '../stores/authStore';
import { clearLoginMfaCache } from './mfaAuth';
import {
  clearPasswordRecoveryPending,
  isPasswordRecoveryActive,
  markPasswordRecoveryPending,
} from './passwordRecovery';

let listenerRegistered = false;

/** Supabase Auth イベントを Zustand と同期（タブ間・トークン更新） */
export function initAuthListener(): void {
  if (listenerRegistered || typeof window === 'undefined') {
    return;
  }
  listenerRegistered = true;

  supabase.auth.onAuthStateChange((event, session) => {
    const store = useAuthStore.getState();
    store.setSession(session);
    store.setUser(session?.user ?? null);

    if (event === 'SIGNED_OUT') {
      store.setProfile(null);
      clearPasswordRecoveryPending();
      clearLoginMfaCache();
      return;
    }

    if (event === 'PASSWORD_RECOVERY') {
      markPasswordRecoveryPending();
    }

    const user = session?.user;
    if (!user) {
      return;
    }

    if (isPasswordRecoveryActive()) {
      void store.fetchProfile(user.id);
      return;
    }

    if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
      clearLoginMfaCache();
      void store.ensureProfileAfterOAuth(user);
      return;
    }

    // INITIAL_SESSION / TOKEN_REFRESHED: 同じユーザーのプロフィールを持っていれば取り直さない
    if (store.profile?.id !== user.id) {
      void store.fetchProfile(user.id);
    }
  });
}
