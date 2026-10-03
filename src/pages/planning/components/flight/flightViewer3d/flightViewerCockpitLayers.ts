import type { Viewer } from 'cesium';
import type { Waypoint3D } from './types';

const ROUTE_ENTITY_PREFIX = 'flight-viewer-route-';

/** コックピットでは進行方向の次 1〜2 ウェイポイントの地上ラベルを常時表示 */
export function updateCockpitWaypointLabelVisibility(
  viewer: Viewer,
  waypoints: Waypoint3D[],
  routeFraction: number,
): void {
  const n = waypoints.length;
  if (n === 0) return;
  const progressIdx = Math.min(n - 1, Math.max(0, Math.floor(routeFraction * (n - 1))));
  for (let i = 0; i < n; i++) {
    const entity = viewer.entities.getById(`${ROUTE_ENTITY_PREFIX}wp-ground-${i}`);
    if (!entity) continue;
    entity.show = i >= progressIdx && i <= progressIdx + 2;
  }
  for (let i = 0; i < n; i++) {
    const drop = viewer.entities.getById(`${ROUTE_ENTITY_PREFIX}drop-${i}`);
    if (!drop) continue;
    drop.show = i >= progressIdx && i <= progressIdx + 2;
  }
}
