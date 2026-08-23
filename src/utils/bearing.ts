import { MAGNETIC_DECLINATION } from './constants';

/** 磁気方位計算で使用する既定偏差（度、西偏を正の加算）。UI の注記と共有する。 */
export { MAGNETIC_DECLINATION };

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

export function trueToMagneticDeg(trueDeg: number, variationDeg = MAGNETIC_DECLINATION): number {
  return normalizeDeg(trueDeg + variationDeg);
}

export function calculateMagneticBearing(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  variationDeg = MAGNETIC_DECLINATION,
): number {
  return trueToMagneticDeg(calculateTrueBearing(lat1, lng1, lat2, lng2), variationDeg);
} 