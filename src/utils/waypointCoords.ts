import type { Waypoint } from '../types/index';

/** GeoJSON 座標配列形式 `[lon, lat]` のリスト（小数4桁） */
export function formatWaypointsGeoJsonCoordinates(waypoints: Waypoint[]): string {
  if (waypoints.length === 0) return '[]';

  const lines = waypoints.map((wp, index) => {
    const pair = `[${wp.longitude.toFixed(4)}, ${wp.latitude.toFixed(4)}]`;
    return index < waypoints.length - 1 ? `  ${pair},` : `  ${pair}`;
  });

  return `[\n${lines.join('\n')}\n]`;
}

/** 単一ウェイポイントの `lon, lat` 文字列 */
export function formatWaypointDegreeCoords(waypoint: Waypoint): string {
  return `${waypoint.longitude.toFixed(4)}, ${waypoint.latitude.toFixed(4)}`;
}
