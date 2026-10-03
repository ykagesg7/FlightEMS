import { describe, expect, it } from 'vitest';
import { buildAheadGroundRouteCartographics } from '../../pages/planning/components/flight/flightViewer3d/flightViewerGroundRoute';
import type { Waypoint3D } from '../../pages/planning/components/flight/flightViewer3d/types';

const RJFA_ROUTE: Waypoint3D[] = [
  { name: 'RJFA', lat: 33.8814, lon: 130.6517, altFt: 5000 },
  { name: 'wp1', lat: 33.6381, lon: 130.8067, altFt: 5000 },
  { name: 'wp2', lat: 33.5981, lon: 131.1881, altFt: 5000 },
  { name: 'RJFZ', lat: 33.685, lon: 131.0403, altFt: 5000 },
];

describe('buildAheadGroundRouteCartographics', () => {
  it('starts at aircraft position and includes dense samples to destination', () => {
    const fromLon = 130.72;
    const fromLat = 33.76;
    const carts = buildAheadGroundRouteCartographics(fromLon, fromLat, RJFA_ROUTE);
    expect(carts.length).toBeGreaterThan(20);
    expect(carts[0]!.longitude).toBeCloseTo((fromLon * Math.PI) / 180, 4);
    expect(carts[0]!.latitude).toBeCloseTo((fromLat * Math.PI) / 180, 4);
    const last = RJFA_ROUTE[RJFA_ROUTE.length - 1]!;
    const end = carts[carts.length - 1]!;
    expect(end.longitude).toBeCloseTo((last.lon * Math.PI) / 180, 4);
    expect(end.latitude).toBeCloseTo((last.lat * Math.PI) / 180, 4);
  });
});
