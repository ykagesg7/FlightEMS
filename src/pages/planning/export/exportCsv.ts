import type { FlightPlan } from '../../../types';
import { routeTrackPointsFromPlan } from './routePoints';
import type { FlightTrack, TrackPoint } from '../tracks/types';

function pointsToCsv(points: TrackPoint[]): string {
  const header = 'timestamp,lat,lon,altitude_ft,ground_speed_kt,track_deg';
  const rows = points.map((point) => [
    point.timestamp,
    point.latitude.toFixed(7),
    point.longitude.toFixed(7),
    point.altitudeFt?.toFixed(0) ?? '',
    point.groundSpeedKt?.toFixed(1) ?? '',
    point.trackDeg?.toFixed(0) ?? '',
  ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','));
  return [header, ...rows].join('\n');
}

export function exportFlightTrackToCsv(track: FlightTrack): string {
  return pointsToCsv(track.points);
}

export function exportFlightPlanToCsv(plan: FlightPlan): string {
  return pointsToCsv(routeTrackPointsFromPlan(plan));
}
