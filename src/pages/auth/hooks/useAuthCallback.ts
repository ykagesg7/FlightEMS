import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getAuthCallbackType } from '../../../auth/authRedirectUrl';
import { markPasswordRecoveryPending } from '../../../auth/passwordRecovery';
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
  const hadHash = url.hash.length > 0;
  url.hash = '';
  ['code', 'error', 'error_description', 'state', 'mode'].forEach((key) => url.searchParams.delete(key));
  const next = `${url.pathname}${url.search}`;
  const current = `${window.location.pathname}${window.location.search}`;
  if (!hadHash && next === current) {
    return;
  }
  window.history.replaceState({}, document.title, next);
}

/** OAuth / Magic Link リダイレクト後のセッション確立 */
export function useAuthCallback({ onError, onSessionReady }: UseAuthCallbackOptions = {}): void {
  const location = useLocation();
  const onErrorRef = useRef(onError);
  const onSessionReadyRef = useRef(onSessionReady);
  const inFlightRef = useRef(false);

  onErrorRef.current = onError;
  onSessionReadyRef.current = onSessionReady;

  useEffect(() => {
    if (!hasAuthCallbackParams()) {
      inFlightRef.current = false;
      return;
    }
    if (inFlightRef.current) {
      return;
    }
    inFlightRef.current = true;

    let cancelled = false;

    const completeCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const errorDescription = params.get('error_description') ?? params.get('error');
        if (errorDescription) {
          onErrorRef.current?.(decodeURIComponent(errorDescription.replace(/\+/g, ' ')));
          cleanAuthCallbackUrl();
          return;
        }

        const isPasswordRecovery = getAuthCallbackType() === 'recovery';
        const store = useAuthStore.getState();
        if (isPasswordRecovery) {
          markPasswordRecoveryPending();
        }

        const { data, error } = await supabase.auth.getSession();
        if (cancelled) return;

        if (error) {
          onErrorRef.current?.(error.message);
          cleanAuthCallbackUrl();
          return;
        }

        const session = data.session;
        const user = session?.user ?? null;

        store.setSession(session);
        store.setUser(user);

        if (user && !isPasswordRecovery) {
          await store.ensureProfileAfterOAuth(user);
          await store.fetchProfile(user.id);
          onSessionReadyRef.current?.();
        } else if (user && isPasswordRecovery) {
          await store.fetchProfile(user.id);
        }

        cleanAuthCallbackUrl();
      } finally {
        if (!cancelled) {
          inFlightRef.current = false;
        }
      }
    };

    void completeCallback();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, location.search, location.hash]);
}
