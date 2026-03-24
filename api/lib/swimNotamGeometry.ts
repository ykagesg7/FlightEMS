/**
 * SWIM デジタルノータム AIXM/GML 断片から GeoJSON 幾何を推定する（参考表示用）。
 *
 * - GeoJSON は [lng, lat]（RFC 7946）。
 * - GML/AIXM は lat,lon または lon,lat が混在し得るため、日本域のヒューリスティックで解釈する。
 * - 判別不能な座標列は undefined を返す（誤表示より非表示を優先）。
 */
import type { Geometry, LineString, MultiPolygon, Point, Polygon, Position } from 'geojson';

const JAPAN_LAT_MIN = 20;
const JAPAN_LAT_MAX = 50;
const JAPAN_LON_MIN = 120;
const JAPAN_LON_MAX = 156;

/**
 * 数値ペアを日本付近の WGS84 とみなし [lng, lat] に正規化する。
 * いずれの順でも日本域に入れば採用。両方解釈できる場合は lat-lon（AIXM 5 系で多い）を優先。
 */
export function pairToLngLat(a: number, b: number): [number, number] | null {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  const latLonOk =
    a >= JAPAN_LAT_MIN &&
    a <= JAPAN_LAT_MAX &&
    b >= JAPAN_LON_MIN &&
    b <= JAPAN_LON_MAX;
  const lonLatOk =
    b >= JAPAN_LAT_MIN &&
    b <= JAPAN_LAT_MAX &&
    a >= JAPAN_LON_MIN &&
    a <= JAPAN_LON_MAX;
  if (latLonOk && !lonLatOk) return [b, a];
  if (lonLatOk && !latLonOk) return [a, b];
  if (latLonOk && lonLatOk) return [b, a];
  return null;
}

function parseSpaceSeparatedNumbers(s: string): number[] {
  return s
    .trim()
    .split(/\s+/)
    .map((x) => Number(x))
    .filter((n) => Number.isFinite(n));
}

function numsToPositions(nums: number[]): Position[] | null {
  if (nums.length < 2 || nums.length % 2 !== 0) return null;
  const out: Position[] = [];
  for (let i = 0; i < nums.length; i += 2) {
    const p = pairToLngLat(nums[i], nums[i + 1]);
    if (!p) return null;
    out.push(p);
  }
  return out;
}

function ringNearlyClosed(ring: Position[]): boolean {
  if (ring.length < 2) return false;
  const a = ring[0];
  const b = ring[ring.length - 1];
  const eps = 1e-7;
  return Math.abs(a[0] - b[0]) < eps && Math.abs(a[1] - b[1]) < eps;
}

function closeRing(ring: Position[]): Position[] {
  if (ringNearlyClosed(ring)) return ring;
  if (ring.length < 3) return ring;
  return [...ring, ring[0]];
}

/**
 * digitalNotam XML 文字列から posList / pos を走査し、Polygon / LineString / Point を推定。
 */
export function extractGeometryFromDigitalNotamXml(xml: string): Geometry | undefined {
  const posLists: Position[][] = [];
  const posSingles: Position[] = [];

  for (const m of xml.matchAll(/<(?:[\w.-]+:)?posList\b[^>]*>([^<]+)<\/(?:[\w.-]+:)?posList>/gi)) {
    const pos = numsToPositions(parseSpaceSeparatedNumbers(m[1] ?? ''));
    if (pos && pos.length >= 2) posLists.push(pos);
  }

  for (const m of xml.matchAll(/<(?:[\w.-]+:)?pos\b[^>]*>([^<]+)<\/(?:[\w.-]+:)?pos>/gi)) {
    const nums = parseSpaceSeparatedNumbers(m[1] ?? '');
    if (nums.length === 2) {
      const p = pairToLngLat(nums[0], nums[1]);
      if (p) posSingles.push(p);
    } else if (nums.length >= 4 && nums.length % 2 === 0) {
      const pos = numsToPositions(nums);
      if (pos && pos.length >= 2) posLists.push(pos);
    }
  }

  if (posLists.length === 0 && posSingles.length === 1) {
    const point: Point = { type: 'Point', coordinates: posSingles[0] };
    return point;
  }

  const polygonExteriors: Position[][] = [];
  const lines: Position[][] = [];

  for (const r of posLists) {
    if (r.length >= 4) {
      const closed = closeRing(r);
      if (ringNearlyClosed(closed) && closed.length >= 4) {
        polygonExteriors.push(closed);
        continue;
      }
    }
    if (r.length >= 2) lines.push(r);
  }

  if (polygonExteriors.length === 1) {
    const poly: Polygon = {
      type: 'Polygon',
      coordinates: [polygonExteriors[0]],
    };
    return poly;
  }
  if (polygonExteriors.length > 1) {
    const mp: MultiPolygon = {
      type: 'MultiPolygon',
      coordinates: polygonExteriors.map((ring) => [ring]),
    };
    return mp;
  }

  if (lines.length === 1) {
    const ls: LineString = { type: 'LineString', coordinates: lines[0] };
    return ls;
  }
  if (lines.length > 1) {
    const longest = lines.reduce((a, b) => (a.length >= b.length ? a : b));
    const ls: LineString = { type: 'LineString', coordinates: longest };
    return ls;
  }

  if (posSingles.length >= 1) {
    const point: Point = { type: 'Point', coordinates: posSingles[0] };
    return point;
  }

  return undefined;
}
