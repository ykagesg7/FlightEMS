import supabase from '../utils/supabase';
import { useAuthStore } from '../stores/authStore';
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
      return;
    }

    if (event === 'PASSWORD_RECOVERY') {
      markPasswordRecoveryPending();
    }

    if (event === 'SIGNED_IN' && isPasswordRecoveryActive()) {
      markPasswordRecoveryPending();
    }

    if (session?.user) {
      if (isPasswordRecoveryActive()) {
        void store.fetchProfile(session.user.id);
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        void store.ensureProfileAfterOAuth(session.user);
      } else {
        void store.fetchProfile(session.user.id);
      }
    }
  });
}
