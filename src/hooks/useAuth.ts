import { useAuthStore } from '../stores/authStore';
import { shallow } from 'zustand/shallow';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '../types';

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export interface UseAuthReturn extends AuthState, AuthActions {
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * 認証状態と関数を提供するカスタムフック
 * Zustandストアから認証関連の状態と関数を取得し、
 * コンポーネントで使いやすい形で提供します
 */
export const useAuth = (): UseAuthReturn => {
  const authState = useAuthStore(
    (state) => ({
      user: state.user,
      profile: state.profile,
      loading: state.loading,
      initialized: state.initialized,
      signIn: state.signIn,
      signUp: state.signUp,
      signOut: state.signOut,
      refreshSession: state.refreshSession,
    }),
    shallow
  );

  // 派生状態の計算
  const isAuthenticated = !!authState.user;
  const isLoading = authState.loading || !authState.initialized;

  return {
    ...authState,
    isAuthenticated,
    isLoading,
  };
};

/**
 * 認証が必要なページで使用するフック
 * 認証されていない場合の処理を自動化
 */
export const useRequireAuth = () => {
  const auth = useAuth();
  
  // 認証状態の初期化が完了していない場合はローディング状態
  if (!auth.initialized) {
    return { ...auth, requiresAuth: true };
  }
  
  // 認証されていない場合は認証が必要
  if (!auth.isAuthenticated) {
    return { ...auth, requiresAuth: true };
  }
  
  return { ...auth, requiresAuth: false };
}; 