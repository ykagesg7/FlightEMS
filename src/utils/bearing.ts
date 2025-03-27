import { MAGNETIC_DECLINATION } from './constants';

export function calculateMagneticBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  const x = Math.sin(Δλ) * Math.cos(φ2);
  const y = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const trueBearing = (Math.atan2(x, y) * 180 / Math.PI + 360) % 360;
  // 真方位から磁気偏差を引いて、磁気方位を算出
  const magneticBearing = (trueBearing + MAGNETIC_DECLINATION + 360) % 360;
  return magneticBearing;
} 