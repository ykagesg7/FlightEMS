import { describe, expect, it } from 'vitest';
import { interpolateJapanMagneticVariationWestDeg } from '../../utils/japanMagneticVariation';

describe('japanMagneticVariation', () => {
  it('matches GSI 2020.0 near Tokyo (RJTT ARP)', () => {
    expect(interpolateJapanMagneticVariationWestDeg(35.549678, 139.786958)).toBeCloseTo(7.53, 1);
  });

  it('is higher in Hokkaido than Okinawa', () => {
    const north = interpolateJapanMagneticVariationWestDeg(43.0, 141.4);
    const south = interpolateJapanMagneticVariationWestDeg(26.2, 127.65);
    expect(north).toBeGreaterThan(south);
  });
});
