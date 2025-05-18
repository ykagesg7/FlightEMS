import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import supabase, { getProfileWithRetry } from '../utils/supabase';

interface UserProfile {
  id: string;
  username: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  email?: string | null;
  roll?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  website?: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any | null, user: User | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any | null }>;
}

// デフォルト値を提供してundefinedにならないようにする
const defaultAuthContext: AuthContextType = {
  user: null,
  profile: null,
  session: null,
  loading: false,
  signIn: async () => ({ error: new Error('Not implemented') }),
  signUp: async () => ({ error: new Error('Not implemented'), user: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: new Error('Not implemented') }),
  updateProfile: async () => ({ error: new Error('Not implemented') }),
};

// コンテキストをneverにならないよう明示的に型付け
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// useAuthをコンポーネント外に定義
export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // 認証初期化が一度だけ実行されるようにする
    if (authInitialized) return;

    // セッションの変更を監視
    let subscription: { unsubscribe: () => void } | null = null;
    
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          setSession(session);
          setUser(session?.user || null);
          setLoading(true);

          if (session?.user) {
            try {
              getProfileWithRetry(session.user.id)
                .then(({ data, error, warning }) => {
                  if (error) {
                    console.error('プロファイル取得エラー:', error);
                  } else {
                    if (warning) {
                      console.warn('プロファイル取得警告:', warning);
                    }
                    console.log('認証イベントでプロファイル取得成功:', data);
                    setProfile(data);
                  }
                })
                .catch(err => {
                  console.error('プロファイル取得中に例外が発生:', err);
                });
            } catch (err) {
              console.error('プロファイル取得中に例外が発生:', err);
            }
          } else {
            setProfile(null);
          }

          setLoading(false);
        }
      );
      
      subscription = data.subscription;
    } catch (err) {
      console.error('認証状態監視設定エラー:', err);
      setLoading(false);
    }

    // 初回マウント時にユーザー情報の取得
    const initializeUser = async () => {
      setLoading(true);
      
      try {
        // タイムアウト処理を追加（10秒に延長）
        const timeoutPromise = new Promise<{ data: { session: Session | null } }>((_, reject) => {
          setTimeout(() => reject(new Error('認証初期化タイムアウト')), 10000);
        });
        
        const authPromise = supabase.auth.getSession();
        
        // Promise.raceでタイムアウト処理を実装
        const result = await Promise.race([authPromise, timeoutPromise])
          .catch(err => {
            console.error('認証初期化タイムアウトまたはエラー:', err);
            
            // リカバリー処理を追加（ページリロードなどを防ぐため）
            try {
              // ローカルストレージから直接セッション情報を確認
              const localSession = localStorage.getItem('supabase.auth.token');
              if (localSession) {
                console.log('ローカルストレージからセッション情報を回復を試みます');
                // セッション再構築のためのリフレッシュを試みる
                supabase.auth.refreshSession();
              }
            } catch (e) {
              console.log('セッション回復中のエラー:', e);
            }
            
            // タイムアウトまたはエラー発生時、セッションなしとして扱う
            return { data: { session: null } };
          });
        
        const session = result.data.session;
        console.log('初期セッション取得結果:', session ? '認証済み' : '未認証');
        
        // ローカルストレージの状態確認（デバッグ用）
        try {
          const localSession = localStorage.getItem('supabase.auth.token');
          console.log('ローカルストレージのセッション状態:', localSession ? '存在します' : '存在しません');
        } catch (e) {
          console.log('ローカルストレージへのアクセスエラー:', e);
        }
        
        if (session) {
          setSession(session);
          setUser(session.user);
          
          // プロファイル取得を拡張関数で実行
          getProfileWithRetry(session.user.id)
            .then(({ data, error, warning }) => {
              if (error) {
                console.error('初期化時のプロファイル取得エラー:', error);
              } else {
                if (warning) {
                  console.warn('初期化時のプロファイル取得警告:', warning);
                }
                console.log('初期化時にプロファイル取得成功:', data);
                setProfile(data);
              }
            })
            .catch(err => {
              console.error('初期化時のプロファイル取得中の例外:', err);
            });
        } else {
          // セッションが存在しない場合、明示的に状態をリセット
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('認証初期化エラー:', err);
        // エラーが発生した場合、明示的に状態をリセット
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        // 必ずローディング状態を解除
        setLoading(false);
        setAuthInitialized(true);
      }
    };

    // 300ミリ秒後にローディング状態を解除する予防的タイマー（万が一の無限ローディング防止）
    const loadingTimer = setTimeout(() => {
      if (loading) {
        console.log('予防的タイマーによりローディング状態を解除します');
        setLoading(false);
        setAuthInitialized(true);
      }
    }, 8000);

    initializeUser();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      clearTimeout(loadingTimer);
    };
  }, [authInitialized, loading]);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await supabase.auth.signInWithPassword({ email, password });
      
      // 認証成功時にユーザー状態を更新
      if (!response.error && response.data.session) {
        setSession(response.data.session);
        setUser(response.data.user);
        
        try {
          // ユーザープロファイルも取得
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', response.data.user.id)
            .single();

          if (error) {
            console.error('ログイン後のプロファイル取得エラー:', error);
          } else {
            setProfile(data);
          }
        } catch (profileErr) {
          console.error('ログイン後のプロファイル取得例外:', profileErr);
        }
      }
      
      return { error: response.error };
    } catch (err) {
      console.error('ログインエラー:', err);
      return { error: err instanceof Error ? err : new Error('ログイン処理中に不明なエラーが発生しました') };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            username: username
          }
        }
      });

      if (!error && data.user) {
        // プロフィールの作成
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: data.user.id,
                username,
                email,
                roll: 'Student', // デフォルトは学生
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ]);

          if (profileError) {
            console.error('プロファイル作成エラー:', profileError);
            return { error: profileError, user: null };
          }
        } catch (profileErr) {
          console.error('プロファイル作成中の例外:', profileErr);
          return { error: profileErr instanceof Error ? profileErr : new Error('プロファイル作成中に不明なエラーが発生しました'), user: null };
        }
      }

      return { error, user: data?.user || null };
    } catch (err) {
      console.error('登録エラー:', err);
      return { error: err instanceof Error ? err : new Error('登録処理中に不明なエラーが発生しました'), user: null };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // ログアウト後に状態を明示的にリセット
      setSession(null);
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('ログアウトエラー:', err);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      return { error };
    } catch (err) {
      console.error('パスワードリセットエラー:', err);
      return { error: err instanceof Error ? err : new Error('パスワードリセット処理中に不明なエラーが発生しました') };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error('ユーザーがログインしていません') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (!error) {
        setProfile(prev => prev ? { ...prev, ...updates } : null);
      }

      return { error };
    } catch (err) {
      console.error('プロファイル更新エラー:', err);
      return { error: err instanceof Error ? err : new Error('プロファイル更新中に不明なエラーが発生しました') };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 