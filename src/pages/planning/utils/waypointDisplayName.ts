import type { Airport, FlightPlan, Waypoint } from '../../../types';
import { getPointId } from '../nav/navPoints';

const INTERNAL_CUSTOM_ID = /^custom-\d+$/i;

export function isInternalCustomWaypointId(id: string): boolean {
  return INTERNAL_CUSTOM_ID.test(id);
}

/** 座標モードなどで名前未設定時の短い表示 */
export function formatFallbackWaypointName(lat: number, lon: number, index: number): string {
  const latStr = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}`;
  const lonStr = `${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`;
  return `WP${index + 1} (${latStr} ${lonStr})`;
}

export function displayWaypointName(waypoint: Waypoint, index: number): string {
  const trimmed = waypoint.name?.trim();
  if (trimmed && trimmed !== waypoint.id && !INTERNAL_CUSTOM_ID.test(trimmed)) {
    return trimmed;
  }
  return formatFallbackWaypointName(waypoint.latitude, waypoint.longitude, index);
}

function airportLabel(airport: Airport): string {
  return airport.label?.trim() || airport.value?.trim() || airport.name?.trim() || getPointId(airport);
}

export function resolveNavPointLabel(
  plan: Pick<FlightPlan, 'departure' | 'arrival' | 'waypoints'>,
  pointId: string,
): string {
  if (pointId === 'TOC' || pointId === 'TOD') return pointId;
  if (plan.departure && getPointId(plan.departure) === pointId) {
    return airportLabel(plan.departure);
  }
  if (plan.arrival && getPointId(plan.arrival) === pointId) {
    return airportLabel(plan.arrival);
  }
  const wpIndex = plan.waypoints.findIndex((wp) => wp.id === pointId);
  if (wpIndex >= 0) {
    return displayWaypointName(plan.waypoints[wpIndex]!, wpIndex);
  }
  return pointId;
}

export function labelForFlightNode(node: Airport | Waypoint, waypointIndex?: number): string {
  if ('coordinates' in node && typeof (node as Waypoint).latitude === 'number') {
    const wp = node as Waypoint;
    return displayWaypointName(wp, waypointIndex ?? 0);
  }
  return airportLabel(node as Airport);
}
