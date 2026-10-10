import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const GRID_PATH = join(process.cwd(), 'src/utils/data/gsiGeomag2020DeclinationWest.u16');

function validGridBuffer(): ArrayBuffer {
  const raw = readFileSync(GRID_PATH);
  return raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
}

describe('MagneticVariationFallbackNotice', () => {
  beforeEach(() => {
    vi.stubEnv('GSI_GEOMAG_USE_FETCH', 'true');
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('shows pending copy then hides after grid load completes', async () => {
    let releaseFetch!: (buf: ArrayBuffer) => void;
    const fetchGate = new Promise<ArrayBuffer>((resolve) => {
      releaseFetch = resolve;
    });

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() =>
        fetchGate.then((buf) => ({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/octet-stream' }),
          arrayBuffer: async () => buf,
        })),
      ),
    );

    const gsi = await import('../../utils/gsiGeomag2020DeclinationWest');
    gsi.__resetGsiGeomag2020GridForTests();

    const { MagneticVariationFallbackNotice } = await import(
      '../../pages/planning/components/MagneticVariationFallbackNotice'
    );

    render(<MagneticVariationFallbackNotice />);

    expect(screen.getByRole('alert')).toHaveTextContent(/読み込み中です/);
    expect(screen.getByRole('alert')).toHaveTextContent(/7\.53°W/);

    await act(async () => {
      const initPromise = gsi.initGsiGeomag2020DeclinationGrid();
      releaseFetch(validGridBuffer());
      await initPromise;
    });

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('shows failure copy when grid load enters fallback', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        headers: new Headers(),
        arrayBuffer: async () => new ArrayBuffer(0),
      }),
    );

    const gsi = await import('../../utils/gsiGeomag2020DeclinationWest');
    gsi.__resetGsiGeomag2020GridForTests();

    const { MagneticVariationFallbackNotice } = await import(
      '../../pages/planning/components/MagneticVariationFallbackNotice'
    );

    render(<MagneticVariationFallbackNotice />);
    expect(screen.getByRole('alert')).toHaveTextContent(/読み込み中です/);

    await act(async () => {
      await gsi.initGsiGeomag2020DeclinationGrid();
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/読み込めませんでした/);
    });
  });
});
