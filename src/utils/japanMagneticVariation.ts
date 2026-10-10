/**
 * 日本付近の磁気偏差（西偏を正、真方位 + variation = 磁方位）。
 * 国土地理院 磁気図2020.0 年値（0.1° 格子・sample.cgi 由来、教育用オフラインモデル）。
 */

import {
  gsiGeomag2020DeclinationWestDeg,
  initGsiGeomag2020DeclinationGrid,
  isGsiGeomag2020RepresentativeDeclinationActive,
  GSI_GEOMAG_2020_META,
} from './gsiGeomag2020DeclinationWest';

/** 羽田 ARP 付近（軍議 MV-01 / RJTT）。非有限入力のフォールバック用。 */
const TOKYO_FALLBACK_LAT = 35.549678;
const TOKYO_FALLBACK_LON = 139.786958;

/** @deprecated 空港局点リストは旧モデル用。互換のため export のみ残す。 */
export type MagVarStation = { name: string; lat: number; lon: number; westDeg: number };

/** @deprecated 旧逆距離加重モデルの局点。新実装では未使用。 */
export const JAPAN_MAG_VAR_STATIONS: readonly MagVarStation[] = [];

export { initGsiGeomag2020DeclinationGrid as initJapanMagneticVariationGrid };

/** 格子未読込または取得失敗で代表値で磁方位を続行しているとき true。 */
export function isJapanMagneticVariationGridFallbackActive(): boolean {
  return isGsiGeomag2020RepresentativeDeclinationActive();
}

/**
 * 西偏（度）。真方位に加算して磁方位を得る。
 * 格子読込前・失敗時は代表偏角（羽田付近・GSI 2020.0）を返す。
 */
export function interpolateJapanMagneticVariationWestDeg(lat: number, lon: number): number {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return gsiGeomag2020DeclinationWestDeg(TOKYO_FALLBACK_LAT, TOKYO_FALLBACK_LON);
  }
  return gsiGeomag2020DeclinationWestDeg(lat, lon);
}

export { GSI_GEOMAG_2020_META };
