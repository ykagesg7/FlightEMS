import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendGa4PageView } from '../../lib/googleAnalytics';

describe('googleAnalytics', () => {
  const gtag = vi.fn();

  beforeEach(() => {
    gtag.mockClear();
    vi.stubGlobal('window', {
      gtag,
      location: { href: 'https://flight-lms.vercel.app/articles/foo' },
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

    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith('event', 'page_view', {
      page_path: '/articles/foo',
      page_title: 'Flight Academy',
      page_location: 'https://flight-lms.vercel.app/articles/foo',
    });
    expect(gtag).not.toHaveBeenCalledWith('config', expect.anything(), expect.anything());
  });

  it('sendGa4PageView reads page_location from window.location at send time', () => {
    vi.stubEnv('PROD', true);
    const win = window as Window & { location: { href: string } };
    win.location.href = 'https://preview.example/articles/bar';

    sendGa4PageView('G-TEST123', '/articles/bar');

    expect(gtag).toHaveBeenCalledWith('event', 'page_view', expect.objectContaining({
      page_path: '/articles/bar',
      page_location: 'https://preview.example/articles/bar',
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
