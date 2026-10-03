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
import { routeLegProjectionAtPosition } from './flightViewer3dMath';
import { dedupeConsecutiveCartesian3 } from './flightViewerRouteGraphics';

const ROUTE_ENTITY_PREFIX = 'flight-viewer-route-';
const ROUTE_GROUND_POLYLINE_ID = 'flight-viewer-route-ground-line';
/** 地形メッシュより手前に描くためのオフセット（m） */
const GROUND_ROUTE_OFFSET_M = 28;
const GROUND_ROUTE_WIDTH = 8;
/** 地上ルートのサンプル間隔（nm） */
const GROUND_ROUTE_SAMPLE_NM = 0.12;

function haversineNm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const r = 3440.065;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(a)));
}

function sampleLegCartographics(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  includeStart: boolean,
): Cartographic[] {
  const distNm = haversineNm(lat1, lon1, lat2, lon2);
  const steps = Math.max(1, Math.ceil(distNm / GROUND_ROUTE_SAMPLE_NM));
  const out: Cartographic[] = [];
  const startStep = includeStart ? 0 : 1;
  for (let s = startStep; s <= steps; s++) {
    const u = s / steps;
    out.push(
      Cartographic.fromDegrees(lon1 + (lon2 - lon1) * u, lat1 + (lat2 - lat1) * u),
    );
  }
  return out;
}

/** 機体位置から先のウェイポイント列まで、密な地上ルート用カートグラフィック */
export function buildAheadGroundRouteCartographics(
  fromLon: number,
  fromLat: number,
  waypoints: Waypoint3D[],
): Cartographic[] {
  if (waypoints.length < 2) return [];
  const { legIndex } = routeLegProjectionAtPosition(fromLat, fromLon, waypoints);
  const startLeg = Math.max(0, Math.min(legIndex, waypoints.length - 2));
  const carts: Cartographic[] = [Cartographic.fromDegrees(fromLon, fromLat)];
  for (let i = startLeg; i < waypoints.length - 1; i++) {
    const from =
      i === startLeg
        ? { lat: fromLat, lon: fromLon }
        : { lat: waypoints[i]!.lat, lon: waypoints[i]!.lon };
    const to = waypoints[i + 1]!;
    const leg = sampleLegCartographics(
      from.lat,
      from.lon,
      to.lat,
      to.lon,
      i !== startLeg,
    );
    for (const c of leg) {
      const last = carts[carts.length - 1];
      if (
        last &&
        Math.abs(last.longitude - c.longitude) < 1e-9 &&
        Math.abs(last.latitude - c.latitude) < 1e-9
      ) {
        continue;
      }
      carts.push(c);
    }
  }
  return carts;
}

function cartographicsToOffsetPositions(
  viewer: Viewer,
  carts: Cartographic[],
  heightOffsetM: number,
): Cartesian3[] {
  return dedupeConsecutiveCartesian3(
    carts.map((c) => {
      const probe = Cartographic.clone(c);
      const terrainH = viewer.scene.globe.getHeight(probe);
      const base =
        terrainH !== undefined && Number.isFinite(terrainH) ? terrainH : 0;
      return Cartesian3.fromRadians(
        c.longitude,
        c.latitude,
        base + heightOffsetM,
      );
    }),
  );
}

async function cartographicsToTerrainOffsetPositions(
  viewer: Viewer,
  carts: Cartographic[],
  heightOffsetM: number,
): Promise<Cartesian3[]> {
  let sampled: Cartographic[];
  try {
    sampled = await sampleTerrainMostDetailed(viewer.terrainProvider, carts);
  } catch {
    sampled = carts;
  }
  return dedupeConsecutiveCartesian3(
    sampled.map((c) =>
      Cartesian3.fromRadians(
        c.longitude,
        c.latitude,
        (c.height ?? 0) + heightOffsetM,
      ),
    ),
  );
}

function applyPositionsToGroundPolyline(viewer: Viewer, positions: Cartesian3[]): void {
  if (positions.length < 2) return;
  const entity = viewer.entities.getById(ROUTE_GROUND_POLYLINE_ID);
  if (!entity?.polyline) return;
  entity.polyline.positions = new ConstantProperty(positions);
  entity.polyline.clampToGround = new ConstantProperty(false);
  entity.polyline.width = new ConstantProperty(GROUND_ROUTE_WIDTH);
  const magenta = Color.fromCssColorString('#FF00FF').withAlpha(0.95);
  entity.polyline.depthFailMaterial = new ColorMaterialProperty(magenta);
}

/** GSI 等で clampToGround が効かない場合の地上ルート（地形サンプル + オフセット） */
export async function applySampledGroundRoutePolyline(
  viewer: Viewer,
  waypoints: Waypoint3D[],
): Promise<void> {
  if (viewer.isDestroyed() || waypoints.length < 2) return;
  const carts = waypoints.map((w) => Cartographic.fromDegrees(w.lon, w.lat));
  let positions: Cartesian3[];
  try {
    positions = await cartographicsToTerrainOffsetPositions(
      viewer,
      carts,
      GROUND_ROUTE_OFFSET_M,
    );
  } catch {
    positions = cartographicsToOffsetPositions(viewer, carts, GROUND_ROUTE_OFFSET_M);
  }
  applyPositionsToGroundPolyline(viewer, positions);
}

let cockpitAheadRouteGeneration = 0;
let lastTerrainSampleMs = 0;
let lastTerrainSampleLon = 0;
let lastTerrainSampleLat = 0;
const TERRAIN_RESAMPLE_MIN_MS = 900;
const TERRAIN_RESAMPLE_MIN_MOVE_NM = 0.08;

/**
 * コックピット用：機体位置から先だけの地上ルートを更新（即時 ellipsoid → 地形サンプル）。
 */
export function updateCockpitAheadGroundRoute(
  viewer: Viewer,
  fromLon: number,
  fromLat: number,
  waypoints: Waypoint3D[],
  options?: { forceTerrainSample?: boolean },
): void {
  if (viewer.isDestroyed() || waypoints.length < 2) return;
  const carts = buildAheadGroundRouteCartographics(fromLon, fromLat, waypoints);
  if (carts.length < 2) return;

  const quick = cartographicsToOffsetPositions(viewer, carts, GROUND_ROUTE_OFFSET_M);
  applyPositionsToGroundPolyline(viewer, quick);

  const now = performance.now();
  const movedNm = haversineNm(fromLat, fromLon, lastTerrainSampleLat, lastTerrainSampleLon);
  const shouldSample =
    options?.forceTerrainSample === true ||
    now - lastTerrainSampleMs >= TERRAIN_RESAMPLE_MIN_MS ||
    movedNm >= TERRAIN_RESAMPLE_MIN_MOVE_NM;
  if (!shouldSample) return;

  lastTerrainSampleMs = now;
  lastTerrainSampleLon = fromLon;
  lastTerrainSampleLat = fromLat;

  const gen = ++cockpitAheadRouteGeneration;
  void cartographicsToTerrainOffsetPositions(viewer, carts, GROUND_ROUTE_OFFSET_M)
    .then((positions) => {
      if (gen !== cockpitAheadRouteGeneration || viewer.isDestroyed()) return;
      applyPositionsToGroundPolyline(viewer, positions);
    })
    .catch((e) => {
      console.error('cockpit ahead ground route sample failed', e);
    });
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
  fromLon?: number,
  fromLat?: number,
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
  if (
    typeof fromLon === 'number' &&
    typeof fromLat === 'number' &&
    Number.isFinite(fromLon) &&
    Number.isFinite(fromLat)
  ) {
    updateCockpitAheadGroundRoute(viewer, fromLon, fromLat, waypoints);
  } else {
    await applySampledGroundRoutePolyline(viewer, waypoints);
  }
}
