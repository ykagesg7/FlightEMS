import { describe, expect, it } from 'vitest';
import { interpolateJapanMagneticVariationWestDeg } from '../../utils/japanMagneticVariation';

describe('japanMagneticVariation', () => {
  it('is near 7.8°W at Tokyo', () => {
    expect(interpolateJapanMagneticVariationWestDeg(35.553, 139.781)).toBeCloseTo(7.8, 1);
  });

  it('is higher in Hokkaido than Okinawa', () => {
    const north = interpolateJapanMagneticVariationWestDeg(43.0, 141.4);
    const south = interpolateJapanMagneticVariationWestDeg(26.2, 127.65);
    expect(north).toBeGreaterThan(south);
  });
});
