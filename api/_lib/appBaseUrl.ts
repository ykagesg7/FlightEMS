/**
 * App / email link base URL for Vercel serverless (api/).
 *
 * Kept under api/_lib so cron handlers stay CJS-safe: requiring
 * `src/config/siteOriginEnv` (package `"type": "module"`) causes ERR_REQUIRE_ESM
 * at runtime. Precedence must stay aligned with
 * `resolveAppBaseUrlFromEnv` in `src/config/siteOriginEnv.ts`.
 */

const DEFAULT_APP_BASE_URL = 'https://flight-lms.vercel.app';

export type AppBaseUrlEnv = {
  VITE_APP_URL?: string;
  APP_URL?: string;
  VERCEL_URL?: string;
};

function normalizeAppBaseUrl(value: string): string {
  let candidate = value.trim();
  while (candidate.endsWith('/')) {
    candidate = candidate.slice(0, -1);
  }
  return candidate;
}

/** App / email link base URL (VITE_APP_URL → APP_URL → VERCEL_URL → default). */
export function resolveAppBaseUrlFromEnv(env: AppBaseUrlEnv): string {
  const fromApp =
    env.VITE_APP_URL !== undefined && String(env.VITE_APP_URL).trim()
      ? normalizeAppBaseUrl(String(env.VITE_APP_URL))
      : '';
  if (fromApp) return fromApp;

  const appUrl =
    env.APP_URL !== undefined && String(env.APP_URL).trim()
      ? normalizeAppBaseUrl(String(env.APP_URL))
      : '';
  if (appUrl) return appUrl;

  if (env.VERCEL_URL && String(env.VERCEL_URL).trim()) {
    return normalizeAppBaseUrl(`https://${String(env.VERCEL_URL).trim()}`);
  }

  return DEFAULT_APP_BASE_URL;
}
