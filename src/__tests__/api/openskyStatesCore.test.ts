import { describe, expect, it } from 'vitest';

import {
  isUpstreamTimeoutError,
  quantizeBboxForTrafficCache,
  proxyOpenSkyStates,
} from '../../../api/_lib/openskyStatesCore';

describe('isUpstreamTimeoutError', () => {
  it('detects AbortError and TimeoutError', () => {
    expect(isUpstreamTimeoutError(Object.assign(new Error('aborted'), { name: 'AbortError' }))).toBe(
      true
    );
    expect(isUpstreamTimeoutError(Object.assign(new Error('t'), { name: 'TimeoutError' }))).toBe(
      true
    );
  });

  it('detects undici fetch failed with connect timeout cause', () => {
    const err = Object.assign(new TypeError('fetch failed'), {
      cause: Object.assign(new Error('Connect Timeout Error'), {
        code: 'UND_ERR_CONNECT_TIMEOUT',
      }),
    });
    expect(isUpstreamTimeoutError(err)).toBe(true);
  });
});

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
