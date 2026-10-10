import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const GRID_PATH = join(process.cwd(), 'src/utils/data/gsiGeomag2020DeclinationWest.u16');

function validGridBuffer(): ArrayBuffer {
  const raw = readFileSync(GRID_PATH);
  return raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
}

describe('gsiGeomag2020DeclinationWest grid load', () => {
  beforeEach(() => {
    vi.stubEnv('GSI_GEOMAG_USE_FETCH', 'true');
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('reports representative declination while grid load is still pending', async () => {
    const mod = await import('../../utils/gsiGeomag2020DeclinationWest');
    mod.__resetGsiGeomag2020GridForTests();

    expect(mod.isGsiGeomag2020GridFallbackActive()).toBe(false);
    expect(mod.isGsiGeomag2020RepresentativeDeclinationActive()).toBe(true);
    expect(mod.gsiGeomag2020DeclinationWestDeg(35.5, 139.8)).toBe(
      mod.GSI_GEOMAG_FALLBACK_DECLINATION_WEST_DEG,
    );

    const japan = await import('../../utils/japanMagneticVariation');
    expect(japan.isJapanMagneticVariationGridFallbackActive()).toBe(true);
  });

  it('does not reject init when fetch fails; enters fallback and returns finite declination', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        headers: new Headers(),
        arrayBuffer: async () => new ArrayBuffer(0),
      }),
    );

    const mod = await import('../../utils/gsiGeomag2020DeclinationWest');
    mod.__resetGsiGeomag2020GridForTests();
    await expect(mod.initGsiGeomag2020DeclinationGrid()).resolves.toBeUndefined();
    expect(mod.isGsiGeomag2020GridFallbackActive()).toBe(true);
    expect(mod.gsiGeomag2020DeclinationWestDeg(35.5, 139.8)).toBe(
      mod.GSI_GEOMAG_FALLBACK_DECLINATION_WEST_DEG,
    );
    expect(Number.isFinite(mod.gsiGeomag2020DeclinationWestDeg(0, 0))).toBe(true);
  });

  it('treats HTML 200 responses as load failure and uses fallback', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/html; charset=utf-8' }),
        arrayBuffer: async () => new TextEncoder().encode('<!doctype html>').buffer,
      }),
    );

    const mod = await import('../../utils/gsiGeomag2020DeclinationWest');
    mod.__resetGsiGeomag2020GridForTests();
    await mod.initGsiGeomag2020DeclinationGrid();
    expect(mod.isGsiGeomag2020GridFallbackActive()).toBe(true);
  });

  it('treats wrong byte length as load failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/octet-stream' }),
        arrayBuffer: async () => new ArrayBuffer(8),
      }),
    );

    const mod = await import('../../utils/gsiGeomag2020DeclinationWest');
    mod.__resetGsiGeomag2020GridForTests();
    await mod.initGsiGeomag2020DeclinationGrid();
    expect(mod.isGsiGeomag2020GridFallbackActive()).toBe(true);
    expect(mod.GSI_GEOMAG_GRID_BYTE_LENGTH).toBe(204000);
  });

  it('retries fetch after a failed attempt without leaving a rejected loadPromise', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/octet-stream' }),
        arrayBuffer: async () => validGridBuffer(),
      });
    vi.stubGlobal('fetch', fetchMock);

    const mod = await import('../../utils/gsiGeomag2020DeclinationWest');
    mod.__resetGsiGeomag2020GridForTests();
    await mod.initGsiGeomag2020DeclinationGrid();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(mod.isGsiGeomag2020GridFallbackActive()).toBe(false);
    expect(mod.gsiGeomag2020DeclinationWestDeg(35.549678, 139.786958)).toBeCloseTo(7.53, 1);
  });

  it('allows a second init call to retry after module reset', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: new Headers(),
      arrayBuffer: async () => new ArrayBuffer(0),
    });
    vi.stubGlobal('fetch', fetchMock);

    const mod = await import('../../utils/gsiGeomag2020DeclinationWest');
    mod.__resetGsiGeomag2020GridForTests();
    await mod.initGsiGeomag2020DeclinationGrid();
    expect(mod.isGsiGeomag2020GridFallbackActive()).toBe(true);

    mod.__resetGsiGeomag2020GridForTests();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/octet-stream' }),
      arrayBuffer: async () => validGridBuffer(),
    });

    await mod.initGsiGeomag2020DeclinationGrid();
    expect(mod.isGsiGeomag2020GridFallbackActive()).toBe(false);
  });
});
