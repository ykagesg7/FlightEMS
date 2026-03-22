import { describe, expect, it } from 'vitest';
import {
  groundSpeedKtFromWind,
  nearestHourlyTimeIndex,
  parseOpenMeteoHourAsUtc,
  pressureHpaForAltitudeFt,
} from '../../utils/routeOpenMeteoWind';

describe('routeOpenMeteoWind', () => {
  it('pressureHpaForAltitudeFt snaps to available levels', () => {
    const p = pressureHpaForAltitudeFt(30_000, [250, 300, 450, 700, 850]);
    expect([250, 300, 450]).toContain(p);
  });

  it('parseOpenMeteoHourAsUtc appends Z when missing', () => {
    const d = parseOpenMeteoHourAsUtc('2026-03-21T05:00');
    expect(d.getUTCHours()).toBe(5);
  });

  it('nearestHourlyTimeIndex picks closest slot', () => {
    const times = ['2026-03-21T00:00', '2026-03-21T02:00', '2026-03-21T04:00'];
    const ref = parseOpenMeteoHourAsUtc('2026-03-21T01:30');
    expect(nearestHourlyTimeIndex(times, ref)).toBe(1);
  });

  it('groundSpeedKtFromWind clamps minimum GS', () => {
    const gs = groundSpeedKtFromWind(100, 0, 50, 180);
    expect(gs).toBeGreaterThanOrEqual(20);
  });
});
