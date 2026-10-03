import { beforeEach, describe, expect, it, vi } from 'vitest';

const importWithChunkRetry = vi.fn();
const plainImporter = vi.fn();

vi.mock('../../utils/lazyWithRetry', () => ({
  importWithChunkRetry: (...args: unknown[]) => importWithChunkRetry(...args),
}));

import { lazyRoute } from '../../layouts/routeLazy';

describe('lazyRoute', () => {
  beforeEach(() => {
    importWithChunkRetry.mockReset();
    plainImporter.mockReset();
  });

  it('uses chunk retry by default', async () => {
    const Page = () => null;
    importWithChunkRetry.mockResolvedValue({ default: Page });
    const route = lazyRoute(() => import('../../pages/about/About'));
    const result = await route.lazy();
    expect(importWithChunkRetry).toHaveBeenCalledTimes(1);
    expect(result.Component).toBe(Page);
  });

  it('honors retry=false and calls importer directly', async () => {
    const Page = () => null;
    const importer = vi.fn(async () => ({ default: Page }));
    const route = lazyRoute(importer, false);
    const result = await route.lazy();
    expect(importWithChunkRetry).not.toHaveBeenCalled();
    expect(importer).toHaveBeenCalledTimes(1);
    expect(result.Component).toBe(Page);
  });

  it('routes chunk failures through importWithChunkRetry when retry is default', async () => {
    const mimeErr = new Error("'text/html' is not a valid JavaScript MIME type.");
    importWithChunkRetry.mockRejectedValue(mimeErr);
    const route = lazyRoute(() => import('../../pages/about/About'));
    await expect(route.lazy()).rejects.toThrow(mimeErr);
    expect(importWithChunkRetry).toHaveBeenCalled();
  });
});
