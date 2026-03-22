/**
 * 地図表示域の粗い格子で Open-Meteo 風を取得（キャッシュ・逐次取得）。
 * 上層風は急変しない前提で、TTL・バウンディング量子化・時刻バケットで API 回数を抑える。
 */
import { fetchWindAtPressureHpa } from './routeOpenMeteoWind';

export type WindGridPoint = {
  lat: number;
  lon: number;
  windFromDeg: number;
  speedKt: number;
};

type CacheEntry = { fetchedAt: number; points: WindGridPoint[] };

const cache = new Map<string, CacheEntry>();
const GRID_CACHE_MAX_KEYS = 24;

/** 同一ビュー近傍での再取得を避ける（分） */
const GRID_CACHE_TTL_MS = 45 * 60 * 1000;

/**
 * キャッシュキー用に表示域を粗く丸める（微小なパンでキーが変わらないようにする）
 */
const BBOX_QUANTIZE_STEP_DEG = 0.2;

/**
 * 予報参照の時刻バケット（ms）。3h 単位で「同じシノプティック帯」として再利用。
 */
const FORECAST_TIME_BUCKET_MS = 3 * 60 * 60 * 1000;

export const WIND_GRID_DEFAULT_N = 5;
export const WIND_GRID_DEFAULT_PRESSURE_HPA = 300;

/** @internal テスト・呼び出し側の期待確認用 */
export function quantizeBoundsForWindGridCache(
  south: number,
  west: number,
  north: number,
  east: number,
  stepDeg = BBOX_QUANTIZE_STEP_DEG
): { south: number; west: number; north: number; east: number } {
  const s = Math.floor(south / stepDeg) * stepDeg;
  const w = Math.floor(west / stepDeg) * stepDeg;
  const n = Math.ceil(north / stepDeg) * stepDeg;
  const e = Math.ceil(east / stepDeg) * stepDeg;
  return { south: s, west: w, north: n, east: e };
}

function cacheKey(
  south: number,
  west: number,
  north: number,
  east: number,
  gridN: number,
  pressureHpa: number,
  timeBucket: number
): string {
  return [
    gridN,
    pressureHpa,
    timeBucket,
    south.toFixed(2),
    west.toFixed(2),
    north.toFixed(2),
    east.toFixed(2),
  ].join('|');
}

export function buildLatLonGrid(
  south: number,
  west: number,
  north: number,
  east: number,
  gridN: number
): Array<{ lat: number; lon: number }> {
  const n = Math.max(2, Math.min(8, Math.round(gridN)));
  const out: Array<{ lat: number; lon: number }> = [];
  const latSpan = north - south;
  const lonSpan = east - west;
  const latDen = Math.max(1, n - 1);
  const lonDen = Math.max(1, n - 1);
  for (let ri = 0; ri < n; ri++) {
    for (let ci = 0; ci < n; ci++) {
      out.push({
        lat: south + (latSpan * ri) / latDen,
        lon: west + (lonSpan * ci) / lonDen,
      });
    }
  }
  return out;
}

/** Open-Meteo 無料枠向け: 格子セルは直列＋短い間隔で 429 を避ける */
const GRID_CELL_DELAY_MS = 90;

/**
 * @param refTime 予報の基準時刻（通常は現在に近い UTC）
 */
export async function fetchWindGridForBounds(
  south: number,
  west: number,
  north: number,
  east: number,
  gridN: number,
  pressureHpa: number,
  refTime: Date
): Promise<WindGridPoint[]> {
  const q = quantizeBoundsForWindGridCache(south, west, north, east);
  const timeBucket = Math.floor(refTime.getTime() / FORECAST_TIME_BUCKET_MS);
  const key = cacheKey(q.south, q.west, q.north, q.east, gridN, pressureHpa, timeBucket);
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && now - hit.fetchedAt < GRID_CACHE_TTL_MS) {
    return hit.points;
  }

  const cells = buildLatLonGrid(q.south, q.west, q.north, q.east, gridN);
  const rows: (WindGridPoint | null)[] = [];
  for (let i = 0; i < cells.length; i++) {
    if (i > 0) {
      await new Promise((r) => setTimeout(r, GRID_CELL_DELAY_MS));
    }
    const c = cells[i];
    const w = await fetchWindAtPressureHpa(c.lat, c.lon, pressureHpa, refTime, 2);
    rows.push(
      w
        ? { lat: c.lat, lon: c.lon, windFromDeg: w.windFromDeg, speedKt: w.windSpeedKt }
        : null,
    );
  }

  const points = rows.filter((p): p is WindGridPoint => p != null);
  cache.set(key, { fetchedAt: now, points });
  while (cache.size > GRID_CACHE_MAX_KEYS) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
  return points;
}

export function clearWindGridCacheForTests(): void {
  cache.clear();
}

/** 地図上の (lat, lon) に最も近い格子点（凡例の代表風用） */
export function nearestWindGridPoint(
  lat: number,
  lon: number,
  points: WindGridPoint[]
): WindGridPoint | null {
  if (!points.length) return null;
  let best = points[0];
  let bestD = Infinity;
  for (const p of points) {
    const d = (lat - p.lat) ** 2 + (lon - p.lon) ** 2;
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}
