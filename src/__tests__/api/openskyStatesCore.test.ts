import { describe, expect, it } from 'vitest';

import { proxyOpenSkyStates } from '../../../api/lib/openskyStatesCore';

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
});
