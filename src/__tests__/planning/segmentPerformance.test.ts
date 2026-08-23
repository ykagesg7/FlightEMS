import { describe, expect, it } from 'vitest';
import { computeNavLog } from '../../pages/planning/nav/computeNavLog';

describe('segmentOverrides', () => {
  it('applies cas/altitude override on a matching geometric leg', () => {
    const log = computeNavLog({
      plan: {
        speed: 250,
        altitude: 30_000,
        departureTime: '10:00',
        groundTempC: 15,
        groundElevationFt: 0,
        segmentOverrides: { 'AAAA->BBBB': { casKt: 220, altitudeFt: 4500 } },
        aircraftId: 't4',
        initialFuelLb: 5000,
        taxiFuelLb: 200,
        reserveFuelLb: 800,
        cruiseFuelFlowLbPerHr: 2200,
      },
      points: [
        { id: 'AAAA', latitude: 35.0, longitude: 135.0, elevationFt: 0 },
        { id: 'BBBB', latitude: 35.2, longitude: 135.4, elevationFt: 0 },
      ],
      includeVerticalProfile: false,
    });
    expect(log.segments[0].speed).toBe(220);
    expect(log.segments[0].altitude).toBe(4500);
  });
});
