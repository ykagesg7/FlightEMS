/** Canonical public site origin (no trailing slash). */
export const DEFAULT_SITE_ORIGIN = 'https://flight-lms.vercel.app';

/** Legacy domain that must not appear in canonical / SEO output. */
export const FORBIDDEN_SITE_ORIGIN_HOST = 'flightacademy.com';

export class InvalidSiteOriginError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSiteOriginError';
  }
}

/**
 * Parse canonical site origin from `VITE_SITE_ORIGIN`.
 * Empty / whitespace-only → {@link DEFAULT_SITE_ORIGIN}.
 * Non-empty invalid values throw (fail build / config).
 */
export function normalizeSiteOrigin(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return DEFAULT_SITE_ORIGIN;
  }

  let candidate = trimmed;
  while (candidate.endsWith('/')) {
    candidate = candidate.slice(0, -1);
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new InvalidSiteOriginError(
      `VITE_SITE_ORIGIN must be a valid https origin (no path, query, or hash): "${value}"`,
    );
  }

  if (parsed.protocol !== 'https:') {
    throw new InvalidSiteOriginError(
      `VITE_SITE_ORIGIN must use https (got ${parsed.protocol}): "${value}"`,
    );
  }

  if (parsed.search || parsed.hash) {
    throw new InvalidSiteOriginError(
      `VITE_SITE_ORIGIN must not include query or hash: "${value}"`,
    );
  }

  const path = parsed.pathname;
  if (path !== '/' && path !== '') {
    throw new InvalidSiteOriginError(
      `VITE_SITE_ORIGIN must not include a path: "${value}"`,
    );
  }

  return `${parsed.protocol}//${parsed.host}`;
}

export type SiteOriginEnv = {
  VITE_SITE_ORIGIN?: string;
  VITE_APP_URL?: string;
  APP_URL?: string;
  VERCEL_URL?: string;
};

/** Canonical / SEO site origin: `VITE_SITE_ORIGIN` then default only. */
export function resolveCanonicalSiteOriginFromEnv(env: {
  VITE_SITE_ORIGIN?: string;
}): string {
  const raw = env.VITE_SITE_ORIGIN;
  if (raw === undefined || !String(raw).trim()) {
    return DEFAULT_SITE_ORIGIN;
  }
  return normalizeSiteOrigin(String(raw));
}

function normalizeAppBaseUrl(value: string): string {
  let candidate = value.trim();
  while (candidate.endsWith('/')) {
    candidate = candidate.slice(0, -1);
  }
  return candidate;
}

/**
 * App / email link base URL (unchanged precedence: app env vars, then Vercel host, then default).
 * Serverless cron must not import this module (ESM); use `api/_lib/appBaseUrl.ts` instead.
 */
export function resolveAppBaseUrlFromEnv(env: SiteOriginEnv): string {
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

  return DEFAULT_SITE_ORIGIN;
}

/** @deprecated Use {@link resolveCanonicalSiteOriginFromEnv} or {@link resolveAppBaseUrlFromEnv}. */
export function resolveSiteOriginFromEnv(env: SiteOriginEnv): string {
  return resolveCanonicalSiteOriginFromEnv(env);
}

export function buildAbsoluteUrl(pathname: string, origin: string): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${origin}${path}`;
}
