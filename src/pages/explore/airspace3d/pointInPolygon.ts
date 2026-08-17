export type LonLat = { lon: number; lat: number };

/** リングは [lon, lat][]。閉じ点が無くても可。 */
export function pointInPolygonRing(point: LonLat, ring: [number, number][]): boolean {
  if (ring.length < 3) return false;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i]![0];
    const yi = ring[i]![1];
    const xj = ring[j]![0];
    const yj = ring[j]![1];
    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lon < ((xj - xi) * (point.lat - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function pointInAltitudeBand(
  altFt: number,
  minFt: number,
  maxFt: number,
): boolean {
  return altFt >= minFt && altFt <= maxFt;
}
