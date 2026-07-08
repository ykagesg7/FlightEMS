import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const sendGa4Event = vi.fn();

vi.mock('../../lib/googleAnalytics', () => ({
  sendGa4Event: (...args: unknown[]) => sendGa4Event(...args),
}));

import {
  clearChunkReloadFlag,
  isChunkLoadFailure,
  reloadOnceForStaleChunk,
} from '../../utils/chunkLoadRecovery';

describe('chunkLoadRecovery', () => {
  beforeEach(() => {
    sendGa4Event.mockClear();
    sessionStorage.clear();
    vi.stubGlobal('location', { ...window.location, reload: vi.fn(), pathname: '/test' });
  });

  afterEach(() => {
    clearChunkReloadFlag();
    vi.unstubAllGlobals();
  });

  it('detects dynamic import failures', () => {
    expect(
      isChunkLoadFailure(new Error('Failed to fetch dynamically imported module: /assets/ArticleDetailPage-abc.js')),
    ).toBe(true);
    expect(isChunkLoadFailure(new Error('Importing a module script failed.'))).toBe(true);
    expect(isChunkLoadFailure(new Error('Something else'))).toBe(false);
  });

  it('reloadOnceForStaleChunk sends chunk_recovery_reload once per session', () => {
    const reload = vi.fn();
    vi.stubGlobal('location', { ...window.location, reload, pathname: '/articles/foo' });

    expect(reloadOnceForStaleChunk()).toBe(true);
    expect(sendGa4Event).toHaveBeenCalledWith('chunk_recovery_reload', { page_path: '/articles/foo' });
    expect(reload).toHaveBeenCalledTimes(1);

    sendGa4Event.mockClear();
    reload.mockClear();
    expect(reloadOnceForStaleChunk()).toBe(false);
    expect(sendGa4Event).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });
});
