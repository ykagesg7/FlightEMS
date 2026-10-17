import {
  DEFAULT_SITE_ORIGIN,
  buildAbsoluteUrl as buildAbsoluteUrlWithOrigin,
  normalizeSiteOrigin,
} from './siteOriginEnv';

export {
  DEFAULT_SITE_ORIGIN,
  FORBIDDEN_SITE_ORIGIN_HOST,
  normalizeSiteOrigin,
  resolveSiteOriginFromEnv,
  type SiteOriginEnv,
} from './siteOriginEnv';

/** Browser / Vite client bundle. */
export function getSiteOrigin(): string {
  const fromEnv = import.meta.env.VITE_SITE_ORIGIN;
  if (fromEnv && String(fromEnv).trim()) {
    return normalizeSiteOrigin(String(fromEnv));
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return normalizeSiteOrigin(window.location.origin);
  }
  return DEFAULT_SITE_ORIGIN;
}

export function buildAbsoluteUrl(pathname: string, origin = getSiteOrigin()): string {
  return buildAbsoluteUrlWithOrigin(pathname, origin);
}
