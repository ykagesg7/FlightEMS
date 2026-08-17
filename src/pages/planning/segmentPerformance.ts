import type { RouteSegment } from '../../types';

export function inheritSegmentPerformance(
  prevSegments: RouteSegment[] | undefined,
  from: string,
  to: string,
  fallbackSpeed: number,
  fallbackAltitude: number,
): { speed: number; altitude: number } {
  const prev = prevSegments?.find((s) => s.from === from && s.to === to);
  const speed =
    prev != null && Number.isFinite(prev.speed) && prev.speed > 0 ? prev.speed : fallbackSpeed;
  const altitude =
    prev != null && Number.isFinite(prev.altitude) && prev.altitude >= 0
      ? prev.altitude
      : fallbackAltitude;
  return { speed, altitude };
}
