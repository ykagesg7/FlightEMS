import { AuthError, Session, User } from '@supabase/supabase-js'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { Database } from '../types/database.types'
import supabase from '../utils/supabase'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type AuthErrorResult = AuthError | Error | null

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  initialized: boolean

  // アクション
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void

  // 認証アクション
  signIn: (email: string, password: string) => Promise<{ error: AuthErrorResult }>
  signUp: (email: string, password: string, username: string) => Promise<{ error: AuthErrorResult, user: User | null, emailConfirmRequired: boolean }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthErrorResult }>
  refreshSession: () => Promise<void>

  // プロフィールアクション
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: AuthErrorResult }>
  fetchProfile: (userId: string) => Promise<void>
  createProfile: (userId: string, username: string, email: string) => Promise<{ error: AuthErrorResult }>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      session: null,
      loading: false,
      initialized: true,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),

      signIn: async (email, password) => {
        try {
          set({ loading: true });

          const response = await supabase.auth.signInWithPassword({ email, password });

          if (!response.error && response.data.session) {
            set({
              session: response.data.session,
              user: response.data.user
            });

            // ユーザープロファイルを取得
            if (response.data.user) {
              get().fetchProfile(response.data.user.id);
            }
          }

          set({ loading: false });
          return { error: response.error };
        } catch (err) {
          set({ loading: false });
          return { error: err instanceof Error ? err : new Error('ログイン処理中に不明なエラーが発生しました') };
        }
      },

      signUp: async (email, password, username) => {
        try {
          set({ loading: true });

          // Supabaseでユーザー登録
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
          });

          if (authError) {
            set({ loading: false });
            return { error: authError, user: null, emailConfirmRequired: false };
          }

          // セッションとユーザー情報を保存
          set({
            session: authData.session,
            user: authData.user
          });

          // プロフィール作成（認証が完了している場合のみ）
          let profileError = null;
          if (authData.user && authData.session) {
            // 認証情報が揃っている場合、プロフィールを作成
            const result = await get().createProfile(authData.user.id, username, email);
            profileError = result.error;

            if (!profileError) {
              // プロフィール取得
              await get().fetchProfile(authData.user.id);
            }
          }

          set({ loading: false });

          // メール確認が必要かどうかを判断
          const emailConfirmRequired = !!(authData.user && !authData.session);

          return {
            error: profileError,
            user: authData.user,
            emailConfirmRequired
          };
        } catch (err) {
          set({ loading: false });
          return {
            error: err instanceof Error ? err : new Error('サインアップ処理中に不明なエラーが発生しました'),
            user: null,
            emailConfirmRequired: false
          };
        }
      },

      signOut: async () => {
        try {
          set({ loading: true });
          await supabase.auth.signOut();
          set({
            user: null,
            profile: null,
            session: null,
            loading: false
          });
        } catch (err) {
          set({ loading: false });
        }
      },

      resetPassword: async (email) => {
        try {
          set({ loading: true });
          const { error } = await supabase.auth.resetPasswordForEmail(email);
          set({ loading: false });
          return { error };
        } catch (err) {
          set({ loading: false });
          return { error: err instanceof Error ? err : new Error('パスワードリセット処理中に不明なエラーが発生しました') };
        }
      },

      refreshSession: async () => {
        try {
          set({ loading: true });
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            set({ loading: false });
            return;
          }
          set({ session: sessionData.session });
          set({ loading: false });
        } catch (err) {
          set({ loading: false });
          console.error('セッション更新処理中に不明なエラーが発生しました:', err);
        }
      },

      updateProfile: async (updates) => {
        try {
          const { user } = get();

          if (!user) {
            return { error: new Error('ユーザーが認証されていません') };
          }

          const { error } = await supabase
            .from('profiles')
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

          if (!error) {
            // 更新に成功したら、プロフィールを再取得
            await get().fetchProfile(user.id);
          }

          return { error };
        } catch (err) {
          return { error: err instanceof Error ? err : new Error('プロフィール更新処理中に不明なエラーが発生しました') };
        }
      },

      createProfile: async (userId, username, email) => {
        if (!userId) {
          return { error: new Error('ユーザーIDが指定されていません') };
        }

        try {
          // RLSエラー対策: 認証セッションが確立されているか確認
          const { data: sessionData } = await supabase.auth.getSession();
          if (!sessionData.session) {
            return { error: new Error('認証セッションが確立されていません') };
          }

          const { error } = await supabase
            .from('profiles')
            .insert([
              {
                id: userId,
                username,
                email,
                roll: 'Student',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ]);

          if (error) {
            return { error };
          }

          return { error: null };
        } catch (err) {
          return { error: err instanceof Error ? err : new Error('プロフィール作成中に不明なエラーが発生しました') };
        }
      },

      fetchProfile: async (userId) => {
        if (!userId) {
          return;
        }

        try {
          // プロフィール取得にリトライメカニズムを実装
          const maxRetries = 2;
          let retryCount = 0;

          while (retryCount <= maxRetries) {
            if (retryCount > 0) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }

            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();

            if (!error && data) {
              set({ profile: data });
              return;
            }

            console.error(`プロフィール取得エラー ${retryCount + 1}/${maxRetries + 1}:`, error);
            retryCount++;

            // 最後のリトライでフォールバックプロフィールを作成
            if (retryCount > maxRetries) {
              // 認証情報から最小限のプロフィールを作成
              const { data: userData } = await supabase.auth.getUser();

              if (userData?.user) {
                // デフォルトプロフィールを作成
                const defaultProfile: Profile = {
                  id: userId,
                  username: userData.user.email?.split('@')[0] || 'ユーザー',
                  email: userData.user.email || null,
                  roll: 'Student',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  full_name: null,
                  avatar_url: null,
                  website: null
                };

                console.log('フォールバックプロフィール作成を試みます:', defaultProfile);

                // プロフィール作成を試みる
                const { data: insertData, error: insertError } = await supabase
                  .from('profiles')
                  .insert([defaultProfile])
                  .select();

                if (!insertError && insertData?.length > 0) {
                  console.log('フォールバックプロフィール作成成功:', insertData[0]);
                  set({ profile: insertData[0] as Profile });
                } else {
                  console.error('フォールバックプロフィール作成失敗:', insertError);
                  // メモリ上のみのフォールバックプロフィールを設定
                  set({ profile: defaultProfile });
                }
              }
            }
          }
        } catch (err) {
          console.error('プロフィール取得中の例外:', err);
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        session: state.session
      }),
    }
  )
)
