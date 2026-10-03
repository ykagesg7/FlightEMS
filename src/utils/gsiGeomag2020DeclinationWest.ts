/**
 * 国土地理院 磁気図2020.0 — 偏角 D（西偏を正、度）。
 * 3分（0.05°）グリッドの双一次内挿。計算サイトと同様に入力緯度経度は整数秒に丸める。
 *
 * グリッド出典: GSI sample.cgi（scripts/geomag/fetch-gsi-declination-grid.mjs）
 * メタ: src/utils/data/gsiGeomag2020DeclinationWest.meta.json
 */

import gridBytes from './data/gsiGeomag2020DeclinationWest.u16?arraybuffer';
import meta from './data/gsiGeomag2020DeclinationWest.meta.json';

const SCALE = meta.scale as number;
const STEP = meta.stepDeg as number;
const LAT_MIN = meta.latMin as number;
const LON_MIN = meta.lonMin as number;
const N_LAT = meta.nLat as number;
const N_LON = meta.nLon as number;

const GRID_CENTIDEG = new Uint16Array(gridBytes);

function roundDegToIntegerSecond(deg: number): number {
  return Math.round(deg * 3600) / 3600;
}

function gridValueAt(iLat: number, iLon: number): number {
  const idx = iLat * N_LON + iLon;
  return GRID_CENTIDEG[idx] * SCALE;
}

/** グリッド範囲内にクランプした上で、GSI 計算サイト相当の双一次内挿（西偏・度）。 */
export function gsiGeomag2020DeclinationWestDeg(lat: number, lon: number): number {
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

  const d00 = gridValueAt(iLat0, iLon0);
  const d10 = gridValueAt(iLat0, iLon1);
  const d01 = gridValueAt(iLat1, iLon0);
  const d11 = gridValueAt(iLat1, iLon1);

  return d00 * (1 - u) * (1 - v) + d10 * u * (1 - v) + d01 * (1 - u) * v + d11 * u * v;
}

export const GSI_GEOMAG_2020_META = meta;
