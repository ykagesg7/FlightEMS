import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SITE_ORIGIN,
  FORBIDDEN_SITE_ORIGIN_HOST,
  InvalidSiteOriginError,
  buildAbsoluteUrl,
  normalizeSiteOrigin,
  resolveAppBaseUrlFromEnv,
  resolveCanonicalSiteOriginFromEnv,
} from '../../config/siteOriginEnv';

describe('siteOrigin', () => {
  it('normalizeSiteOrigin strips multiple trailing slashes', () => {
    expect(normalizeSiteOrigin('https://flight-lms.vercel.app///')).toBe(DEFAULT_SITE_ORIGIN);
  });

  it('normalizeSiteOrigin treats blank as default', () => {
    expect(normalizeSiteOrigin('   ')).toBe(DEFAULT_SITE_ORIGIN);
    expect(normalizeSiteOrigin('')).toBe(DEFAULT_SITE_ORIGIN);
  });

  it('normalizeSiteOrigin rejects http, path, scheme-less, and garbage', () => {
    expect(() => normalizeSiteOrigin('http://flight-lms.vercel.app')).toThrow(InvalidSiteOriginError);
    expect(() => normalizeSiteOrigin('https://flight-lms.vercel.app/extra')).toThrow(
      InvalidSiteOriginError,
    );
    expect(() => normalizeSiteOrigin('flight-lms.vercel.app')).toThrow(InvalidSiteOriginError);
    expect(() => normalizeSiteOrigin('not a url')).toThrow(InvalidSiteOriginError);
    expect(() => normalizeSiteOrigin('https://example.test?q=1')).toThrow(InvalidSiteOriginError);
  });

  it('resolveCanonicalSiteOriginFromEnv uses only VITE_SITE_ORIGIN then default', () => {
    expect(
      resolveCanonicalSiteOriginFromEnv({
        VITE_SITE_ORIGIN: 'https://preview.example.test/',
      }),
    ).toBe('https://preview.example.test');
    expect(
      resolveCanonicalSiteOriginFromEnv({
        VITE_SITE_ORIGIN: '',
        VITE_APP_URL: 'https://other.test',
        VERCEL_URL: 'deploy-abc.vercel.app',
      }),
    ).toBe(DEFAULT_SITE_ORIGIN);
  });

  it('resolveAppBaseUrlFromEnv still honors VERCEL_URL for email links', () => {
    expect(
      resolveAppBaseUrlFromEnv({
        VERCEL_URL: 'deploy-abc.vercel.app',
      }),
    ).toBe('https://deploy-abc.vercel.app');
    expect(
      resolveAppBaseUrlFromEnv({
        VERCEL_URL: 'deploy-abc.vercel.app',
        VITE_SITE_ORIGIN: 'https://flight-lms.vercel.app',
      }),
    ).toBe('https://deploy-abc.vercel.app');
  });

  it('buildAbsoluteUrl joins origin and path', () => {
    expect(buildAbsoluteUrl('/articles/foo', 'https://x.test')).toBe(
      'https://x.test/articles/foo',
    );
  });

  it('default origin is not the forbidden legacy host', () => {
    expect(DEFAULT_SITE_ORIGIN).not.toContain(FORBIDDEN_SITE_ORIGIN_HOST);
  });
});
