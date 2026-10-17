import {
  DEFAULT_SITE_ORIGIN,
  buildAbsoluteUrl as buildAbsoluteUrlWithOrigin,
  normalizeSiteOrigin,
} from './siteOriginEnv';

export {
  DEFAULT_SITE_ORIGIN,
  FORBIDDEN_SITE_ORIGIN_HOST,
  InvalidSiteOriginError,
  normalizeSiteOrigin,
  resolveAppBaseUrlFromEnv,
  resolveCanonicalSiteOriginFromEnv,
  resolveSiteOriginFromEnv,
  type SiteOriginEnv,
} from './siteOriginEnv';

/** Browser / Vite client bundle (embedded at build from canonical resolver). */
export function getSiteOrigin(): string {
  const fromEnv = import.meta.env.VITE_SITE_ORIGIN;
  if (fromEnv !== undefined && String(fromEnv).trim()) {
    return normalizeSiteOrigin(String(fromEnv));
  }
  return DEFAULT_SITE_ORIGIN;
}

export function buildAbsoluteUrl(pathname: string, origin = getSiteOrigin()): string {
  return buildAbsoluteUrlWithOrigin(pathname, origin);
}
