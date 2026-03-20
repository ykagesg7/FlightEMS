import { describe, expect, it } from 'vitest';
import { createInitialFlightPlan } from '../../pages/planning/createInitialFlightPlan';
import { fromPlanDocument, toPlanDocument } from '../../utils/planDocument';
import type { Airport, FlightPlan, RouteSegment, Waypoint } from '../../types/index';

describe('planDocument', () => {
  it('round-trips core FlightPlan fields', () => {
    const base = createInitialFlightPlan();
    const departure: Airport = {
      value: 'dep',
      label: 'DEP',
      name: 'Departure',
      type: 'civilian',
      latitude: 35,
      longitude: 139,
    };
    const arrival: Airport = {
      value: 'arr',
      label: 'ARR',
      name: 'Arrival',
      type: 'civilian',
      latitude: 34,
      longitude: 138,
    };
    const waypoints: Waypoint[] = [
      {
        id: 'w1',
        name: 'WP1',
        type: 'custom',
        coordinates: [139.1, 35.1],
        latitude: 35.1,
        longitude: 139.1,
      },
    ];
    const routeSegments: RouteSegment[] = [
      {
        from: 'DEP',
        to: 'WP1',
        speed: 200,
        bearing: 90,
        altitude: 10000,
        eta: '10:00:00',
        distance: 50,
        duration: '00:15:00',
        fuelUsedLb: 100,
        fuelRemainingLb: 4900,
        frequency: '123.45',
      },
    ];
    const plan: FlightPlan = {
      ...base,
      departure,
      arrival,
      waypoints,
      routeSegments,
      altitude: 12000,
      speed: 220,
      totalDistance: 120.5,
      ete: '01:02:03',
      eta: '12:00:00',
      departureTime: '10:58',
      aircraftId: 't4',
      initialFuelLb: 4200,
      taxiFuelLb: 150,
      reserveFuelLb: 900,
      cruiseFuelFlowLbPerHr: 2000,
      totalFuelUsedLb: 300,
      totalFuelRemainingLb: 3900,
    };

    const doc = toPlanDocument(plan);
    const restored = fromPlanDocument(doc);
    expect(restored).not.toBeNull();
    expect(restored!.departure?.value).toBe('dep');
    expect(restored!.arrival?.value).toBe('arr');
    expect(restored!.waypoints).toHaveLength(1);
    expect(restored!.waypoints[0].id).toBe('w1');
    expect(restored!.routeSegments).toHaveLength(1);
    expect(restored!.routeSegments[0].from).toBe('DEP');
    expect(restored!.aircraftId).toBe('t4');
    expect(restored!.initialFuelLb).toBe(4200);
    expect(restored!.cruiseFuelFlowLbPerHr).toBe(2000);
    expect(restored!.totalDistance).toBe(120.5);
    expect(restored!.departureTime).toBe('10:58');
  });

  it('fromPlanDocument returns null for invalid input', () => {
    expect(fromPlanDocument(null)).toBeNull();
    expect(fromPlanDocument({})).toBeNull();
    expect(fromPlanDocument({ schemaVersion: 2, planInput: {} })).toBeNull();
  });
});
