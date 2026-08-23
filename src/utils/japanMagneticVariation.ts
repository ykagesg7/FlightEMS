/**
 * 日本付近の磁気偏差（西偏を正、真方位 + variation = 磁方位）。
 * 主要空港の概算値を逆距離加重で補間する教育用モデル。WMM の代替ではない。
 *
 * 出典: NOAA Magnetic Field Calculators / 国土地理院の公開値に近い 2025 年頃の概数。
 */

export type MagVarStation = { name: string; lat: number; lon: number; westDeg: number };

export const JAPAN_MAG_VAR_STATIONS: readonly MagVarStation[] = [
  { name: 'RJCC', lat: 42.775, lon: 141.692, westDeg: 9.4 },
  { name: 'RJTT', lat: 35.553, lon: 139.781, westDeg: 7.8 },
  { name: 'RJOO', lat: 34.785, lon: 135.438, westDeg: 7.6 },
  { name: 'RJFF', lat: 33.586, lon: 130.451, westDeg: 7.4 },
  { name: 'ROAH', lat: 26.196, lon: 127.646, westDeg: 5.2 },
  { name: 'RJSS', lat: 38.140, lon: 140.917, westDeg: 8.5 },
  { name: 'RJFK', lat: 31.803, lon: 130.719, westDeg: 6.9 },
  { name: 'RJCH', lat: 41.770, lon: 140.822, westDeg: 9.2 },
  { name: 'RJGG', lat: 34.858, lon: 136.805, westDeg: 7.7 },
  { name: 'RJBB', lat: 34.427, lon: 135.230, westDeg: 7.5 },
];

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const r = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** 西偏（度）。真方位に加算して磁方位を得る。 */
export function interpolateJapanMagneticVariationWestDeg(lat: number, lon: number): number {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return 8;
  let wSum = 0;
  let vSum = 0;
  for (const s of JAPAN_MAG_VAR_STATIONS) {
    const d = haversineKm(lat, lon, s.lat, s.lon);
    if (d < 0.5) return s.westDeg;
    const w = 1 / (d * d);
    wSum += w;
    vSum += w * s.westDeg;
  }
  if (wSum <= 0) return 8;
  return vSum / wSum;
}
