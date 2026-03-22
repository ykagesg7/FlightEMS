/**
 * 開発時のみ: ブラウザから叩く Serverless API のオリジン（末尾スラッシュなし）。
 *
 * `vercel dev` 利用時、Vite が `/api` を Vercel にプロキシだけに頼るとデッドロックしうるため、
 * `VITE_VERCEL_DEV_API_ORIGIN` で API オリジンを直接指定する。
 *
 * **localhost と 127.0.0.1 はブラウザでは別オリジン**のため、ページが `http://localhost:5173`
 * のとき API を `http://127.0.0.1:3000` にすると CORS でブロックされる。表示中の
 * `window.location.hostname` に合わせて API 側のホスト名を揃える。
 */
export function getDevApiBase(): string {
  const raw = import.meta.env.VITE_VERCEL_DEV_API_ORIGIN;
  if (typeof raw !== 'string' || !raw.trim()) {
    return '';
  }
  let base = raw.trim().replace(/\/$/, '');
  if (typeof window === 'undefined') {
    return base;
  }
  const pageHost = window.location.hostname;
  try {
    const u = new URL(base);
    const apiHost = u.hostname;
    if (pageHost === 'localhost' && apiHost === '127.0.0.1') {
      u.hostname = 'localhost';
      base = u.origin;
    } else if (pageHost === '127.0.0.1' && apiHost === 'localhost') {
      u.hostname = '127.0.0.1';
      base = u.origin;
    }
  } catch {
    /* ignore invalid URL */
  }
  return base;
}
