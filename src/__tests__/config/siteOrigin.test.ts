import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SITE_ORIGIN,
  FORBIDDEN_SITE_ORIGIN_HOST,
  buildAbsoluteUrl,
  normalizeSiteOrigin,
  resolveSiteOriginFromEnv,
} from '../../config/siteOriginEnv';

describe('siteOrigin', () => {
  it('normalizeSiteOrigin strips trailing slash', () => {
    expect(normalizeSiteOrigin('https://flight-lms.vercel.app/')).toBe(DEFAULT_SITE_ORIGIN);
  });

  it('resolveSiteOriginFromEnv prefers VITE_SITE_ORIGIN', () => {
    expect(
      resolveSiteOriginFromEnv({
        VITE_SITE_ORIGIN: 'https://preview.example.test/',
        VITE_APP_URL: 'https://other.test',
      }),
    ).toBe('https://preview.example.test');
  });

  it('resolveSiteOriginFromEnv falls back to default', () => {
    expect(resolveSiteOriginFromEnv({})).toBe(DEFAULT_SITE_ORIGIN);
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
