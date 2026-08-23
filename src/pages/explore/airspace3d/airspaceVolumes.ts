import { parseAltitudeBandFt, parseFloorCeilingFt } from './parseAltitudeBand';
import { ringIntersectsBBox, type PlaybackPoint, trackBBox } from './playbackTrack';

export type AirspaceKind = 'pending' | 'rapcon' | 'acc-low' | 'acc-high';

export type AirspaceRuntime = {
  id: string;
  kind: AirspaceKind;
  label: string;
  ring: [number, number][];
  minFt: number;
  maxFt: number;
  altitudeKnown: boolean;
};

type GeoFeature = {
  type: 'Feature';
  properties?: Record<string, unknown>;
  geometry?: {
    type: string;
    coordinates?: unknown;
  };
};

type GeoCollection = {
  type: 'FeatureCollection';
  features?: GeoFeature[];
};

function asRing(coords: unknown): [number, number][] | null {
  if (!Array.isArray(coords) || coords.length < 3) return null;
  const ring: [number, number][] = [];
  for (const c of coords) {
    if (!Array.isArray(c) || c.length < 2) continue;
    const lon = Number(c[0]);
    const lat = Number(c[1]);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
    ring.push([lon, lat]);
  }
  return ring.length >= 3 ? ring : null;
}

function polygonRings(geometry: GeoFeature['geometry']): [number, number][][] {
  if (!geometry?.coordinates) return [];
  if (geometry.type === 'Polygon') {
    const ring = asRing((geometry.coordinates as unknown[])[0]);
    return ring ? [ring] : [];
  }
  if (geometry.type === 'MultiPolygon') {
    const out: [number, number][][] = [];
    for (const poly of geometry.coordinates as unknown[]) {
      if (!Array.isArray(poly)) continue;
      const ring = asRing(poly[0]);
      if (ring) out.push(ring);
    }
    return out;
  }
  return [];
}

function featureLabel(kind: AirspaceKind, props: Record<string, unknown>): string {
  if (kind === 'pending') {
    const id = String(props.Area_ID ?? 'pending');
    return id;
  }
  if (kind === 'rapcon') {
    const id = String(props.Area_ID ?? '').trim();
    return id ? `RAPCON: ${id}` : 'RAPCON';
  }
  const id = String(props.ID ?? '').trim();
  const prefix = kind === 'acc-high' ? 'ACC High' : 'ACC Low';
  return id ? `${prefix}: ${id}` : prefix;
}

export function collectionToRuntimes(
  kind: AirspaceKind,
  data: GeoCollection,
  bbox: ReturnType<typeof trackBBox>,
): AirspaceRuntime[] {
  const runtimes: AirspaceRuntime[] = [];
  for (const f of data.features ?? []) {
    const props = f.properties ?? {};
    const rings = polygonRings(f.geometry);
    const band =
      kind === 'pending'
        ? { ...parseAltitudeBandFt(String(props.altitude ?? '')), known: true }
        : (() => {
            const parsed = parseFloorCeilingFt(
              props.Floor as string | undefined,
              props.Ceiling as string | undefined,
            );
            return parsed ? { ...parsed, known: true } : { minFt: 0, maxFt: 0, known: false };
          })();

    for (const ring of rings) {
      if (bbox && !ringIntersectsBBox(ring, bbox)) continue;
      if (!band.known && kind !== 'pending') {
        // 高度未収録は立体にしない（SFC–UNL を捏造しない）
        continue;
      }
      const label = featureLabel(kind, props);
      runtimes.push({
        id: `${kind}:${label}:${runtimes.length}`,
        kind,
        label,
        ring,
        minFt: band.minFt,
        maxFt: band.maxFt,
        altitudeKnown: band.known,
      });
    }
  }
  return runtimes;
}

export async function loadAirspaceCollections(): Promise<Record<AirspaceKind, GeoCollection>> {
  const [pending, rapcon, accHigh, accLow] = await Promise.all([
    fetch('/geojson/PendingAirspaceChanges.geojson').then((r) => r.json() as Promise<GeoCollection>),
    fetch('/geojson/RAPCON.geojson').then((r) => r.json() as Promise<GeoCollection>),
    fetch('/geojson/ACC_Sector_High.geojson').then((r) => r.json() as Promise<GeoCollection>),
    fetch('/geojson/ACC_Sector_Low.geojson').then((r) => r.json() as Promise<GeoCollection>),
  ]);
  return {
    pending,
    rapcon,
    'acc-high': accHigh,
    'acc-low': accLow,
  };
}

export function runtimesNearTrack(
  collections: Record<AirspaceKind, GeoCollection>,
  pts: PlaybackPoint[],
): AirspaceRuntime[] {
  const bbox = trackBBox(pts);
  return [
    ...collectionToRuntimes('pending', collections.pending, bbox),
    ...collectionToRuntimes('rapcon', collections.rapcon, bbox),
    ...collectionToRuntimes('acc-low', collections['acc-low'], bbox),
    ...collectionToRuntimes('acc-high', collections['acc-high'], bbox),
  ];
}
