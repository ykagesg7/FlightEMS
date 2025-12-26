import type { Feature, FeatureCollection, Geometry, Polygon, Position } from 'geojson';

export interface AirspaceHit {
  frequency?: string;
  sourceId?: string;
  name?: string;
}

export type AirspaceDataset = FeatureCollection<Geometry, Record<string, unknown>>;

// シンプルなポイント-in-ポリゴン（Ray casting）
const pointInPolygon = (point: Position, polygon: Position[][]): boolean => {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon[0].length - 1; i < polygon[0].length; j = i++) {
    const xi = polygon[0][i][0];
    const yi = polygon[0][i][1];
    const xj = polygon[0][j][0];
    const yj = polygon[0][j][1];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
};

const isPointInFeature = (point: Position, feature: Feature): boolean => {
  if (!feature.geometry) return false;

  if (feature.geometry.type === 'Polygon') {
    return pointInPolygon(point, feature.geometry.coordinates as Position[][]);
  }

  if (feature.geometry.type === 'MultiPolygon') {
    for (const poly of feature.geometry.coordinates as Position[][][]) {
      if (pointInPolygon(point, poly as Position[][])) return true;
    }
  }

  return false;
};

export const findAirspaceFrequency = (
  point: Position,
  datasets: { id: string; data: AirspaceDataset | null }[]
): AirspaceHit | undefined => {
  for (const { id, data } of datasets) {
    if (!data?.features) continue;
    for (const feature of data.features) {
      if (isPointInFeature(point, feature)) {
        const props = feature.properties || {};
        const freq = (props.frequency as string) || (props.freq as string);
        const name = (props.name as string) || (props.id as string);
        if (freq) {
          return {
            frequency: freq,
            sourceId: id,
            name,
          };
        }
      }
    }
  }
  return undefined;
};

