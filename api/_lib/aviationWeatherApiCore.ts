/**
 * NOAA Aviation Weather（METAR/TAF）プロキシの共有ロジック（Vercel api + Vite dev プラグイン）
 *
 * 実体は `api/lib/`（本番 CommonJS バンドルと整合）。直下 `lib/` は re-export のみ。
 */
const AVIATION_WEATHER_API_BASE = 'https://aviationweather.gov/api/data';

/** Node 18 未満等で `AbortSignal.timeout` が無い環境向け */
function abortAfterMs(ms: number): { signal: AbortSignal; cancel: () => void } {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return { signal: AbortSignal.timeout(ms), cancel: () => {} };
  }
  const c = new AbortController();
  const id = setTimeout(() => c.abort(), ms);
  return { signal: c.signal, cancel: () => clearTimeout(id) };
}

export type AviationWeatherProxyResult = { status: number; body: unknown };

export async function proxyAviationWeather(
  query: Record<string, string | string[] | undefined>,
): Promise<AviationWeatherProxyResult> {
  const typeRaw = query.type;
  const icaoRaw = query.icao;

  const type = Array.isArray(typeRaw) ? typeRaw[0] : typeRaw;
  const icao = Array.isArray(icaoRaw) ? icaoRaw[0] : icaoRaw;

  if (!type || !icao) {
    return {
      status: 400,
      body: {
        error: 'Missing required parameters',
        message: 'Both "type" and "icao" parameters are required',
      },
    };
  }

  if (type !== 'metar' && type !== 'taf') {
    return {
      status: 400,
      body: {
        error: 'Invalid type parameter',
        message: 'Type must be either "metar" or "taf"',
      },
    };
  }

  if (typeof icao !== 'string' || icao.length < 3 || icao.length > 4) {
    return {
      status: 400,
      body: {
        error: 'Invalid ICAO code',
        message: 'ICAO code must be 3-4 characters',
      },
    };
  }

  const noaaUrl = `${AVIATION_WEATHER_API_BASE}/${type}?ids=${icao.toUpperCase()}&format=json`;

  const { signal, cancel } = abortAfterMs(10000);
  try {
    const response = await fetch(noaaUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'FlightAcademyTsx/1.0',
      },
      signal,
    });

    if (!response.ok) {
      return {
        status: response.status,
        body: {
          error: 'NOAA API Error',
          message: `Failed to fetch ${type.toUpperCase()} data from NOAA`,
          status: response.status,
        },
      };
    }

    const rawText = await response.text();
    let data: unknown;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      return {
        status: 502,
        body: {
          error: 'Invalid NOAA response',
          message: 'NOAA did not return valid JSON',
        },
      };
    }

    // NOAA に該当報が無いときは空配列を 200 で返す（HTTP 404 にするとブラウザが XHR を赤表示する）
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return { status: 200, body: [] };
    }

    return { status: 200, body: data };
  } catch (error: unknown) {
    const name = error instanceof Error ? error.name : '';
    if (name === 'AbortError' || name === 'TimeoutError') {
      return {
        status: 504,
        body: {
          error: 'Gateway Timeout',
          message: 'Request to NOAA API timed out',
        },
      };
    }
    return {
      status: 500,
      body: {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
    };
  } finally {
    cancel();
  }
}
