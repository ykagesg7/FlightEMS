/**
 * Google Analytics 4（オプション）。本番かつ VITE_GA_MEASUREMENT_ID 設定時のみ使用。
 *
 * - **タグ読み込み**: 本番ビルドで Vite が `index.html` の `<head>` 直後に gtag.js を挿入（GA 管理画面の手順と同じ位置）。
 * - **page_view**: `send_page_view: false` で初期自動送信を抑え、`GoogleAnalyticsTracker` がルートごとに明示送信（SPA 推奨パターン）。
 *
 * @see https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type Ga4EventParams = Record<string, string | number | boolean | undefined>;

/** 本番ビルドで設定される測定 ID（未設定なら空文字） */
export function getGa4MeasurementId(): string {
  return import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() ?? '';
}

function canSendGa4(): boolean {
  return (
    typeof window !== 'undefined' &&
    import.meta.env.PROD &&
    typeof window.gtag === 'function' &&
    getGa4MeasurementId().length > 0
  );
}

/** ルート変更後に呼ぶ（本番・gtag 読み込み後のみ送信） */
export function sendGa4PageView(measurementId: string, pagePath: string): void {
  if (typeof window === 'undefined' || !import.meta.env.PROD) return;
  const id = measurementId.trim();
  if (!id || typeof window.gtag !== 'function') return;
  const title = typeof document !== 'undefined' ? document.title : '';
  const locationHref = typeof window !== 'undefined' ? window.location.href : '';
  window.gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: title,
    page_location: locationHref,
  });
}

/** カスタムイベント（Quiz Hub 計測等）。本番・gtag 読み込み後のみ送信。 */
export function sendGa4Event(eventName: string, params?: Ga4EventParams): void {
  if (!canSendGa4()) return;
  const id = getGa4MeasurementId();
  const payload: Record<string, string | number | boolean> = {};
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) payload[key] = value;
    }
  }
  window.gtag!('event', eventName, payload);
  void id;
}
