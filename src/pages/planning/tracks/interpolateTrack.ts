import type { FlightTrack, TrackPoint } from './types';
import { bearingDeg } from './geoMath';

export const MAX_INTERPOLATION_GAP_MS = 5 * 60 * 1000;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function maybeLerp(a: number | undefined, b: number | undefined, t: number): number | undefined {
  if (typeof a !== 'number' || typeof b !== 'number') return undefined;
  return lerp(a, b, t);
}

export function getTrackTimeRange(tracks: FlightTrack[]): { start: number; end: number } | null {
  const times = tracks
    .flatMap((track) => track.points.map((point) => new Date(point.timestamp).getTime()))
    .filter(Number.isFinite);
  if (!times.length) return null;
  return { start: Math.min(...times), end: Math.max(...times) };
}

export function interpolateTrackPoint(track: FlightTrack, currentTime: number): TrackPoint | null {
  const points = track.points;
  if (points.length === 0) return null;
  const firstTime = new Date(points[0].timestamp).getTime();
  const lastTime = new Date(points[points.length - 1].timestamp).getTime();
  if (currentTime < firstTime || currentTime > lastTime) return null;

  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const currentMs = new Date(current.timestamp).getTime();
    const nextMs = new Date(next.timestamp).getTime();
    if (currentTime === currentMs) return current;
    if (currentTime >= currentMs && currentTime <= nextMs) {
      if (nextMs - currentMs > MAX_INTERPOLATION_GAP_MS) return null;
      const ratio = (currentTime - currentMs) / (nextMs - currentMs || 1);
      return {
        timestamp: new Date(currentTime).toISOString(),
        latitude: lerp(current.latitude, next.latitude, ratio),
        longitude: lerp(current.longitude, next.longitude, ratio),
        altitudeFt: maybeLerp(current.altitudeFt, next.altitudeFt, ratio),
        groundSpeedKt: maybeLerp(current.groundSpeedKt, next.groundSpeedKt, ratio),
        trackDeg: current.trackDeg ?? next.trackDeg ?? bearingDeg(current, next),
        source: current.source,
      };
    }
  }

  return points[points.length - 1] ?? null;
}
