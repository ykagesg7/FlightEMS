import { describe, it, expect } from 'vitest';
import { calculateOffsetPoint } from '../../utils/offset';

describe('calculateOffsetPoint', () => {
  it('returns the same coordinates when distance is 0 NM', () => {
    const lat = 35.5;
    const lon = 139.75;
    const p = calculateOffsetPoint(lat, lon, 12, 0);
    expect(p.lat).toBeCloseTo(lat, 10);
    expect(p.lon).toBeCloseTo(lon, 10);
  });

  it('moves north (true) when magnetic bearing equals declination (8°)', () => {
    const lat = 35;
    const lon = 135;
    const p = calculateOffsetPoint(lat, lon, 8, 1);
    expect(p.lat).toBeGreaterThan(lat);
    expect(Math.abs(p.lon - lon)).toBeLessThan(0.02);
  });
});
