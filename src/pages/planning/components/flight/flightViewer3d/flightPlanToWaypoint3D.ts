import type { Airport, FlightPlan } from '../../../../../types';
import type { Waypoint3D } from './types';
import { labelForFlightNode } from '../../../utils/waypointDisplayName';

function airportElevFt(airport: Airport | undefined): number {
  const raw = airport?.properties?.['Elev(ft)'];
  const n = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : 0;
}

/**
 * Planning の FlightPlan から 3D プレビュー用ウェイポイント列を作る。
 */
export function flightPlanToWaypoint3D(plan: FlightPlan): Waypoint3D[] | null {
  const nodes: Array<{ name: string; lat: number; lon: number; altFt: number; speedKts?: number }> =
    [];
  const cruiseAlt = plan.altitude > 0 ? plan.altitude : 3000;
  const defaultSpeed = plan.speed > 0 ? plan.speed : 120;

  if (plan.departure) {
    nodes.push({
      name: labelForFlightNode(plan.departure),
      lat: plan.departure.latitude,
      lon: plan.departure.longitude,
      altFt: airportElevFt(plan.departure) || plan.groundElevationFt || 0,
      speedKts: defaultSpeed,
    });
  }
  for (let i = 0; i < (plan.waypoints ?? []).length; i++) {
    const wp = plan.waypoints[i]!;
    nodes.push({
      name: labelForFlightNode(wp, i),
      lat: wp.latitude,
      lon: wp.longitude,
      altFt: cruiseAlt,
      speedKts: defaultSpeed,
    });
  }
  if (plan.arrival) {
    const segToArrival = plan.routeSegments[plan.routeSegments.length - 1];
    const endAlt =
      typeof segToArrival?.endAltitudeFt === 'number'
        ? segToArrival.endAltitudeFt
        : typeof segToArrival?.altitude === 'number'
          ? segToArrival.altitude
          : airportElevFt(plan.arrival);
    nodes.push({
      name: labelForFlightNode(plan.arrival),
      lat: plan.arrival.latitude,
      lon: plan.arrival.longitude,
      altFt: endAlt,
      speedKts: defaultSpeed,
    });
  }

  if (nodes.length < 2) return null;
  return nodes;
}
