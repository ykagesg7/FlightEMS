import {
  Cartesian3,
  Cartographic,
  Color,
  ColorMaterialProperty,
  ConstantProperty,
  ConstantPositionProperty,
  sampleTerrainMostDetailed,
  type Viewer,
} from 'cesium';
import type { Waypoint3D } from './types';
import { dedupeConsecutiveCartesian3 } from './flightViewerRouteGraphics';

const ROUTE_ENTITY_PREFIX = 'flight-viewer-route-';
const ROUTE_GROUND_POLYLINE_ID = 'flight-viewer-route-ground-line';
const GROUND_ROUTE_OFFSET_M = 10;
const GROUND_ROUTE_WIDTH = 10;

/** GSI 等で clampToGround が効かない場合の地上ルート（地形サンプル + オフセット） */
export async function applySampledGroundRoutePolyline(
  viewer: Viewer,
  waypoints: Waypoint3D[],
): Promise<void> {
  if (viewer.isDestroyed() || waypoints.length < 2) return;
  const entity = viewer.entities.getById(ROUTE_GROUND_POLYLINE_ID);
  if (!entity?.polyline) return;

  const carts = waypoints.map((w) => Cartographic.fromDegrees(w.lon, w.lat));
  let positions: Cartesian3[];
  try {
    const provider = viewer.terrainProvider;
    const sampled = await sampleTerrainMostDetailed(provider, carts);
    positions = dedupeConsecutiveCartesian3(
      sampled.map((c) =>
        Cartesian3.fromRadians(
          c.longitude,
          c.latitude,
          (c.height ?? 0) + GROUND_ROUTE_OFFSET_M,
        ),
      ),
    );
  } catch {
    positions = dedupeConsecutiveCartesian3(
      carts.map((c) =>
        Cartesian3.fromRadians(c.longitude, c.latitude, GROUND_ROUTE_OFFSET_M),
      ),
    );
  }

  if (positions.length < 2) return;

  entity.polyline.positions = new ConstantProperty(positions);
  entity.polyline.clampToGround = new ConstantProperty(false);
  entity.polyline.width = new ConstantProperty(GROUND_ROUTE_WIDTH);
  const magenta = Color.fromCssColorString('#FF00FF').withAlpha(0.95);
  entity.polyline.depthFailMaterial = new ColorMaterialProperty(magenta);
}

export function updateGroundWaypointPositionsFromTerrain(
  viewer: Viewer,
  waypoints: Waypoint3D[],
  sampledHeights: Cartographic[],
): void {
  for (let i = 0; i < waypoints.length; i++) {
    const c = sampledHeights[i];
    if (!c) continue;
    const groundZ = (c.height ?? 0) + 2;
    const entity = viewer.entities.getById(`${ROUTE_ENTITY_PREFIX}wp-ground-${i}`);
    if (entity) {
      entity.position = new ConstantPositionProperty(
        Cartesian3.fromRadians(c.longitude, c.latitude, groundZ),
      );
    }
    const drop = viewer.entities.getById(`${ROUTE_ENTITY_PREFIX}drop-${i}`);
    const w = waypoints[i]!;
    const altM = w.altFt * 0.3048;
    if (drop?.polyline && altM > 2) {
      const top = Cartesian3.fromDegrees(w.lon, w.lat, altM);
      const bottom = Cartesian3.fromRadians(c.longitude, c.latitude, groundZ);
      drop.polyline.positions = new ConstantProperty([top, bottom]);
      drop.polyline.depthFailMaterial = new ColorMaterialProperty(
        Color.fromCssColorString('#7DAAF7').withAlpha(0.55),
      );
    }
  }
}

export async function resampleCockpitGroundGraphics(
  viewer: Viewer,
  waypoints: Waypoint3D[],
): Promise<void> {
  if (viewer.isDestroyed() || waypoints.length < 1) return;
  const carts = waypoints.map((w) => Cartographic.fromDegrees(w.lon, w.lat));
  let sampled: Cartographic[];
  try {
    sampled = await sampleTerrainMostDetailed(viewer.terrainProvider, carts);
  } catch {
    sampled = carts;
  }
  updateGroundWaypointPositionsFromTerrain(viewer, waypoints, sampled);
  await applySampledGroundRoutePolyline(viewer, waypoints);
}
