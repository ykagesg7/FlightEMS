import { calculateMagneticBearing } from '../../../../utils/bearing';
import type { PlanningMapNavaid } from './planningMapTypes';

export type LatLngLike = { lat: number; lng: number };

export type CursorNavaidDistance = {
  bearing: number;
  distanceNm: number;
  id: string;
  name: string;
};

/** 2点間距離（メートル）。Haversine。 */
export function distanceMeters(a: LatLngLike, b: LatLngLike): number {
  const R = 6371000;
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  return 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

/** カーソル位置から最も近い NAVAID の id。無い場合 null。 */
export function findNearestNavaidId(
  cursor: LatLngLike,
  navaids: PlanningMapNavaid[],
): string | null {
  if (navaids.length === 0) return null;
  let bestId: string | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const n of navaids) {
    const d = distanceMeters(cursor, n.coordinates);
    if (d < bestDist) {
      bestDist = d;
      bestId = n.id;
    }
  }
  return bestId;
}

/** 選択 NAVAID からカーソルへの磁方位・距離（NM）。 */
export function computeCursorNavaidDistance(
  cursor: LatLngLike,
  navaid: PlanningMapNavaid,
): CursorNavaidDistance {
  const distM = distanceMeters(cursor, navaid.coordinates);
  const bearing = calculateMagneticBearing(
    navaid.coordinates.lat,
    navaid.coordinates.lng,
    cursor.lat,
    cursor.lng,
  );
  return {
    bearing,
    distanceNm: parseFloat((distM / 1852).toFixed(1)),
    id: navaid.id,
    name: navaid.name,
  };
}

/** クエリで NAVAID 一覧をフィルタ（id / name、最大件数）。 */
export function filterNavaidsByQuery(
  navaids: PlanningMapNavaid[],
  query: string,
  limit = 40,
): PlanningMapNavaid[] {
  const q = query.trim().toLowerCase();
  const sorted = [...navaids].sort((a, b) => a.id.localeCompare(b.id));
  if (!q) return sorted.slice(0, limit);
  return sorted
    .filter(
      (n) =>
        n.id.toLowerCase().includes(q) ||
        (n.name?.toLowerCase().includes(q) ?? false),
    )
    .slice(0, limit);
}
