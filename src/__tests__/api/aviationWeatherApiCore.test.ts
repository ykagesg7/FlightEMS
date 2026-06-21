import { describe, expect, it } from 'vitest';

import { proxyAviationWeather } from '../../../api/_lib/aviationWeatherApiCore';

describe('proxyAviationWeather', () => {
  it('returns 400 when type or icao is missing', async () => {
    const r = await proxyAviationWeather({});
    expect(r.status).toBe(400);
  });

  it('returns 400 for invalid type', async () => {
    const r = await proxyAviationWeather({ type: 'sigmet', icao: 'RJTT' });
    expect(r.status).toBe(400);
  });

  it('returns 400 for ICAO length outside 3–4', async () => {
    const r = await proxyAviationWeather({ type: 'metar', icao: 'R' });
    expect(r.status).toBe(400);
  });
});
