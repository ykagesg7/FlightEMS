import type { User } from '@supabase/supabase-js';
import { useMemo } from 'react';
import { useAuthStore, type Profile } from '../stores/authStore';

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error: import('@supabase/supabase-js').AuthError | Error | null }>;
  signUp: (email: string, password: string, username: string, captchaToken?: string) => Promise<{ error: import('@supabase/supabase-js').AuthError | Error | null; user: User | null; emailConfirmRequired: boolean }>;
  signInWithGoogle: () => Promise<{ error: import('@supabase/supabase-js').AuthError | Error | null }>;
  signInWithOtp: (email: string, captchaToken?: string) => Promise<{ error: import('@supabase/supabase-js').AuthError | Error | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export interface UseAuthReturn extends AuthState, AuthActions {
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.profile);
  const loading = useAuthStore(state => state.loading);
  const initialized = useAuthStore(state => state.initialized);
  const signIn = useAuthStore(state => state.signIn);
  const signUp = useAuthStore(state => state.signUp);
  const signInWithGoogle = useAuthStore(state => state.signInWithGoogle);
  const signInWithOtp = useAuthStore(state => state.signInWithOtp);
  const signOut = useAuthStore(state => state.signOut);
  const refreshSession = useAuthStore(state => state.refreshSession);

  const isAuthenticated = !!user;
  const isLoading = loading || !initialized;

  return useMemo(() => ({
    user,
    profile,
    loading,
    initialized,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithOtp,
    signOut,
    refreshSession,
    isAuthenticated,
    isLoading,
  }), [
    user, profile, loading, initialized, signIn, signUp, signInWithGoogle, signInWithOtp, signOut, refreshSession, isAuthenticated, isLoading
  ]);
};
