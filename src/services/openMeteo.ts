/**
 * Open-Meteo Forecast API（非商用無料枠向け・CC BY 4.0）。
 * 巡航高度帯の比較用に、地点の気圧面ごとの風を hourly で取得する。
 * @see https://open-meteo.com/en/terms
 * @see https://open-meteo.com/en/docs
 */

export const OPEN_METEO_FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast';

/** デフォルトはよく使う気圧面（変数数を抑える） */
export const DEFAULT_PRESSURE_LEVELS_HPA = [250, 300, 450, 700, 850] as const;

export type WindAtLevel = {
  pressureHpa: number;
  windFromDeg: number;
  speedKt: number;
};

export type HourlyWindAloftRow = {
  time: string;
  levels: WindAtLevel[];
};

export type OpenMeteoHourlyWindAloftResult = {
  latitude: number;
  longitude: number;
  hourly: HourlyWindAloftRow[];
};

/** テスト用: hourly クエリ用の変数名を列挙 */
export function buildOpenMeteoHourlyWindParams(pressureLevelsHpa: readonly number[]): string {
  const parts: string[] = [];
  for (const p of pressureLevelsHpa) {
    if (!Number.isFinite(p) || p <= 0) continue;
    const h = Math.round(p);
    parts.push(`wind_speed_${h}hPa`, `wind_direction_${h}hPa`);
  }
  return parts.join(',');
}

export function buildOpenMeteoHourlyWindUrl(
  latitude: number,
  longitude: number,
  pressureLevelsHpa: readonly number[],
  forecastDays = 3
): string {
  const hourly = buildOpenMeteoHourlyWindParams(pressureLevelsHpa);
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    hourly,
    wind_speed_unit: 'kn',
    forecast_days: String(Math.min(16, Math.max(1, forecastDays))),
  });
  return `${OPEN_METEO_FORECAST_BASE}?${params.toString()}`;
}

function hourlyArray(obj: Record<string, unknown>, key: string): (number | null)[] | null {
  const v = obj[key];
  if (!Array.isArray(v)) return null;
  return v as (number | null)[];
}

/**
 * Open-Meteo の forecast JSON をパースする（hourly ブロック想定）。
 */
export function parseOpenMeteoHourlyWindAloft(
  json: unknown,
  pressureLevelsHpa: readonly number[]
): OpenMeteoHourlyWindAloftResult | null {
  if (!json || typeof json !== 'object') return null;
  const root = json as Record<string, unknown>;
  const lat = root.latitude;
  const lon = root.longitude;
  if (typeof lat !== 'number' || typeof lon !== 'number') return null;

  const hourly = root.hourly;
  if (!hourly || typeof hourly !== 'object') return null;
  const h = hourly as Record<string, unknown>;
  const times = h.time;
  if (!Array.isArray(times) || times.length === 0) return null;
  const timeStrs = times.filter((t): t is string => typeof t === 'string');

  const rows: HourlyWindAloftRow[] = [];
  const n = timeStrs.length;

  for (let i = 0; i < n; i++) {
    const levels: WindAtLevel[] = [];
    for (const p of pressureLevelsHpa) {
      const keyS = `wind_speed_${Math.round(p)}hPa`;
      const keyD = `wind_direction_${Math.round(p)}hPa`;
      const arrS = hourlyArray(h, keyS);
      const arrD = hourlyArray(h, keyD);
      const spd = arrS?.[i];
      const dir = arrD?.[i];
      if (typeof spd === 'number' && typeof dir === 'number' && Number.isFinite(spd) && Number.isFinite(dir)) {
        levels.push({ pressureHpa: Math.round(p), windFromDeg: dir, speedKt: spd });
      }
    }
    rows.push({ time: timeStrs[i], levels });
  }

  return { latitude: lat, longitude: lon, hourly: rows };
}

/** 同一 URL の同時 fetch を 1 本にまとめる・短期キャッシュで格子取得の負荷を抑える */
const inflightByUrl = new Map<string, Promise<OpenMeteoHourlyWindAloftResult | null>>();
const okResponseCache = new Map<string, { fetchedAt: number; data: OpenMeteoHourlyWindAloftResult }>();
/** 上層風は急変しない前提で格子・経路計算の両方で再利用 */
const RESPONSE_CACHE_TTL_MS = 45 * 60 * 1000;
const RESPONSE_CACHE_MAX = 200;

let rateLimitUntilMs = 0;
let last429LogAtMs = 0;
const RATE_LIMIT_LOG_INTERVAL_MS = 15_000;

function parseRetryAfterSeconds(res: Response): number | null {
  const ra = res.headers.get('Retry-After');
  if (!ra) return null;
  const n = parseInt(ra, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function trimOkCache(): void {
  while (okResponseCache.size > RESPONSE_CACHE_MAX) {
    const first = okResponseCache.keys().next().value;
    if (first === undefined) break;
    okResponseCache.delete(first);
  }
}

/** テスト用 */
export function clearOpenMeteoClientFetchStateForTests(): void {
  inflightByUrl.clear();
  okResponseCache.clear();
  rateLimitUntilMs = 0;
  last429LogAtMs = 0;
}

/**
 * ブラウザまたは Node から forecast を取得してパースする。
 * 429 時はグローバルにバックオフし、同一 URL の並列呼び出しは 1 本に結合する。
 */
export async function fetchHourlyWindAloft(
  latitude: number,
  longitude: number,
  pressureLevelsHpa: readonly number[] = DEFAULT_PRESSURE_LEVELS_HPA,
  forecastDays = 3
): Promise<OpenMeteoHourlyWindAloftResult | null> {
  const url = buildOpenMeteoHourlyWindUrl(latitude, longitude, pressureLevelsHpa, forecastDays);
  const now = Date.now();
  if (now < rateLimitUntilMs) {
    return null;
  }

  const hit = okResponseCache.get(url);
  if (hit && now - hit.fetchedAt < RESPONSE_CACHE_TTL_MS) {
    return hit.data;
  }

  const existing = inflightByUrl.get(url);
  if (existing) return existing;

  const run = (async (): Promise<OpenMeteoHourlyWindAloftResult | null> => {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (res.status === 429) {
        const sec = parseRetryAfterSeconds(res) ?? 45;
        rateLimitUntilMs = Date.now() + sec * 1000;
        if (Date.now() - last429LogAtMs > RATE_LIMIT_LOG_INTERVAL_MS) {
          last429LogAtMs = Date.now();
          console.warn(
            `[openMeteo] rate limited (429); pausing requests ~${sec}s. Pan/zoom wind grid less aggressively.`,
          );
        }
        return null;
      }
      if (!res.ok) {
        if (import.meta.env.DEV) {
          console.warn('[openMeteo] forecast failed', res.status);
        }
        return null;
      }
      const json = await res.json();
      const parsed = parseOpenMeteoHourlyWindAloft(json, pressureLevelsHpa);
      if (parsed) {
        okResponseCache.set(url, { fetchedAt: Date.now(), data: parsed });
        trimOkCache();
      }
      return parsed;
    } finally {
      inflightByUrl.delete(url);
    }
  })();

  inflightByUrl.set(url, run);
  return run;
}
