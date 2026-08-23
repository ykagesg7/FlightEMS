import { describe, expect, it } from 'vitest';
import { calculateDistance } from '../../utils/index';

describe('calculateDistance', () => {
  it('returns ~478 nm for RJTT–RJFF great-circle', () => {
    // Haneda / Fukuoka published aerodrome reference points (approx.)
    const rjtt = { lat: 35.5533, lon: 139.7811 };
    const rjff = { lat: 33.5859, lon: 130.4510 };
    const nm = calculateDistance(rjtt.lat, rjtt.lon, rjff.lat, rjff.lon);
    expect(nm).toBeGreaterThan(470);
    expect(nm).toBeLessThan(490);
  });

  it('returns 0 for identical points', () => {
    expect(calculateDistance(35.0, 139.0, 35.0, 139.0)).toBe(0);
  });

  it('is symmetric', () => {
    const a = calculateDistance(35.0, 139.0, 34.0, 135.0);
    const b = calculateDistance(34.0, 135.0, 35.0, 139.0);
    expect(a).toBeCloseTo(b, 6);
  });
});
