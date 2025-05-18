import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// Supabaseの設定
export const supabaseUrl = 'https://fstynltdfdetpyvbrswr.supabase.co';
export const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdHlubHRkZmRldHB5dmJyc3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1MzI1ODcsImV4cCI6MjAzOTEwODU4N30.vzbj7_IjPZPBhJPUHvYLTONpOySASM8npaZIvwUXVG8';

// 環境設定
const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

// シングルトンパターンによるクライアント管理
let browserSupabaseClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

// ブラウザ環境用のSupabaseクライアント（@supabase/ssrパッケージ使用）
export const createBrowserSupabaseClient = () => {
  if (!browserSupabaseClient) {
    browserSupabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }
  return browserSupabaseClient;
};

// サーバーサイド用のSupabaseクライアント
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

// ブラウザ用のデフォルトクライアント
const supabase = createBrowserSupabaseClient();

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
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
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
  
  console.log('プロフィール取得開始 (拡張関数):', { userId });
  
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
          console.log('プロフィール取得リトライ前にセッションをリフレッシュします');
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
          console.log('認証情報からユーザーデータを取得を試みます');
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
    console.log('Supabase認証状態をリフレッシュ中...');
    await supabase.auth.refreshSession();
    const { data } = await supabase.auth.getSession();
    console.log('認証状態リフレッシュ完了:', data.session ? '認証済み' : '未認証');
    return { success: true, session: data.session };
  } catch (err) {
    console.error('認証状態リフレッシュエラー:', err);
    return { success: false, error: err };
  }
};

export default supabase; 