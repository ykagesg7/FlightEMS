/** OAuth / Magic Link リダイレクト直後（コード交換前）かどうか */
export function isAuthCallbackPending(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const { hash, search } = window.location;
  if (hash.includes('access_token') || hash.includes('error=')) {
    return true;
  }
  const params = new URLSearchParams(search);
  return params.has('code') || params.has('error') || params.has('error_description');
}
