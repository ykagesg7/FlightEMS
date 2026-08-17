import { pointInAltitudeBand, pointInPolygonRing } from './pointInPolygon';
import type { AirspaceRuntime } from './airspaceVolumes';

export function findOccupancy(
  airspaces: AirspaceRuntime[],
  lon: number,
  lat: number,
  altFt: number,
): string[] {
  const hits: string[] = [];
  for (const a of airspaces) {
    if (!pointInPolygonRing({ lon, lat }, a.ring)) continue;
    if (!a.altitudeKnown) {
      hits.push(`${a.label}（高度未収録）`);
      continue;
    }
    if (pointInAltitudeBand(altFt, a.minFt, a.maxFt)) {
      hits.push(a.label);
    }
  }
  return hits;
}
