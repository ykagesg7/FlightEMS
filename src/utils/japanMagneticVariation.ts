/**
 * 日本付近の磁気偏差（西偏を正、真方位 + variation = 磁方位）。
 * 国土地理院 磁気図2020.0 年値（3分グリッド内挿、教育用オフラインモデル）。
 */

import { gsiGeomag2020DeclinationWestDeg, GSI_GEOMAG_2020_META } from './gsiGeomag2020DeclinationWest';

/** @deprecated 空港局点リストは旧モデル用。互換のため export のみ残す。 */
export type MagVarStation = { name: string; lat: number; lon: number; westDeg: number };

/** @deprecated 旧逆距離加重モデルの局点。新実装では未使用。 */
export const JAPAN_MAG_VAR_STATIONS: readonly MagVarStation[] = [];

/**
 * 西偏（度）。真方位に加算して磁方位を得る。
 * 国土地理院 2020.0 年値（グリッド内挿）。範囲外・非有限入力は東京付近の代表値にフォールバック。
 */
export function interpolateJapanMagneticVariationWestDeg(lat: number, lon: number): number {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return gsiGeomag2020DeclinationWestDeg(GSI_GEOMAG_2020_META.latMin + 15, GSI_GEOMAG_2020_META.lonMin + 10);
  }
  return gsiGeomag2020DeclinationWestDeg(lat, lon);
}
