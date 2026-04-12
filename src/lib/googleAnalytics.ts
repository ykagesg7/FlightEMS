/**
 * Google Analytics 4（オプション）。本番かつ VITE_GA_MEASUREMENT_ID 設定時のみ使用。
 * SPA はルート遷移ごとに page_path を送る（send_page_view は手動集約）。
 * @see https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GTAG_SRC = 'https://www.googletagmanager.com/gtag/js';

function ensureGtagStub(): void {
  window.dataLayer = window.dataLayer ?? [];
  if (typeof window.gtag === 'function') return;
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
}

export function initGoogleAnalytics(measurementId: string): void {
  if (typeof document === 'undefined') return;
  const id = measurementId.trim();
  if (!id) return;

  if (document.querySelector(`script[src^="${GTAG_SRC}"]`)) {
    ensureGtagStub();
    window.gtag!('config', id, { send_page_view: false });
    return;
  }

  ensureGtagStub();
  window.gtag!('js', new Date());

  const s = document.createElement('script');
  s.async = true;
  s.src = `${GTAG_SRC}?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);

  window.gtag!('config', id, { send_page_view: false });
}

/** ルート変更後に呼ぶ（本番・gtag 読み込み後のみ送信） */
export function sendGa4PageView(measurementId: string, pagePath: string): void {
  if (typeof window === 'undefined' || !import.meta.env.PROD) return;
  const id = measurementId.trim();
  if (!id || typeof window.gtag !== 'function') return;
  const title = typeof document !== 'undefined' ? document.title : '';
  const locationHref = typeof window !== 'undefined' ? window.location.href : '';
  // send_page_view: false と併用。page_location 付きの明示 page_view で SPA 遷移を送る
  window.gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: title,
    page_location: locationHref,
  });
}
