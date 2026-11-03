import { describe, expect, it } from 'vitest';
import { isNewsletterOptOutPath, withNewsletterEmailUtm } from '../../../api/_lib/newsletterLinkUtm';

const BASE = 'https://flight-lms.vercel.app';
const CAMPAIGN = '2026-W45';

describe('api/lib/newsletterLinkUtm', () => {
  it('appends newsletter UTMs to internal absolute URLs', () => {
    const out = withNewsletterEmailUtm(`${BASE}/articles/foo`, BASE, CAMPAIGN);
    const url = new URL(out);
    expect(url.searchParams.get('utm_source')).toBe('newsletter');
    expect(url.searchParams.get('utm_medium')).toBe('email');
    expect(url.searchParams.get('utm_campaign')).toBe(CAMPAIGN);
    expect(url.pathname).toBe('/articles/foo');
  });

  it('preserves existing query parameters and hash', () => {
    const out = withNewsletterEmailUtm(
      `${BASE}/planning?tab=routes#preview`,
      BASE,
      CAMPAIGN,
    );
    const url = new URL(out);
    expect(url.searchParams.get('tab')).toBe('routes');
    expect(url.hash).toBe('#preview');
    expect(url.searchParams.get('utm_campaign')).toBe(CAMPAIGN);
  });

  it('resolves relative paths against app base URL', () => {
    const out = withNewsletterEmailUtm('/articles/bar', BASE, CAMPAIGN);
    expect(out).toContain('/articles/bar');
    expect(out).toContain('utm_source=newsletter');
  });

  it('does not modify external URLs', () => {
    const external = 'https://example.org/wiki/page';
    expect(withNewsletterEmailUtm(external, BASE, CAMPAIGN)).toBe(external);
  });

  it('does not modify opt-out profile links', () => {
    const optOut = `${BASE}/profile`;
    expect(withNewsletterEmailUtm(optOut, BASE, CAMPAIGN)).toBe(optOut);
    const nested = `${BASE}/profile/notifications`;
    expect(withNewsletterEmailUtm(nested, BASE, CAMPAIGN)).toBe(nested);
  });

  it('identifies opt-out paths', () => {
    expect(isNewsletterOptOutPath('/profile')).toBe(true);
    expect(isNewsletterOptOutPath('/profile/settings')).toBe(true);
    expect(isNewsletterOptOutPath('/articles/x')).toBe(false);
  });
});
