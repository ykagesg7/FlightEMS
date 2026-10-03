import { interpolateJapanMagneticVariationWestDeg } from './japanMagneticVariation';

function normalizeDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** 真コース（大圏、真北基準）。 */
export function calculateTrueBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  const x = Math.sin(Δλ) * Math.cos(φ2);
  const y = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return normalizeDeg(Math.atan2(x, y) * 180 / Math.PI);
}

export function trueToMagneticDeg(trueDeg: number, variationDeg: number): number {
  return normalizeDeg(trueDeg + variationDeg);
}

/** レグ中点の国土地理院2020.0偏差で磁方位（大圏真方位 + 西偏）。 */
export function magneticVariationDegForLeg(lat1: number, lng1: number, lat2: number, lng2: number): number {
  return interpolateJapanMagneticVariationWestDeg((lat1 + lat2) / 2, (lng1 + lng2) / 2);
}

export function calculateMagneticBearing(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  variationDeg?: number,
): number {
  const variation = variationDeg ?? magneticVariationDegForLeg(lat1, lng1, lat2, lng2);
  return trueToMagneticDeg(calculateTrueBearing(lat1, lng1, lat2, lng2), variation);
}
