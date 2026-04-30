import type { FlightPlan } from '../../../types';
import type { TrackPoint } from '../tracks/types';

export function routeTrackPointsFromPlan(plan: FlightPlan): TrackPoint[] {
  const now = Date.now();
  const points: TrackPoint[] = [];
  if (plan.departure) {
    points.push({
      timestamp: new Date(now).toISOString(),
      latitude: plan.departure.latitude,
      longitude: plan.departure.longitude,
      altitudeFt: plan.altitude,
      source: 'json',
    });
  }
  plan.waypoints.forEach((waypoint, index) => {
    points.push({
      timestamp: new Date(now + (index + 1) * 60_000).toISOString(),
      latitude: waypoint.latitude,
      longitude: waypoint.longitude,
      altitudeFt: plan.altitude,
      source: 'json',
    });
  });
  if (plan.arrival) {
    points.push({
      timestamp: new Date(now + (points.length + 1) * 60_000).toISOString(),
      latitude: plan.arrival.latitude,
      longitude: plan.arrival.longitude,
      altitudeFt: plan.altitude,
      source: 'json',
    });
  }
  return points;
}
