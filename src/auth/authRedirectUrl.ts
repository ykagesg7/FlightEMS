/** OAuth / Magic Link 完了後のリダイレクト先（Supabase Redirect URLs に登録必須） */
export function getAuthRedirectUrl(): string {
  if (typeof window === 'undefined') {
    return '/auth';
  }
  return `${window.location.origin}/auth`;
}

/** パスワードリセットメールのリンク先（新パスワード入力画面を表示する） */
export function getPasswordRecoveryRedirectUrl(): string {
  if (typeof window === 'undefined') {
    return '/auth/recovery';
  }
  return `${window.location.origin}/auth/recovery`;
}

/** URL ハッシュ / クエリ / パスから Supabase Auth の type を取得（例: recovery） */
export function getAuthCallbackType(): string | null {
  if (typeof window === 'undefined') return null;
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const typeFromHash = hashParams.get('type');
  if (typeFromHash) return typeFromHash;
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get('mode') === 'recovery') return 'recovery';
  if (window.location.pathname.endsWith('/auth/recovery')) return 'recovery';
  return null;
}
