import { describe, expect, it } from 'vitest';
import {
  describeAircraftPerformance,
  getAircraftPreset,
  resolveAircraftPreset,
} from '../../data/aircraftPresets';
import { computeNavLog } from '../../pages/planning/nav/computeNavLog';

const t4 = getAircraftPreset('t4');

const POINTS = [
  { id: 'RJFF', latitude: 33.5844, longitude: 130.451, elevationFt: 32 },
  { id: 'RJTT', latitude: 35.5494, longitude: 139.7798, elevationFt: 21 },
];

function basePlan() {
  return {
    speed: 250,
    altitude: 30_000,
    departureTime: '10:00',
    groundTempC: 15,
    groundElevationFt: 32,
    aircraftId: 't4',
    initialFuelLb: 5000,
    taxiFuelLb: 200,
    reserveFuelLb: 800,
  };
}

describe('T-4 preset (instructor-provided values)', () => {
  it('carries the instructor climb/descent/cruise figures', () => {
    expect(t4?.climb?.targetCasKt).toBe(300);
    expect(t4?.climb?.targetMach).toBe(0.65);
    expect(t4?.climb?.fuelFlowLbPerHr).toBe(4000);
    expect(t4?.climb?.ratesFpm.every((point) => point.fpm === 3000)).toBe(true);
    expect(t4?.descent?.targetCasKt).toBe(300);
    expect(t4?.descent?.ratesFpm[0].fpm).toBe(3000);
    expect(t4?.descent?.idleRatesFpm?.[0].fpm).toBe(6000);
    expect(t4?.descent?.fuelFlowLbPerHr).toBe(2000);
    expect(t4?.cruiseFuelFlowLbPerHr).toBe(2200);
    expect(t4?.serviceCeilingFt).toBe(40_000);
  });
});

describe('resolveAircraftPreset', () => {
  it('returns preset defaults when no overrides are given', () => {
    const resolved = resolveAircraftPreset(t4);
    expect(resolved?.climb?.targetCasKt).toBe(300);
    expect(resolved?.descent?.ratesFpm[0].fpm).toBe(3000);
  });

  it('applies numeric overrides', () => {
    const resolved = resolveAircraftPreset(t4, {
      climbCasKt: 280,
      climbRateFpm: 2500,
      climbFuelFlowLbPerHr: 4200,
      descentFuelFlowLbPerHr: 1800,
      cruiseFuelFlowLbPerHr: 2400,
      serviceCeilingFt: 45_000,
    });
    expect(resolved?.climb?.targetCasKt).toBe(280);
    expect(resolved?.climb?.ratesFpm).toEqual([{ altitudeFt: 0, fpm: 2500 }]);
    expect(resolved?.climb?.fuelFlowLbPerHr).toBe(4200);
    expect(resolved?.descent?.fuelFlowLbPerHr).toBe(1800);
    expect(resolved?.cruiseFuelFlowLbPerHr).toBe(2400);
    expect(resolved?.serviceCeilingFt).toBe(45_000);
  });

  it('ignores zero, negative and non-finite overrides', () => {
    const resolved = resolveAircraftPreset(t4, {
      climbCasKt: 0,
      climbRateFpm: -100,
      cruiseFuelFlowLbPerHr: Number.NaN,
    });
    expect(resolved?.climb?.targetCasKt).toBe(300);
    expect(resolved?.climb?.ratesFpm[0].fpm).toBe(3000);
    expect(resolved?.cruiseFuelFlowLbPerHr).toBe(2200);
  });

  it('switches to the idle descent table when requested', () => {
    expect(resolveAircraftPreset(t4, undefined, 'idle')?.descent?.ratesFpm[0].fpm).toBe(6000);
    expect(resolveAircraftPreset(t4, { descentIdleRateFpm: 5000 }, 'idle')?.descent?.ratesFpm[0].fpm).toBe(5000);
    expect(resolveAircraftPreset(t4, { descentIdleRateFpm: 5000 }, 'standard')?.descent?.ratesFpm[0].fpm).toBe(3000);
  });

  it('describes effective values per descent mode', () => {
    expect(describeAircraftPerformance(t4, 'standard').descentRateFpm).toBe(3000);
    expect(describeAircraftPerformance(t4, 'idle').descentRateFpm).toBe(6000);
    expect(describeAircraftPerformance(undefined).climbCasKt).toBe(0);
  });
});

describe('computeNavLog honours performance overrides', () => {
  it('a faster climb rate reaches TOC sooner', () => {
    const slow = computeNavLog({
      plan: { ...basePlan(), performanceOverrides: { climbRateFpm: 1500 } },
      points: POINTS,
      includeVerticalProfile: true,
    });
    const fast = computeNavLog({
      plan: { ...basePlan(), performanceOverrides: { climbRateFpm: 6000 } },
      points: POINTS,
      includeVerticalProfile: true,
    });
    expect(fast.tocDistanceNm).toBeLessThan(slow.tocDistanceNm ?? 0);
  });

  it('idle descent starts later and shortens the descent phase', () => {
    const descentPhase = (mode: 'standard' | 'idle') => {
      const log = computeNavLog({
        plan: { ...basePlan(), descentMode: mode },
        points: POINTS,
        includeVerticalProfile: true,
      });
      const legs = log.segments.filter((segment) => segment.phase === 'descent');
      return {
        todDistanceNm: log.todDistanceNm ?? 0,
        distanceNm: legs.reduce((sum, leg) => sum + leg.distance, 0),
        fuelLb: legs.reduce((sum, leg) => sum + (leg.fuelUsedLb ?? 0), 0),
      };
    };

    const standard = descentPhase('standard');
    const idle = descentPhase('idle');

    expect(idle.todDistanceNm).toBeGreaterThan(standard.todDistanceNm);
    expect(idle.distanceNm).toBeLessThan(standard.distanceNm);
    expect(idle.fuelLb).toBeLessThan(standard.fuelLb);
  });

  it('flags cruise above the service ceiling and fuel above max', () => {
    const ok = computeNavLog({ plan: basePlan(), points: POINTS });
    expect(ok.aboveServiceCeiling).toBe(false);
    expect(ok.aboveMaxFuel).toBe(false);

    const tooHigh = computeNavLog({
      plan: { ...basePlan(), altitude: 45_000, initialFuelLb: 9000 },
      points: POINTS,
    });
    expect(tooHigh.aboveServiceCeiling).toBe(true);
    expect(tooHigh.aboveMaxFuel).toBe(true);
  });
});
