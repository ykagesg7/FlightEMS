import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const reloadOnceForStaleChunk = vi.fn();
const clearChunkReloadFlag = vi.fn();
const isChunkLoadFailure = vi.fn();

vi.mock('../../utils/chunkLoadRecovery', () => ({
  reloadOnceForStaleChunk: (...args: unknown[]) => reloadOnceForStaleChunk(...args),
  clearChunkReloadFlag: (...args: unknown[]) => clearChunkReloadFlag(...args),
  isChunkLoadFailure: (...args: unknown[]) => isChunkLoadFailure(...args),
}));

import { importWithChunkRetry } from '../../utils/lazyWithRetry';

describe('importWithChunkRetry', () => {
  beforeEach(() => {
    reloadOnceForStaleChunk.mockReset();
    clearChunkReloadFlag.mockReset();
    isChunkLoadFailure.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('clears reload flag after successful import', async () => {
    const Comp = () => null;
    const importer = vi.fn(async () => ({ default: Comp }));
    const mod = await importWithChunkRetry(importer);
    expect(mod.default).toBe(Comp);
    expect(clearChunkReloadFlag).toHaveBeenCalledTimes(1);
    expect(reloadOnceForStaleChunk).not.toHaveBeenCalled();
  });

  it('retries chunk failures then reloads without rejecting', async () => {
    vi.useFakeTimers();
    isChunkLoadFailure.mockReturnValue(true);
    reloadOnceForStaleChunk.mockReturnValue(true);
    const err = new Error('Importing a module script failed.');
    const importer = vi.fn().mockRejectedValue(err);

    let settled = false;
    const pending = importWithChunkRetry(importer, 1).then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      },
    );
    await vi.runAllTimersAsync();
    await Promise.resolve();

    expect(importer).toHaveBeenCalledTimes(2);
    expect(reloadOnceForStaleChunk).toHaveBeenCalledTimes(1);
    expect(settled).toBe(false);
    void pending;
  });

  it('rethrows when reload was already attempted', async () => {
    vi.useFakeTimers();
    isChunkLoadFailure.mockReturnValue(true);
    reloadOnceForStaleChunk.mockReturnValue(false);
    const err = new Error('Importing a module script failed.');
    const importer = vi.fn().mockRejectedValue(err);

    const assertion = expect(importWithChunkRetry(importer, 0)).rejects.toThrow(err);
    await vi.runAllTimersAsync();
    await assertion;
  });
});
