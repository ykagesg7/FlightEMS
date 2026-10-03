import { Cartesian3 } from 'cesium';
import type { Waypoint3D } from './types';

/** 連続する同一座標を除き、clampToGround ポリライン向けに最低 2 点を保証 */
export function dedupeConsecutiveGroundPositions(waypoints: Waypoint3D[]): Cartesian3[] {
  const out: Cartesian3[] = [];
  for (const w of waypoints) {
    const p = Cartesian3.fromDegrees(w.lon, w.lat);
    const last = out[out.length - 1];
    if (last && Cartesian3.equalsEpsilon(last, p, 1e-10)) continue;
    out.push(p);
  }
  return out;
}

export function dedupeConsecutiveCartesian3(positions: Cartesian3[]): Cartesian3[] {
  const out: Cartesian3[] = [];
  for (const p of positions) {
    const last = out[out.length - 1];
    if (last && Cartesian3.equalsEpsilon(last, p, 0.5)) continue;
    out.push(p);
  }
  return out;
}
