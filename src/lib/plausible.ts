/**
 * Plausible Analytics（オプション）。本番かつ VITE_PLAUSIBLE_DOMAIN 設定時のみ有効。
 * pushState 系ルーターでは標準スクリプトでルート遷移も計測される。
 * @see https://plausible.io/docs/spa-support
 */

export function initPlausibleScript(domain: string): void {
  if (typeof document === 'undefined') return;
  if (document.querySelector(`script[data-domain="${domain}"][src*="plausible.io/js/script"]`)) return;
  const s = document.createElement('script');
  s.defer = true;
  s.dataset.domain = domain;
  s.src = 'https://plausible.io/js/script.js';
  document.head.appendChild(s);
}
