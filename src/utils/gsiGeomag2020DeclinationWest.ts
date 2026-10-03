/**
 * 国土地理院 磁気図2020.0 — 偏角 D（西偏を正、度）。
 * 0.1° 格子（sample.cgi で取得した値）の双一次内挿。入力は計算サイト同様整数秒に丸める。
 * 参照元の 3 分グリッドは sample.cgi 側で内挿済みの値として格子点に載る。
 *
 * グリッド: src/utils/data/gsiGeomag2020DeclinationWest.u16（再生成は scripts/geomag/fetch-gsi-declination-grid.mjs）
 */
import gridAssetUrl from './data/gsiGeomag2020DeclinationWest.u16?url';
import meta from './data/gsiGeomag2020DeclinationWest.meta.json';

const SCALE = meta.scale as number;
const STEP = meta.stepDeg as number;
const LAT_MIN = meta.latMin as number;
const LON_MIN = meta.lonMin as number;
const N_LAT = meta.nLat as number;
const N_LON = meta.nLon as number;

let gridCentideg: Uint16Array | null = null;
let loadPromise: Promise<void> | null = null;

/** Planning ルート読み込み時に呼ぶ（磁方位計算の前に 1 回）。 */
export async function initGsiGeomag2020DeclinationGrid(): Promise<void> {
  if (gridCentideg) return;
  if (!loadPromise) {
    loadPromise = (async () => {
      let buf: ArrayBuffer;
      const isVitest = typeof process !== 'undefined' && process.env.VITEST === 'true';
      if (isVitest) {
        const { readFileSync } = await import('node:fs');
        const { join } = await import('node:path');
        const raw = readFileSync(
          join(process.cwd(), 'src/utils/data/gsiGeomag2020DeclinationWest.u16'),
        );
        buf = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
      } else {
        const res = await fetch(gridAssetUrl);
        if (!res.ok) {
          throw new Error(`GSI geomag grid fetch failed: ${res.status}`);
        }
        buf = await res.arrayBuffer();
      }
      gridCentideg = new Uint16Array(buf);
    })();
  }
  await loadPromise;
}

function requireGrid(): Uint16Array {
  if (!gridCentideg) {
    throw new Error('GSI geomag grid not loaded; call initGsiGeomag2020DeclinationGrid() first');
  }
  return gridCentideg;
}

function roundDegToIntegerSecond(deg: number): number {
  return Math.round(deg * 3600) / 3600;
}

function gridValueAt(grid: Uint16Array, iLat: number, iLon: number): number {
  const idx = iLat * N_LON + iLon;
  return grid[idx] * SCALE;
}

/** 格子範囲内にクランプした上で、GSI 計算サイト相当の双一次内挿（西偏・度）。 */
export function gsiGeomag2020DeclinationWestDeg(lat: number, lon: number): number {
  const grid = requireGrid();
  const latR = roundDegToIntegerSecond(lat);
  const lonR = roundDegToIntegerSecond(lon);

  const latClamped = Math.min(meta.latMax as number, Math.max(LAT_MIN, latR));
  const lonClamped = Math.min(meta.lonMax as number, Math.max(LON_MIN, lonR));

  const lat0 = Math.floor((latClamped - LAT_MIN) / STEP) * STEP + LAT_MIN;
  const lon0 = Math.floor((lonClamped - LON_MIN) / STEP) * STEP + LON_MIN;

  const iLat0 = Math.round((lat0 - LAT_MIN) / STEP);
  const iLon0 = Math.round((lon0 - LON_MIN) / STEP);
  const iLat1 = Math.min(iLat0 + 1, N_LAT - 1);
  const iLon1 = Math.min(iLon0 + 1, N_LON - 1);

  const u = (lonClamped - lon0) / STEP;
  const v = (latClamped - lat0) / STEP;

  const d00 = gridValueAt(grid, iLat0, iLon0);
  const d10 = gridValueAt(grid, iLat0, iLon1);
  const d01 = gridValueAt(grid, iLat1, iLon0);
  const d11 = gridValueAt(grid, iLat1, iLon1);

  return d00 * (1 - u) * (1 - v) + d10 * u * (1 - v) + d01 * (1 - u) * v + d11 * u * v;
}

export const GSI_GEOMAG_2020_META = meta;
