import type { FlightPlan } from '../../../types';
import type { FlightTrack, TrackDeviationSummary, TrackPoint } from './types';
import { alongTrackDistanceNm, crossTrackDistanceNm, distanceNm } from './geoMath';

type RoutePoint = { name: string; latitude: number; longitude: number };

function routePointsFromPlan(plan: FlightPlan): RoutePoint[] {
  const points: RoutePoint[] = [];
  if (plan.departure) {
    points.push({ name: plan.departure.name || plan.departure.value, latitude: plan.departure.latitude, longitude: plan.departure.longitude });
  }
  plan.waypoints.forEach((waypoint) => {
    points.push({ name: waypoint.name || waypoint.id, latitude: waypoint.latitude, longitude: waypoint.longitude });
  });
  if (plan.arrival) {
    points.push({ name: plan.arrival.name || plan.arrival.value, latitude: plan.arrival.latitude, longitude: plan.arrival.longitude });
  }
  return points.filter((point) => Number.isFinite(point.latitude) && Number.isFinite(point.longitude));
}

function nearestCrossTrackNm(point: TrackPoint, route: RoutePoint[]): number | null {
  if (route.length < 2) return null;
  let nearest: number | null = null;
  for (let index = 0; index < route.length - 1; index += 1) {
    const start = route[index];
    const end = route[index + 1];
    const segmentLength = distanceNm(start, end);
    const along = alongTrackDistanceNm(point, start, end);
    const distance =
      along < 0
        ? distanceNm(point, start)
        : along > segmentLength
          ? distanceNm(point, end)
          : crossTrackDistanceNm(point, start, end);
    nearest = nearest === null ? distance : Math.min(nearest, distance);
  }
  return nearest;
}

export function analyzeTrackAgainstPlan(track: FlightTrack, plan: FlightPlan): TrackDeviationSummary {
  const route = routePointsFromPlan(plan);
  const deviations = track.points
    .map((point) => nearestCrossTrackNm(point, route))
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

  const altitudes = track.points
    .map((point) => point.altitudeFt)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

  const waypointPassages = route.map((waypoint) => {
    const nearest = track.points.reduce<{ point: TrackPoint | null; distance: number }>(
      (best, point) => {
        const distance = distanceNm(point, waypoint);
        return distance < best.distance ? { point, distance } : best;
      },
      { point: null, distance: Number.POSITIVE_INFINITY }
    );
    return nearest.point && nearest.distance <= 3
      ? { name: waypoint.name, timestamp: nearest.point.timestamp, distanceNm: nearest.distance }
      : null;
  }).filter((value): value is NonNullable<typeof value> => Boolean(value));

  return {
    trackId: track.id,
    trackName: track.name,
    pointCount: track.points.length,
    maxCrossTrackNm: deviations.length ? Math.max(...deviations) : null,
    averageCrossTrackNm: deviations.length ? deviations.reduce((sum, value) => sum + value, 0) / deviations.length : null,
    withinOneNmPercent: deviations.length ? (deviations.filter((value) => value <= 1).length / deviations.length) * 100 : null,
    minAltitudeFt: altitudes.length ? Math.min(...altitudes) : null,
    maxAltitudeFt: altitudes.length ? Math.max(...altitudes) : null,
    waypointPassages,
  };
}

export function analyzeTracksAgainstPlan(tracks: FlightTrack[], plan: FlightPlan): TrackDeviationSummary[] {
  return tracks.filter((track) => track.points.length > 1).map((track) => analyzeTrackAgainstPlan(track, plan));
}
