import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyGa4CanonicalPageContext,
  getLastGa4CanonicalPagePath,
  syncBrowserUrlToCanonicalArticlePath,
} from '../../lib/ga4CanonicalBootstrap';

describe('ga4CanonicalBootstrap', () => {
  const gtag = vi.fn();

  beforeEach(() => {
    gtag.mockClear();
    vi.stubGlobal('window', {
      gtag,
      location: {
        origin: 'https://flight-lms.vercel.app',
        pathname: '/learning/IF-1-3_IMC_Scan',
        search: '',
        href: 'https://flight-lms.vercel.app/learning/IF-1-3_IMC_Scan',
      },
      history: { state: null, replaceState: vi.fn() },
      dataLayer: [] as unknown[],
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('replaces /learning URLs with canonical article paths before React boots', () => {
    syncBrowserUrlToCanonicalArticlePath();
    const win = window as Window & {
      history: { replaceState: ReturnType<typeof vi.fn> };
    };
    expect(win.history.replaceState).toHaveBeenCalledWith(
      null,
      '',
      '/articles/if-1-3-imc-scan',
    );
    expect(getLastGa4CanonicalPagePath()).toBe('/articles/if-1-3-imc-scan');
  });

  it('patches dataLayer scroll events so page_location stays canonical (no /learning/)', () => {
    syncBrowserUrlToCanonicalArticlePath();
    const dl = window.dataLayer as unknown[] & { push: (...args: unknown[]) => number };
    dl.push(['event', 'scroll', { page_location: 'https://flight-lms.vercel.app/learning/IF-1-3_IMC_Scan' }]);
    const last = dl[dl.length - 1] as [string, string, { page_location: string; page_path: string }];
    expect(last[2].page_location).toBe('https://flight-lms.vercel.app/articles/if-1-3-imc-scan');
    expect(last[2].page_location).not.toContain('/learning/');
    expect(last[2].page_path).toBe('/articles/if-1-3-imc-scan');
  });

  it('applyGa4CanonicalPageContext sets gtag config to canonical page_location', () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TEST123');
    applyGa4CanonicalPageContext('/articles/cpl-hub-navigation');
    expect(gtag).toHaveBeenCalledWith('config', 'G-TEST123', {
      page_path: '/articles/cpl-hub-navigation',
      page_location: 'https://flight-lms.vercel.app/articles/cpl-hub-navigation',
    });
  });
});