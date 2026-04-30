const EARTH_RADIUS_NM = 3440.065;

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

function toDeg(value: number): number {
  return (value * 180) / Math.PI;
}

export function distanceNm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_NM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function initialBearingRad(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return Math.atan2(y, x);
}

export function crossTrackDistanceNm(
  point: { latitude: number; longitude: number },
  start: { latitude: number; longitude: number },
  end: { latitude: number; longitude: number }
): number {
  const distance13 = distanceNm(start, point) / EARTH_RADIUS_NM;
  const bearing13 = initialBearingRad(start, point);
  const bearing12 = initialBearingRad(start, end);
  return Math.abs(Math.asin(Math.sin(distance13) * Math.sin(bearing13 - bearing12)) * EARTH_RADIUS_NM);
}

export function alongTrackDistanceNm(
  point: { latitude: number; longitude: number },
  start: { latitude: number; longitude: number },
  end: { latitude: number; longitude: number }
): number {
  const distance13 = distanceNm(start, point) / EARTH_RADIUS_NM;
  const xtd = crossTrackDistanceNm(point, start, end) / EARTH_RADIUS_NM;
  const value = Math.acos(Math.min(1, Math.max(-1, Math.cos(distance13) / Math.cos(xtd)))) * EARTH_RADIUS_NM;
  const bearing13 = initialBearingRad(start, point);
  const bearing12 = initialBearingRad(start, end);
  return Math.cos(bearing13 - bearing12) < 0 ? -value : value;
}

export function bearingDeg(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  return (toDeg(initialBearingRad(a, b)) + 360) % 360;
}
