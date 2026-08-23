import { describe, expect, it } from 'vitest';
import { aircraftPresets } from '../../data/aircraftPresets';
import { integrateClimb, integrateDescent, planClimbDescent } from '../../pages/planning/nav/computeVerticalProfile';
import { computeNavLog } from '../../pages/planning/nav/computeNavLog';

const t4 = aircraftPresets[0];

describe('computeVerticalProfile', () => {
  it('climb distance and time increase with altitude to gain', () => {
    const a = integrateClimb(0, 10_000, t4.climb!, 15, 0);
    const b = integrateClimb(0, 30_000, t4.climb!, 15, 0);
    expect(a.distanceNm).toBeGreaterThan(0);
    expect(b.distanceNm).toBeGreaterThan(a.distanceNm);
    expect(b.timeMin).toBeGreaterThan(a.timeMin);
  });

  it('descent integrates rate and TAS, so a steeper rate is shorter', () => {
    const standard = integrateDescent(30_000, 0, t4.descent!, 15, 0);
    expect(standard.distanceNm).toBeGreaterThan(0);
    expect(standard.timeMin).toBeCloseTo(30_000 / 3000, 5);

    const idle = integrateDescent(
      30_000,
      0,
      { ...t4.descent!, ratesFpm: t4.descent!.idleRatesFpm! },
      15,
      0,
    );
    expect(idle.timeMin).toBeLessThan(standard.timeMin);
    expect(idle.distanceNm).toBeLessThan(standard.distanceNm);
    expect(idle.fuelLb).toBeLessThan(standard.fuelLb);
  });

  it('places TOC before TOD on a long route', () => {
    const p = planClimbDescent(400, 32, 21, 30_000, t4.climb!, t4.descent!, 15, 32);
    expect(p.tocDistanceNm).toBeGreaterThan(0);
    expect(p.todDistanceNm).toBeGreaterThan(p.tocDistanceNm);
    expect(p.todDistanceNm).toBeLessThan(400);
    expect(p.hasCruise).toBe(true);
  });
});

describe('computeNavLog vertical split', () => {
  it('inserts TOC and TOD on RJFF–RJTT', () => {
    const log = computeNavLog({
      plan: {
        speed: 250,
        altitude: 30_000,
        departureTime: '10:00',
        groundTempC: 15,
        groundElevationFt: 32,
        aircraftId: 't4',
        initialFuelLb: 5000,
        taxiFuelLb: 200,
        reserveFuelLb: 800,
        cruiseFuelFlowLbPerHr: 2200,
      },
      points: [
        { id: 'RJFF', latitude: 33.5844, longitude: 130.451, elevationFt: 32 },
        { id: 'RJTT', latitude: 35.5494, longitude: 139.7798, elevationFt: 21 },
      ],
      includeVerticalProfile: true,
      preset: t4,
    });
    const labels = log.segments.flatMap((s) => [s.from, s.to]);
    expect(labels).toContain('TOC');
    expect(labels).toContain('TOD');
    expect(log.segments.some((s) => s.phase === 'climb')).toBe(true);
    expect(log.segments.some((s) => s.phase === 'descent')).toBe(true);
    expect(log.tocDistanceNm).toBeGreaterThan(0);
    expect(log.todDistanceNm).toBeGreaterThan(log.tocDistanceNm ?? 0);
  });
});
