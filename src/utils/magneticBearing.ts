import { calculateTrueBearing, trueToMagneticDeg } from './bearing';
import { interpolateJapanMagneticVariationWestDeg } from './japanMagneticVariation';

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
