import type { HtmlTagDescriptor, Plugin } from 'vite';

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
 * GA4: Vite の公式 `tags` / `head-prepend` で挿入する（文字列 replace は後段の HTML 処理で失うことがある）。
 * SPA 向け send_page_view: false + GoogleAnalyticsTracker で page_view。
 */
export function injectGoogleTagPlugin(measurementId: string, production: boolean): Plugin {
  return {
    name: 'inject-google-tag',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
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

        const tags: HtmlTagDescriptor[] = [
          {
            tag: 'script',
            attrs: { async: true, src: `${GTAG_JS}?id=${id}` },
            injectTo: 'head-prepend',
          },
          {
            tag: 'script',
            children: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}', { send_page_view: false });`,
            injectTo: 'head-prepend',
          },
        ];

        return { html, tags };
      },
    },
  };
}
