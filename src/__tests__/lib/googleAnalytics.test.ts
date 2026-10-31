import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendGa4PageView } from '../../lib/googleAnalytics';

describe('googleAnalytics', () => {
  const gtag = vi.fn();

  beforeEach(() => {
    gtag.mockClear();
    vi.stubGlobal('window', {
      gtag,
      location: { href: 'https://flight-lms.vercel.app/' },
    });
    vi.stubGlobal('document', { title: 'Flight Academy' });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sendGa4PageView uses gtag config with page_path in production', () => {
    vi.stubEnv('PROD', true);

    sendGa4PageView('G-TEST123', '/articles/foo');

    expect(gtag).toHaveBeenCalledWith('config', 'G-TEST123', {
      page_path: '/articles/foo',
      page_title: 'Flight Academy',
      page_location: 'https://flight-lms.vercel.app/',
    });
  });

  it('sendGa4PageView no-ops when measurement id is empty', () => {
    vi.stubEnv('PROD', true);

    sendGa4PageView('  ', '/');

    expect(gtag).not.toHaveBeenCalled();
  });
});
