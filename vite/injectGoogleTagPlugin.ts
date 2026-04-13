import type { Plugin } from 'vite';

const GTAG_JS = 'https://www.googletagmanager.com/gtag/js';

/** 測定 ID の形式のみ許可（ビルド時 env の誤設定で HTML が壊れないようにする） */
function sanitizeGaMeasurementId(raw: string): string | null {
  const s = raw.trim();
  if (!/^G-[A-Z0-9]+$/i.test(s)) return null;
  return s;
}

/** ビルドマシン上の env を優先（Vercel / CI はここにだけ渡ることがある） */
function resolveGaMeasurementId(configTimeValue: string): string {
  const fromProcess = String(
    process.env.VITE_GA_MEASUREMENT_ID ?? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '',
  ).trim();
  if (fromProcess) return fromProcess;
  return String(configTimeValue ?? '').trim();
}

/**
 * GA4 公式手順どおり、本番ビルドの index.html の <head> 直後に gtag を挿入する。
 * SPA 向けに send_page_view: false とし、初回・遷移とも GoogleAnalyticsTracker が page_view を送る。
 */
export function injectGoogleTagPlugin(measurementId: string, production: boolean): Plugin {
  return {
    name: 'inject-google-tag',
    transformIndexHtml(html) {
      if (!production) return html;
      const raw = resolveGaMeasurementId(measurementId);
      const id = sanitizeGaMeasurementId(raw);
      if (!id) {
        if (raw) {
          console.warn(
            '[vite] GA measurement id is set but invalid (expected G-XXXXXXXXXX). GA4 snippet not injected.',
          );
        }
        return html;
      }
      const snippet = `
    <!-- Google tag (gtag.js): injected after <head> on production build when VITE_GA_MEASUREMENT_ID is set -->
    <script async src="${GTAG_JS}?id=${id}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${id}', { send_page_view: false });
    </script>`;
      return html.replace('<head>', `<head>${snippet}`);
    },
  };
}
