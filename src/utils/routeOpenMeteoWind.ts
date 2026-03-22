/**
 * 経路セグメント向け Open-Meteo 風（教育・参考）。磁方位と真風向の偏角は未補正。
 */
import { DEFAULT_PRESSURE_LEVELS_HPA, fetchHourlyWindAloft } from '../services/openMeteo';
import { tailwindComponentKt } from './windComponents';

export const ROUTE_GS_MIN_KT = 20;

/** ICAO 標準大気に近い簡易式で気圧 hPa を推定し、利用可能な気圧面にスナップ */
export function pressureHpaForAltitudeFt(
  altitudeFt: number,
  available: readonly number[] = DEFAULT_PRESSURE_LEVELS_HPA
): number {
  const hM = altitudeFt * 0.3048;
  const approx = 1013.25 * Math.pow(1 - (0.0065 * hM) / 288.15, 5.25588);
  let best = available[0] ?? 300;
  let bestD = Infinity;
  for (const p of available) {
    const d = Math.abs(p - approx);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}

export function parseOpenMeteoHourAsUtc(iso: string): Date {
  const s = iso.trim();
  if (/Z$/i.test(s) || /[+-]\d{2}:?\d{2}$/.test(s)) {
    return new Date(s);
  }
  return new Date(`${s}Z`);
}

export function nearestHourlyTimeIndex(isoTimes: readonly string[], refUtc: Date): number {
  const t0 = refUtc.getTime();
  let best = 0;
  let bestAbs = Infinity;
  for (let i = 0; i < isoTimes.length; i++) {
    const t = parseOpenMeteoHourAsUtc(isoTimes[i]).getTime();
    if (Number.isNaN(t)) continue;
    const d = Math.abs(t - t0);
    if (d < bestAbs) {
      bestAbs = d;
      best = i;
    }
  }
  return best;
}

export function groundSpeedKtFromWind(
  tasKt: number,
  windFromDeg: number,
  windSpeedKt: number,
  trackDeg: number
): number {
  const tw = tailwindComponentKt(windFromDeg, windSpeedKt, trackDeg);
  if (Number.isNaN(tw)) return Math.max(ROUTE_GS_MIN_KT, tasKt);
  return Math.max(ROUTE_GS_MIN_KT, tasKt + tw);
}

export type RouteWindSample = {
  windFromDeg: number;
  windSpeedKt: number;
  pressureHpa: number;
};

/**
 * 指定地点・高度・基準時刻（UTC 解釈は呼び出し側で揃える）の風を 1 気圧面で取得。
 */
export async function fetchWindAtPressureHpa(
  latitude: number,
  longitude: number,
  pressureHpa: number,
  refTime: Date,
  forecastDays = 2
): Promise<RouteWindSample | null> {
  const p = Math.round(pressureHpa);
  const data = await fetchHourlyWindAloft(latitude, longitude, [p], forecastDays);
  if (!data?.hourly.length) return null;
  const times = data.hourly.map((h) => h.time);
  const idx = nearestHourlyTimeIndex(times, refTime);
  const row = data.hourly[idx];
  const w = row.levels.find((l) => l.pressureHpa === p);
  if (!w) return null;
  return { windFromDeg: w.windFromDeg, windSpeedKt: w.speedKt, pressureHpa: p };
}

export async function fetchWindAtLocationTime(
  latitude: number,
  longitude: number,
  altitudeFt: number,
  refTime: Date,
  forecastDays = 2
): Promise<RouteWindSample | null> {
  const p = pressureHpaForAltitudeFt(altitudeFt);
  return fetchWindAtPressureHpa(latitude, longitude, p, refTime, forecastDays);
}

export function addMinutesUtc(d: Date, minutes: number): Date {
  return new Date(d.getTime() + minutes * 60_000);
}
