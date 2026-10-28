/**
 * フライト計画の出発時刻など（hh:mm または hh:mm:ss）を当日の Date に変換する。
 * 無効な入力は `new Date(NaN)` を返す。
 *
 * `parseFlightPlanTime` は端末ローカル暦日。Open-Meteo など UTC 基準の参照には
 * `flightPlanTimeJstToUtc` を使う（departureTime は JST 壁時計）。
 */
export function parseFlightPlanTime(timeStr: string): Date {
  if (!timeStr || timeStr === '--' || typeof timeStr !== 'string') {
    return new Date(NaN);
  }
  const parts = timeStr.split(':').map((p) => parseInt(p, 10));
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (parts.length === 2) {
    const [h, m] = parts;
    if (!isNaN(h) && !isNaN(m)) {
      date.setHours(h, m, 0, 0);
    } else {
      return new Date(NaN);
    }
  } else if (parts.length === 3) {
    const [h, m, s] = parts;
    if (!isNaN(h) && !isNaN(m) && !isNaN(s)) {
      date.setHours(h, m, s, 0);
    } else {
      return new Date(NaN);
    }
  } else {
    return new Date(NaN);
  }
  if (isNaN(date.getTime())) {
    return new Date(NaN);
  }
  return date;
}

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

export const JST_TIME_ZONE = 'Asia/Tokyo';

/** Current wall clock in Asia/Tokyo as `HH:MM` (24h). */
export function formatJstWallClockTime(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: JST_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const hour = parts.find((part) => part.type === 'hour')?.value ?? '00';
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '00';
  return `${hour}:${minute}`;
}

function parseHms(timeStr: string): { h: number; m: number; s: number } | null {
  if (!timeStr || timeStr === '--' || typeof timeStr !== 'string') return null;
  const parts = timeStr.split(':').map((p) => parseInt(p, 10));
  if (parts.length === 2 && parts.every((n) => Number.isFinite(n))) {
    return { h: parts[0], m: parts[1], s: 0 };
  }
  if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
    return { h: parts[0], m: parts[1], s: parts[2] };
  }
  return null;
}

/**
 * `departureTime`（JST の HH:MM）を、基準日時の JST 暦日における UTC Date にする。
 */
export function flightPlanTimeJstToUtc(timeStr: string, now = new Date()): Date {
  const hms = parseHms(timeStr);
  if (!hms) return new Date(NaN);
  const jstNow = new Date(now.getTime() + JST_OFFSET_MS);
  const y = jstNow.getUTCFullYear();
  const month = jstNow.getUTCMonth();
  const day = jstNow.getUTCDate();
  return new Date(Date.UTC(y, month, day, hms.h, hms.m, hms.s) - JST_OFFSET_MS);
}

/** UTC `HH:MM` for a JST departure wall time on the JST calendar day of `now`. */
export function formatUtcWallClockFromJstDeparture(timeStr: string, now = new Date()): string {
  const utc = flightPlanTimeJstToUtc(timeStr, now);
  if (Number.isNaN(utc.getTime())) return '--:--';
  return `${String(utc.getUTCHours()).padStart(2, '0')}:${String(utc.getUTCMinutes()).padStart(2, '0')}`;
}

export function addMinutesUtc(d: Date, minutes: number): Date {
  return new Date(d.getTime() + minutes * 60_000);
}
