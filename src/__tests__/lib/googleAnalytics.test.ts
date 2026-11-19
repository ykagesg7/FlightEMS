import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendGa4PageView } from '../../lib/googleAnalytics';

describe('googleAnalytics', () => {
  const gtag = vi.fn();

  beforeEach(() => {
    gtag.mockClear();
    vi.stubGlobal('window', {
      gtag,
      location: {
        origin: 'https://flight-lms.vercel.app',
        href: 'https://flight-lms.vercel.app/articles/foo',
      },
    });
    vi.stubGlobal('document', { title: 'Flight Academy' });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('sendGa4PageView uses gtag event page_view (not config) in production', () => {
    vi.stubEnv('PROD', true);

    sendGa4PageView('G-TEST123', '/articles/foo');

    expect(gtag).toHaveBeenCalledTimes(2);
    expect(gtag).toHaveBeenNthCalledWith(1, 'config', 'G-TEST123', {
      page_path: '/articles/foo',
      page_location: 'https://flight-lms.vercel.app/articles/foo',
    });
    expect(gtag).toHaveBeenNthCalledWith(2, 'event', 'page_view', {
      page_path: '/articles/foo',
      page_title: 'Flight Academy',
      page_location: 'https://flight-lms.vercel.app/articles/foo',
    });
  });

  it('sendGa4PageView uses canonical page_location even when window.location is a legacy learning URL', () => {
    vi.stubEnv('PROD', true);
    const win = window as Window & { location: { href: string; origin: string } };
    win.location.origin = 'https://flight-lms.vercel.app';
    win.location.href = 'https://flight-lms.vercel.app/learning/IF-1-3_IMC_Scan';

    sendGa4PageView('G-TEST123', '/articles/if-1-3-imc-scan');

    expect(gtag).toHaveBeenNthCalledWith(1, 'config', 'G-TEST123', {
      page_path: '/articles/if-1-3-imc-scan',
      page_location: 'https://flight-lms.vercel.app/articles/if-1-3-imc-scan',
    });
    expect(gtag).toHaveBeenNthCalledWith(2, 'event', 'page_view', expect.objectContaining({
      page_path: '/articles/if-1-3-imc-scan',
      page_location: 'https://flight-lms.vercel.app/articles/if-1-3-imc-scan',
    }));
  });

  it('sendGa4PageView no-ops when measurement id is empty', () => {
    vi.stubEnv('PROD', true);

    sendGa4PageView('  ', '/');

    expect(gtag).not.toHaveBeenCalled();
  });

  it('sendGa4PageView no-ops when not in production', () => {
    vi.stubEnv('PROD', false);

    sendGa4PageView('G-TEST123', '/');

    expect(gtag).not.toHaveBeenCalled();
  });
});
