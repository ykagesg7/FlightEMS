import type { Airport, FlightPlan, Waypoint } from '../../../types';

export type NavPoint = {
  id: string;
  latitude: number;
  longitude: number;
  elevationFt?: number;
};

export function getPointId(point: Airport | Waypoint): string {
  if ('coordinates' in point && typeof (point as Waypoint).id === 'string') {
    return (point as Waypoint).id;
  }
  const airport = point as Airport;
  const propertiesId = airport.properties?.id;
  return (typeof propertiesId === 'string' ? propertiesId : '') || airport.value || '';
}

function elevationFromAirport(airport: Airport | undefined): number | undefined {
  const raw = airport?.properties?.['Elev(ft)'];
  const n = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : undefined;
}

export function collectNavPoints(
  plan: Pick<FlightPlan, 'departure' | 'arrival' | 'waypoints' | 'groundElevationFt'>,
): NavPoint[] {
  const points: NavPoint[] = [];
  if (plan.departure) {
    points.push({
      id: getPointId(plan.departure),
      latitude: plan.departure.latitude,
      longitude: plan.departure.longitude,
      elevationFt: elevationFromAirport(plan.departure) ?? plan.groundElevationFt,
    });
  }
  for (const wp of plan.waypoints) {
    points.push({
      id: getPointId(wp),
      latitude: wp.latitude,
      longitude: wp.longitude,
    });
  }
  if (plan.arrival) {
    points.push({
      id: getPointId(plan.arrival),
      latitude: plan.arrival.latitude,
      longitude: plan.arrival.longitude,
      elevationFt: elevationFromAirport(plan.arrival),
    });
  }
  return points;
}

export function segmentOverrideKey(from: string, to: string): string {
  return `${from}->${to}`;
}

export function interpolateLatLon(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  fraction: number,
): { latitude: number; longitude: number } {
  const t = Math.min(1, Math.max(0, fraction));
  return {
    latitude: lat1 + (lat2 - lat1) * t,
    longitude: lon1 + (lon2 - lon1) * t,
  };
}
