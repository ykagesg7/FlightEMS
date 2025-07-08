import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// Supabaseの設定（環境変数から取得）
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 環境変数の検証
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase環境変数が設定されていません。VITE_SUPABASE_URLとVITE_SUPABASE_ANON_KEYを設定してください。');
}

// 環境設定
const isDevelopment = import.meta.env.MODE === 'development';

// シングルトンパターンによるクライアント管理
let browserSupabaseClient: ReturnType<typeof createBrowserClient<Database>> | undefined;
let adminSupabaseClient: ReturnType<typeof createClient<Database>> | undefined;

// ログ制御フラグ
let browserClientLogged = false;
let adminClientLogged = false;

// ブラウザ環境用のSupabaseクライアント（@supabase/ssrパッケージ使用）
export const createBrowserSupabaseClient = () => {
  if (!browserSupabaseClient) {
    if (isDevelopment && !browserClientLogged) {
      console.log('新しいSupabaseブラウザクライアントを作成します');
      browserClientLogged = true;
    }
    browserSupabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'flightacademy.auth.token', // プロジェクト固有のストレージキー
        storage: {
          getItem: (key: string) => localStorage.getItem(key),
          setItem: (key: string, value: string) => localStorage.setItem(key, value),
          removeItem: (key: string) => localStorage.removeItem(key),
        },
      },
    });
  }
  return browserSupabaseClient;
};

// サーバーサイド用のSupabaseクライアント（シングルトン）
export const getSupabaseAdmin = () => {
  if (!adminSupabaseClient) {
    if (isDevelopment && !adminClientLogged) {
      console.log('新しいSupabase管理者クライアントを作成します');
      adminClientLogged = true;
    }
    adminSupabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });
  }
  return adminSupabaseClient;
};

// ブラウザ用のデフォルトクライアント
const supabase = createBrowserSupabaseClient();

// 名前付きエクスポートとしても提供（互換性のため）
export { supabase };

// 開発環境用の認証検証バイパス
// 注意: 本番環境では使用しないでください！
export const bypassEmailVerification = async (email: string) => {
  if (!isDevelopment) {
    console.warn('この関数は開発環境専用です。本番環境では使用しないでください。');
    return { success: false, error: new Error('本番環境では使用できません') };
  }

  try {
    console.log('開発環境: メール検証をバイパスします', { email });

    // メール検証リンク取得 (開発環境のみ)
    const { data, error } = await getSupabaseAdmin().auth.admin.generateLink({
      type: 'magiclink',
      email: email,
    });

    if (error) {
      console.error('メール検証リンク生成エラー:', error);
      return { success: false, error };
    }

    // 開発環境では、生成されたリンクをコンソールに表示
    if (data && data.properties && data.properties.action_link) {
      return {
        success: true,
        verificationLink: data.properties.action_link,
        message: '開発環境用のメール検証リンクがコンソールに表示されました'
      };
    }

    return {
      success: false,
      error: new Error('検証リンクの生成に失敗しました')
    };
  } catch (err) {
    console.error('メール検証バイパスエラー:', err);
    return {
      success: false,
      error: err instanceof Error ? err : new Error('不明なエラー')
    };
  }
};

// プロフィール取得のヘルパー関数（エラーハンドリング強化版）
export const getProfileWithRetry = async (userId: string) => {
  if (!userId) {
    console.error('プロフィール取得失敗: ユーザーIDが指定されていません');
    return { error: new Error('ユーザーIDが必要です'), data: null };
  }

  if (isDevelopment) {
    console.log('プロフィール取得開始 (拡張関数):', { userId });
  }

  // 認証状態の確認
  const { data: authData } = await supabase.auth.getSession();

  if (!authData.session) {
    console.error('プロフィール取得失敗: 有効な認証セッションがありません');
    // 認証セッションをリフレッシュ
    await refreshAuthState();
  }

  try {
    const maxRetries = 3; // リトライ回数を増やす
    let retryCount = 0;

    while (retryCount <= maxRetries) {
      if (retryCount > 0) {
        // リトライごとの待機時間を増加
        await new Promise(resolve => setTimeout(resolve, 500 * retryCount));

        // セッションをリフレッシュしてから再試行
        if (retryCount === 1) {
          if (isDevelopment) {
            console.log('プロフィール取得リトライ前にセッションをリフレッシュします');
          }
          await refreshAuthState();
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error) {
        return { data, error: null };
      }

      console.error(`プロフィール取得エラー (拡張関数) ${retryCount + 1}/${maxRetries + 1}:`, error);

      retryCount++;

      // 最後のリトライで、フォールバックプロフィールを作成
      if (retryCount > maxRetries) {
        // 認証情報から情報取得を試みる
        try {
          if (isDevelopment) {
            console.log('認証情報からユーザーデータを取得を試みます');
          }
          const { data: userData } = await supabase.auth.getUser();

          if (userData?.user) {
            // フォールバックプロフィールの作成
            const defaultProfile = {
              id: userId,
              username: userData.user.email?.split('@')[0] || 'ユーザー',
              email: userData.user.email,
              roll: 'Student',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            console.log('フォールバックプロフィール作成を試みます:', defaultProfile);

            // プロフィール作成を試みる
            const { data: insertData, error: insertError } = await supabase
              .from('profiles')
              .upsert([defaultProfile], { onConflict: 'id' })
              .select();

            if (!insertError && insertData?.length > 0) {
              return { data: insertData[0], error: null };
            } else {
              return {
                data: defaultProfile,
                error: null,
                warning: 'データベースへの保存に失敗しましたが、一時的なプロフィールを使用します'
              };
            }
          }
        } catch (authErr) {
          console.error('認証情報取得失敗:', authErr);
        }
      }
    }

    // 全てのリトライが失敗した場合
    return {
      data: null,
      error: new Error('すべてのプロフィール取得試行が失敗しました')
    };
  } catch (err) {
    console.error('プロフィール取得中の例外:', err);
    return { data: null, error: err instanceof Error ? err : new Error('不明なエラー') };
  }
};

// 認証状態をクリアして再初期化するためのヘルパー関数
export const refreshAuthState = async () => {
  try {
    if (isDevelopment) {
      console.log('Supabase認証状態をリフレッシュ中...');
    }
    await supabase.auth.refreshSession();
    const { data } = await supabase.auth.getSession();
    if (isDevelopment) {
      console.log('認証状態リフレッシュ完了:', data.session ? '認証済み' : '未認証');
    }
    return { success: true, session: data.session };
  } catch (err) {
    console.error('認証状態リフレッシュエラー:', err);
    return { success: false, error: err };
  }
};

// アバター画像アップロード関数
export const uploadAvatarImage = async (file: File, userId: string): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    // ファイル形式チェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: '対応していないファイル形式です。JPEG、PNG、GIF、WebPのみ対応しています。'
      };
    }

    // ファイルサイズチェック (5MB制限)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'ファイルサイズが大きすぎます。5MB以下にしてください。'
      };
    }

    // 既存のアバター削除
    const { data: existingFiles } = await supabase.storage
      .from('avatars')
      .list(userId);

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(file => `${userId}/${file.name}`);
      await supabase.storage
        .from('avatars')
        .remove(filesToDelete);
    }

    // 新しいファイル名を作成（タイムスタンプ付き）
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar_${Date.now()}.${fileExt}`;

    // ファイルアップロード
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return {
        success: false,
        error: `アップロードエラー: ${uploadError.message}`
      };
    }

    // パブリックURLを取得
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(uploadData.path);

    if (!urlData?.publicUrl) {
      return {
        success: false,
        error: 'アップロード後のURL取得に失敗しました。'
      };
    }

    return {
      success: true,
      url: urlData.publicUrl
    };

  } catch (error) {
    console.error('Avatar upload error:', error);
    return {
      success: false,
      error: '予期しないエラーが発生しました。'
    };
  }
};

// プロフィール更新関数
export const updateUserProfile = async (userId: string, updates: {
  username?: string;
  full_name?: string;
  avatar_url?: string;
  website?: string;
}): Promise<{ success: boolean; error?: string; data?: any }> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: `プロフィール更新エラー: ${error.message}`
      };
    }

    return {
      success: true,
      data
    };

  } catch (error) {
    console.error('Profile update error:', error);
    return {
      success: false,
      error: '予期しないエラーが発生しました。'
    };
  }
};

// アバター削除関数
export const deleteAvatar = async (userId: string, avatarUrl?: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Storage上のファイル削除
    const { data: existingFiles } = await supabase.storage
      .from('avatars')
      .list(userId);

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(file => `${userId}/${file.name}`);
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove(filesToDelete);

      if (deleteError) {
        console.error('Delete error:', deleteError);
      }
    }

    // プロフィールのavatar_urlをクリア
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return {
        success: false,
        error: `プロフィール更新エラー: ${updateError.message}`
      };
    }

    return { success: true };

  } catch (error) {
    console.error('Avatar delete error:', error);
    return {
      success: false,
      error: '予期しないエラーが発生しました。'
    };
  }
};

export default supabase;
