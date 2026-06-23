import { describe, expect, it } from 'vitest';

import { quantizeBboxForTrafficCache, proxyOpenSkyStates } from '../../../api/_lib/openskyStatesCore';

describe('proxyOpenSkyStates', () => {
  it('returns 400 when any bbox query is missing', async () => {
    const r = await proxyOpenSkyStates({ lamin: ['20'] });
    expect(r.status).toBe(400);
  });

  it('returns 400 when lamin > lamax', async () => {
    const r = await proxyOpenSkyStates({
      lamin: '40',
      lamax: '35',
      lomin: '122',
      lomax: '140',
    });
    expect(r.status).toBe(400);
  });

  it('returns 200 with empty states when bbox does not intersect Japan after clip', async () => {
    const r = await proxyOpenSkyStates({
      lamin: '40',
      lamax: '50',
      lomin: '0',
      lomax: '10',
    });
    expect(r.status).toBe(200);
    expect(r.body).toEqual(
      expect.objectContaining({
        states: [],
      }),
    );
  });

  it('quantizeBboxForTrafficCache matches client step', () => {
    expect(quantizeBboxForTrafficCache(35.12, 36.22, 139.08, 140.31)).toEqual({
      lamin: 35,
      lamax: 36.5,
      lomin: 139,
      lomax: 140.5,
    });
  });
});
