# 認証関連のトラブルシューティング

このドキュメントでは、FlightAcademyTsxアプリケーションで発生する可能性のある認証関連の問題とその解決方法について説明します。

## 目次

1. [認証状態の不整合](#認証状態の不整合)
2. [Supabaseクライアントの重複インスタンス警告](#supabaseクライアントの重複インスタンス警告)
3. [いいね・コメント機能が動作しない](#いいねコメント機能が動作しない)
4. [プロフィール情報が取得できない](#プロフィール情報が取得できない)
5. [セッション管理の問題](#セッション管理の問題)

## 認証状態の不整合

### 症状
- ログインしているにも関わらず、一部のコンポーネントで「未ログイン」と表示される
- 認証状態が異なるコンポーネント間で同期されない

### 原因
- 複数の認証システム（AuthContextとAuthStore）が並行して動作している
- コンポーネントが異なる認証ソースを参照している

### 解決方法

1. **認証システムの統一**
   ```typescript
   // 古い方法（AuthContext）
   import { useAuth } from '../../contexts/AuthContext';
   const { user } = useAuth();

   // 新しい方法（AuthStore）
   import { useAuthStore } from '../../stores/authStore';
   const user = useAuthStore(state => state.user);
   ```

2. **全コンポーネントでAuthStoreを使用**
   - `LearningContentInteraction.tsx`
   - `AuthButton.tsx`
   - `ProfileMenu.tsx`
   - `useFreemiumAccess.ts`

## Supabaseクライアントの重複インスタンス警告

### 症状
```
Multiple GoTrueClient instances detected in the same browser context.
```

### 原因
- Supabaseクライアントが複数箇所で作成されている
- シングルトンパターンが適切に実装されていない

### 解決方法

1. **シングルトンパターンの実装**
   ```typescript
   // src/utils/supabase.ts
   let browserSupabaseClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

   export const createBrowserSupabaseClient = () => {
     if (!browserSupabaseClient) {
       browserSupabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseKey, {
         auth: {
           autoRefreshToken: true,
           persistSession: true,
           detectSessionInUrl: true,
           storageKey: 'supabase.auth.token', // 明示的にストレージキーを設定
         },
       });
     }
     return browserSupabaseClient;
   };
   ```

2. **統一されたクライアントの使用**
   ```typescript
   import supabase from '../utils/supabase';
   // 常に同じインスタンスを使用
   ```

## いいね・コメント機能が動作しない

### 症状
- いいねボタンが押せない
- コメント投稿ができない
- エラーメッセージが表示される

### 原因
1. 認証状態の問題
2. RLSポリシーの設定不備
3. データベーステーブルの権限問題

### 解決方法

1. **認証状態の確認**
   ```typescript
   // デバッグ用ログの追加
   console.log('User state:', { user: !!user, userId: user?.id });
   ```

2. **RLSポリシーの確認**
   ```sql
   -- learning_content_likes テーブル
   CREATE POLICY "Users can insert their own likes" ON learning_content_likes
   FOR INSERT WITH CHECK (auth.uid() = user_id);

   -- learning_content_comments テーブル
   CREATE POLICY "Users can insert their own comments" ON learning_content_comments
   FOR INSERT WITH CHECK (auth.uid() = user_id);
   ```

3. **エラーハンドリングの改善**
   ```typescript
   try {
     const { data, error } = await supabase
       .from('learning_content_likes')
       .insert({ content_id: contentId, user_id: user.id });
     
     if (error) {
       console.error('いいね追加エラー:', error);
       throw error;
     }
   } catch (error) {
     alert(`いいねの更新に失敗しました: ${error.message}`);
   }
   ```

## プロフィール情報が取得できない

### 症状
- ユーザー名が表示されない
- プロフィール画像が読み込まれない
- 「ユーザー」と表示される

### 解決方法

1. **プロフィール取得の強化**
   ```typescript
   export const getProfileWithRetry = async (userId: string) => {
     const maxRetries = 3;
     let retryCount = 0;
     
     while (retryCount <= maxRetries) {
       const { data, error } = await supabase
         .from('profiles')
         .select('*')
         .eq('id', userId)
         .single();
       
       if (!error) return { data, error: null };
       
       retryCount++;
       if (retryCount <= maxRetries) {
         await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
       }
     }
     
     return { data: null, error: new Error('プロフィール取得に失敗しました') };
   };
   ```

2. **フォールバック処理**
   ```typescript
   const effectiveProfile = profile || {
     username: user.email?.split('@')[0] || 'ユーザー',
     full_name: user.email?.split('@')[0] || 'ユーザー'
   };
   ```

## セッション管理の問題

### 症状
- ページリロード後にログアウトされる
- セッションが予期せず切れる

### 解決方法

1. **セッション永続化の確認**
   ```typescript
   const supabase = createBrowserClient(supabaseUrl, supabaseKey, {
     auth: {
       autoRefreshToken: true,
       persistSession: true, // 重要
       detectSessionInUrl: true,
     },
   });
   ```

2. **セッション状態の監視**
   ```typescript
   useEffect(() => {
     const { data: { subscription } } = supabase.auth.onAuthStateChange(
       (event, session) => {
         setSession(session);
         setUser(session?.user || null);
       }
     );
     
     return () => subscription.unsubscribe();
   }, []);
   ```

## デバッグのヒント

### 開発環境でのデバッグ情報表示

```typescript
// 開発環境でのみデバッグ情報を表示
{process.env.NODE_ENV === 'development' && (
  <div className="text-xs text-gray-500">
    Debug: User={user ? 'logged in' : 'not logged in'}, 
    Likes={likes.length}, IsLiked={isLiked}
  </div>
)}
```

### ブラウザ開発者ツールでの確認

1. **Application タブ**
   - Local Storage: `supabase.auth.token`
   - Session Storage: `auth-storage`

2. **Network タブ**
   - Supabase APIへのリクエスト
   - 認証ヘッダーの確認

3. **Console タブ**
   - 認証関連のログ
   - エラーメッセージの確認

## 予防策

1. **定期的なセッション確認**
2. **エラーハンドリングの徹底**
3. **ユーザーフィードバックの改善**
4. **テスト環境での動作確認**

## 関連ドキュメント

- [DEVELOPMENT.md](../DEVELOPMENT.md) - 開発ガイド
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [React Query Documentation](https://tanstack.com/query/latest) 