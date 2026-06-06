import { useEffect } from 'react';
import { getAuthCallbackType } from '../../../auth/authRedirectUrl';
import supabase from '../../../utils/supabase';
import { useAuthStore } from '../../../stores/authStore';

interface UseAuthCallbackOptions {
  onError?: (message: string) => void;
  onSessionReady?: () => void;
}

function hasAuthCallbackParams(): boolean {
  if (typeof window === 'undefined') return false;
  const { hash, search } = window.location;
  if (hash.includes('access_token') || hash.includes('error=')) return true;
  const params = new URLSearchParams(search);
  return params.has('code') || params.has('error') || params.has('error_description');
}

function cleanAuthCallbackUrl(): void {
  const url = new URL(window.location.href);
  url.hash = '';
  ['code', 'error', 'error_description', 'state', 'mode'].forEach((key) => url.searchParams.delete(key));
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}`);
}

/** OAuth / Magic Link リダイレクト後のセッション確立 */
export function useAuthCallback({ onError, onSessionReady }: UseAuthCallbackOptions = {}): void {
  useEffect(() => {
    if (!hasAuthCallbackParams()) {
      return;
    }

    let cancelled = false;

    const completeCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const errorDescription = params.get('error_description') ?? params.get('error');
      if (errorDescription) {
        onError?.(decodeURIComponent(errorDescription.replace(/\+/g, ' ')));
        cleanAuthCallbackUrl();
        return;
      }

      const isPasswordRecovery = getAuthCallbackType() === 'recovery';
      const store = useAuthStore.getState();
      if (isPasswordRecovery) {
        store.setPasswordRecoveryPending(true);
      }

      const { data, error } = await supabase.auth.getSession();
      if (cancelled) return;

      if (error) {
        onError?.(error.message);
        cleanAuthCallbackUrl();
        return;
      }

      const session = data.session;
      const user = session?.user ?? null;

      store.setSession(session);
      store.setUser(user);

      if (user && !isPasswordRecovery) {
        await store.ensureProfileAfterOAuth(user);
        onSessionReady?.();
      } else if (user && isPasswordRecovery) {
        await store.fetchProfile(user.id);
      }

      cleanAuthCallbackUrl();
    };

    void completeCallback();

    return () => {
      cancelled = true;
    };
  }, [onError, onSessionReady]);
}
