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

/** 期待バイト長（u16 × 格子点数）。本番で HTML が 200 返るケースの検証用。 */
export const GSI_GEOMAG_GRID_BYTE_LENGTH = N_LAT * N_LON * 2;

/** グリッド未取得時の代表偏角（羽田 ARP・GSI 2020.0 MV-01、西偏・度） */
export const GSI_GEOMAG_FALLBACK_DECLINATION_WEST_DEG = 7.53;

const LOAD_MAX_ATTEMPTS = 3;
const LOAD_RETRY_DELAY_MS = 250;

type GridLoadMode = 'pending' | 'loaded' | 'fallback';

let gridCentideg: Uint16Array | null = null;
let loadPromise: Promise<void> | null = null;
let gridLoadMode: GridLoadMode = 'pending';

export function isGsiGeomag2020GridFallbackActive(): boolean {
  return gridLoadMode === 'fallback';
}

/** 格子未読込（pending）または読込失敗（fallback）で代表偏角を返しているとき true。 */
export function isGsiGeomag2020RepresentativeDeclinationActive(): boolean {
  return gridLoadMode !== 'loaded';
}

function isVitestFetchPath(): boolean {
  return (
    typeof process !== 'undefined' &&
    process.env.VITEST === 'true' &&
    process.env.GSI_GEOMAG_USE_FETCH === 'true'
  );
}

function validateAndAssignGrid(buf: ArrayBuffer): boolean {
  if (buf.byteLength !== GSI_GEOMAG_GRID_BYTE_LENGTH) {
    return false;
  }
  gridCentideg = new Uint16Array(buf);
  gridLoadMode = 'loaded';
  return true;
}

async function readGridFromDisk(): Promise<boolean> {
  const { readFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const raw = readFileSync(join(process.cwd(), 'src/utils/data/gsiGeomag2020DeclinationWest.u16'));
  const buf = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
  return validateAndAssignGrid(buf);
}

function responseLooksLikeHtml(res: Response): boolean {
  const ct = res.headers.get('content-type') ?? '';
  return ct.toLowerCase().includes('text/html');
}

async function fetchGridOnce(): Promise<boolean> {
  const res = await fetch(gridAssetUrl);
  if (!res.ok || responseLooksLikeHtml(res)) {
    return false;
  }
  const buf = await res.arrayBuffer();
  return validateAndAssignGrid(buf);
}

async function loadGridWithRetries(): Promise<void> {
  for (let attempt = 0; attempt < LOAD_MAX_ATTEMPTS; attempt += 1) {
    try {
      const ok = await fetchGridOnce();
      if (ok) {
        return;
      }
    } catch {
      // retry
    }
    if (attempt < LOAD_MAX_ATTEMPTS - 1) {
      await new Promise((resolve) => {
        setTimeout(resolve, LOAD_RETRY_DELAY_MS);
      });
    }
  }
  gridCentideg = null;
  gridLoadMode = 'fallback';
}

async function runGridLoad(): Promise<void> {
  const isVitest = typeof process !== 'undefined' && process.env.VITEST === 'true';
  if (isVitest && !isVitestFetchPath()) {
    const ok = await readGridFromDisk();
    if (!ok) {
      gridLoadMode = 'fallback';
    }
    return;
  }
  await loadGridWithRetries();
}

/** Planning ルート読み込み時に呼ぶ（磁方位計算の前に 1 回）。失敗時は reject せずフォールバックへ。 */
export async function initGsiGeomag2020DeclinationGrid(): Promise<void> {
  if (gridLoadMode === 'loaded' || gridLoadMode === 'fallback') {
    return;
  }
  if (!loadPromise) {
    loadPromise = runGridLoad().finally(() => {
      loadPromise = null;
    });
  }
  await loadPromise;
}

/** @internal Vitest でモジュール状態をリセットする */
export function __resetGsiGeomag2020GridForTests(): void {
  gridCentideg = null;
  loadPromise = null;
  gridLoadMode = 'pending';
}

function roundDegToIntegerSecond(deg: number): number {
  return Math.round(deg * 3600) / 3600;
}

function gridValueAt(grid: Uint16Array, iLat: number, iLon: number): number {
  const idx = iLat * N_LON + iLon;
  return grid[idx] * SCALE;
}

function interpolateLoadedGrid(lat: number, lon: number, grid: Uint16Array): number {
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

/** 格子範囲内にクランプした上で、GSI 計算サイト相当の双一次内挿（西偏・度）。 */
export function gsiGeomag2020DeclinationWestDeg(lat: number, lon: number): number {
  if (gridLoadMode !== 'loaded' || !gridCentideg) {
    return GSI_GEOMAG_FALLBACK_DECLINATION_WEST_DEG;
  }
  return interpolateLoadedGrid(lat, lon, gridCentideg);
}

export const GSI_GEOMAG_2020_META = meta;
