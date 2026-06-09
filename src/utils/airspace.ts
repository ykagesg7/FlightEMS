import type { Feature, FeatureCollection, Geometry, Position } from 'geojson';

export interface AirspaceHit {
  frequency?: string;
  sourceId?: string;
  name?: string;
}

export type AirspaceDataset = FeatureCollection<Geometry, Record<string, unknown>>;

export type AirspaceSourceId = 'ACC_Sector_High' | 'ACC_Sector_Low' | 'RAPCON';

export type AirspaceFeatureHit = {
  sourceId: AirspaceSourceId;
  kind: 'acc' | 'rapcon';
  feature: Feature;
};

const FL_FEET = 100;

const hasValidPolygonRing = (ring: Position[] | undefined): ring is Position[] => {
  if (!Array.isArray(ring) || ring.length < 4) return false;
  return ring.every(
    (pos) =>
      Array.isArray(pos) &&
      pos.length >= 2 &&
      Number.isFinite(pos[0]) &&
      Number.isFinite(pos[1]),
  );
};

/** Drop features with empty/invalid rings (ACC_Sector_Low has placeholder polygons). */
export const isValidAirspaceFeature = (feature: Feature): boolean => {
  if (!feature.geometry) return false;

  if (feature.geometry.type === 'Polygon') {
    return hasValidPolygonRing(feature.geometry.coordinates[0] as Position[]);
  }

  if (feature.geometry.type === 'MultiPolygon') {
    return (feature.geometry.coordinates as Position[][][]).some((poly) =>
      hasValidPolygonRing(poly[0] as Position[]),
    );
  }

  return false;
};

export const sanitizeAirspaceDataset = (data: AirspaceDataset): AirspaceDataset => ({
  ...data,
  features: data.features.filter(isValidAirspaceFeature),
});

// シンプルなポイント-in-ポリゴン（Ray casting）
const pointInPolygon = (point: Position, polygon: Position[][]): boolean => {
  const ring = polygon[0];
  if (!ring || ring.length < 3) return false;

  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
};

export const isPointInFeature = (point: Position, feature: Feature): boolean => {
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

/** Parse altitude token to feet (FL245 -> 24500, SFC/"" -> 0, UNL -> Infinity). */
export const parseAltitudeToken = (raw: string | undefined): number | null => {
  if (raw == null) return null;
  const trimmed = raw.trim().replace(/,/g, '');
  if (!trimmed) return 0;

  const upper = trimmed.toUpperCase();
  if (upper === 'SFC' || upper === 'GND') return 0;
  if (upper === 'UNL' || upper === 'UNLIMITED') return Number.POSITIVE_INFINITY;

  const flMatch = upper.match(/^FL\s*(\d+(?:\.\d+)?)$/);
  if (flMatch) return Number(flMatch[1]) * FL_FEET;

  const ftMatch = upper.match(/^(\d+(?:\.\d+)?)\s*(?:FT|FEET)?$/);
  if (ftMatch) return Number(ftMatch[1]);

  return null;
};

export const altitudeRangeContains = (
  floor: string | undefined,
  ceiling: string | undefined,
  altitudeFt: number,
): boolean => {
  const floorFt = parseAltitudeToken(floor) ?? 0;
  const ceilingFt = parseAltitudeToken(ceiling) ?? Number.POSITIVE_INFINITY;
  return altitudeFt >= floorFt && altitudeFt <= ceilingFt;
};

const sourceKind = (sourceId: AirspaceSourceId): AirspaceFeatureHit['kind'] =>
  sourceId === 'RAPCON' ? 'rapcon' : 'acc';

const SOURCE_SORT_TIER: Record<AirspaceSourceId, number> = {
  ACC_Sector_High: 0,
  ACC_Sector_Low: 1,
  RAPCON: 2,
};

/** Higher altitude first; tie-break ACC High → ACC Low → RAPCON. */
const sortAltitudeHits = (a: AirspaceFeatureHit, b: AirspaceFeatureHit): number => {
  const propsA = a.feature.properties ?? {};
  const propsB = b.feature.properties ?? {};

  const ceilingA = parseAltitudeToken(String(propsA.Ceiling ?? '')) ?? Number.POSITIVE_INFINITY;
  const ceilingB = parseAltitudeToken(String(propsB.Ceiling ?? '')) ?? Number.POSITIVE_INFINITY;
  if (ceilingA !== ceilingB) return ceilingB - ceilingA;

  const floorA = parseAltitudeToken(String(propsA.Floor ?? '')) ?? 0;
  const floorB = parseAltitudeToken(String(propsB.Floor ?? '')) ?? 0;
  if (floorA !== floorB) return floorB - floorA;

  return SOURCE_SORT_TIER[a.sourceId] - SOURCE_SORT_TIER[b.sourceId];
};

export const findAirspaceHitsAtPoint = (
  point: Position,
  datasets: { id: AirspaceSourceId; data: AirspaceDataset | null }[],
): AirspaceFeatureHit[] => {
  const hits: AirspaceFeatureHit[] = [];

  for (const { id, data } of datasets) {
    if (!data?.features) continue;
    for (const feature of data.features) {
      if (isPointInFeature(point, feature)) {
        hits.push({
          sourceId: id,
          kind: sourceKind(id),
          feature,
        });
      }
    }
  }

  return hits.sort(sortAltitudeHits);
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
        const vhf = String(props.Freq_VHF ?? props['Freq(VHF)'] ?? '').trim();
        const uhf = String(props.Freq_UHF ?? props['Freq(UHF)'] ?? '').trim();
        const freq =
          (props.frequency as string) ||
          (props.freq as string) ||
          vhf ||
          uhf;
        const name =
          (props.name as string) ||
          (props.id as string) ||
          (props.ID as string) ||
          (props.Area_ID as string);
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
