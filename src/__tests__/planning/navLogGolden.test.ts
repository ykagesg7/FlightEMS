import { describe, expect, it } from 'vitest';
import { computeNavLog } from '../../pages/planning/nav/computeNavLog';
import type { Airport, FlightPlan } from '../../types';

function airport(id: string, lat: number, lon: number, elevFt: number): Airport {
  return {
    value: id,
    label: id,
    name: id,
    type: 'civilian',
    latitude: lat,
    longitude: lon,
    properties: { id, 'Elev(ft)': elevFt },
  };
}

/** 福岡・広島・羽田の概位 */
const RJFF = airport('RJFF', 33.5844, 130.451, 32);
const RJOA = airport('RJOA', 34.4361, 132.9194, 1086);
const RJTT = airport('RJTT', 35.5494, 139.7798, 21);

function basePlan(over: Partial<FlightPlan> = {}): FlightPlan {
  return {
    departure: RJFF,
    arrival: RJTT,
    waypoints: [
      {
        id: 'RJOA',
        name: 'RJOA',
        type: 'airport',
        latitude: RJOA.latitude,
        longitude: RJOA.longitude,
        coordinates: [RJOA.longitude, RJOA.latitude],
      },
    ],
    speed: 250,
    altitude: 30_000,
    departureTime: '10:00',
    groundTempC: 15,
    groundElevationFt: 32,
    totalDistance: 0,
    ete: '',
    eta: '',
    tas: 0,
    mach: 0,
    routeSegments: [],
    aircraftId: 't4',
    initialFuelLb: 5000,
    taxiFuelLb: 200,
    reserveFuelLb: 800,
    cruiseFuelFlowLbPerHr: 2200,
    ...over,
  };
}

describe('navLogGolden RJFF-RJOA-RJTT (cruise, no wind)', () => {
  it('matches Phase 1 cruise-only snapshot and fuel identity', () => {
    const plan = basePlan();
    const points = [
      { id: 'RJFF', latitude: RJFF.latitude, longitude: RJFF.longitude, elevationFt: 32 },
      { id: 'RJOA', latitude: RJOA.latitude, longitude: RJOA.longitude, elevationFt: 1086 },
      { id: 'RJTT', latitude: RJTT.latitude, longitude: RJTT.longitude, elevationFt: 21 },
    ];
    const log = computeNavLog({ plan, points, includeVerticalProfile: false });

    expect(log.segments).toHaveLength(2);
    expect(log.segments[0].from).toBe('RJFF');
    expect(log.segments[0].to).toBe('RJOA');
    expect(log.segments[1].from).toBe('RJOA');
    expect(log.segments[1].to).toBe('RJTT');

    expect(log.totalDistanceNm).toBeGreaterThan(470);
    expect(log.totalDistanceNm).toBeLessThan(485);
    expect(log.segments[0].distance + log.segments[1].distance).toBeCloseTo(log.totalDistanceNm, 6);

    expect(log.tasKt).toBeGreaterThan(380);
    expect(log.tasKt).toBeLessThan(450);
    expect(log.eta).toMatch(/^\d{2}:\d{2}$/);
    expect(log.ete).toMatch(/^\d{2}:\d{2}$/);

    expect(log.totalFuelUsedLb + log.totalFuelRemainingLb).toBeCloseTo(5000, 5);
    expect(log.totalFuelUsedLb).toBeGreaterThan(200);
    expect(log.totalFuelUsedLb).toBeLessThan(5000);

    expect(log.segments[0].trueCourseDeg).toBeDefined();
    expect(log.segments[0].magneticHeadingDeg).toBeDefined();
    expect(log.segments[0].phase).toBe('cruise');
  });

  it('wraps ETA past midnight', () => {
    const log = computeNavLog({
      plan: basePlan({ departureTime: '23:00' }),
      points: [
        { id: 'RJFF', latitude: RJFF.latitude, longitude: RJFF.longitude, elevationFt: 32 },
        { id: 'RJTT', latitude: RJTT.latitude, longitude: RJTT.longitude, elevationFt: 21 },
      ],
      includeVerticalProfile: false,
    });
    const [hh] = log.eta.split(':').map(Number);
    expect(hh).toBeLessThan(24);
  });
});
