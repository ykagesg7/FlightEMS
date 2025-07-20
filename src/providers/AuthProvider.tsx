import type { Session } from '@supabase/supabase-js';
import React, { ReactNode, useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import supabase from '../utils/supabase';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authInitialized, setAuthInitialized] = useState(false);
  const setUser = useAuthStore(state => state.setUser);
  const setSession = useAuthStore(state => state.setSession);
  const fetchProfile = useAuthStore(state => state.fetchProfile);
  const setLoading = useAuthStore(state => state.setLoading);

  // 初期化と認証状態の監視
  useEffect(() => {
    // 既に初期化済みの場合は処理をスキップ
    if (authInitialized) return;

    let authListener: { subscription: { unsubscribe: () => void } } | null = null;

    // 現在のセッションを取得
    const initializeAuth = async () => {
      try {
        setLoading(true);

        // タイムアウト処理
        const timeoutPromise = new Promise<{ data: { session: Session | null } }>((_, reject) => {
          setTimeout(() => reject(new Error('認証初期化タイムアウト')), 10000);
        });

        const authPromise = supabase.auth.getSession();

        // Promise.raceでタイムアウト処理を実装
        const result = await Promise.race([authPromise, timeoutPromise])
          .catch(err => {
            console.error('認証初期化タイムアウトまたはエラー:', err);
            return { data: { session: null } };
          });

        const session = result.data.session;

        if (session) {
          setSession(session);
          setUser(session.user);

          // ユーザーIDが存在する場合はプロフィールを取得
          if (session.user?.id) {
            fetchProfile(session.user.id);
          }
        } else {
          setSession(null);
          setUser(null);
        }

        // 認証状態の変化を購読
        authListener = supabase.auth.onAuthStateChange(
          async (event, session) => {
            setSession(session);
            setUser(session?.user || null);

            if (session?.user?.id) {
              fetchProfile(session.user.id);
            }
          }
        ).data;

        setAuthInitialized(true);
      } catch (err) {
        console.error('認証初期化エラー:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // クリーンアップ
    return () => {
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [authInitialized, setUser, setSession, fetchProfile, setLoading]);

  return <>{children}</>;
};
