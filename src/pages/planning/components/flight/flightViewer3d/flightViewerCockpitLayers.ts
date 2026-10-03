import type { Viewer } from 'cesium';
import type { Waypoint3D } from './types';
import { routeLegProjectionAtPosition } from './flightViewer3dMath';

const ROUTE_ENTITY_PREFIX = 'flight-viewer-route-';

/** コックピットでは進行方向の次 2 ウェイポイントの地上ラベル・ドロップ線を表示 */
export function updateCockpitWaypointLabelVisibility(
  viewer: Viewer,
  waypoints: Waypoint3D[],
  lon: number,
  lat: number,
): void {
  const n = waypoints.length;
  if (n === 0) return;
  const { legIndex } = routeLegProjectionAtPosition(lat, lon, waypoints);
  const nextWp = Math.min(n - 1, legIndex + 1);
  const lastVisible = Math.min(n - 1, nextWp + 1);
  for (let i = 0; i < n; i++) {
    const entity = viewer.entities.getById(`${ROUTE_ENTITY_PREFIX}wp-ground-${i}`);
    if (!entity) continue;
    entity.show = i >= nextWp && i <= lastVisible;
  }
  for (let i = 0; i < n; i++) {
    const drop = viewer.entities.getById(`${ROUTE_ENTITY_PREFIX}drop-${i}`);
    if (!drop) continue;
    drop.show = i >= nextWp && i <= lastVisible;
  }
}
