/** Canonical public site origin (no trailing slash). */
export const DEFAULT_SITE_ORIGIN = 'https://flight-lms.vercel.app';

/** Legacy domain that must not appear in canonical / SEO output. */
export const FORBIDDEN_SITE_ORIGIN_HOST = 'flightacademy.com';

export function normalizeSiteOrigin(value: string): string {
  return value.trim().replace(/\/$/, '');
}

export type SiteOriginEnv = {
  VITE_SITE_ORIGIN?: string;
  VITE_APP_URL?: string;
  APP_URL?: string;
  VERCEL_URL?: string;
};

/** Node / Vercel serverless / Vite build (process.env). */
export function resolveSiteOriginFromEnv(env: SiteOriginEnv): string {
  const fromSite =
    env.VITE_SITE_ORIGIN !== undefined && String(env.VITE_SITE_ORIGIN).trim()
      ? normalizeSiteOrigin(String(env.VITE_SITE_ORIGIN))
      : '';
  if (fromSite) return fromSite;

  const fromApp =
    env.VITE_APP_URL !== undefined && String(env.VITE_APP_URL).trim()
      ? normalizeSiteOrigin(String(env.VITE_APP_URL))
      : '';
  if (fromApp) return fromApp;

  const appUrl =
    env.APP_URL !== undefined && String(env.APP_URL).trim()
      ? normalizeSiteOrigin(String(env.APP_URL))
      : '';
  if (appUrl) return appUrl;

  if (env.VERCEL_URL && String(env.VERCEL_URL).trim()) {
    return normalizeSiteOrigin(`https://${String(env.VERCEL_URL).trim()}`);
  }

  return DEFAULT_SITE_ORIGIN;
}

export function buildAbsoluteUrl(pathname: string, origin: string): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${origin}${path}`;
}
