import type { VercelRequest, VercelResponse } from '@vercel/node';
import { proxyAviationWeather } from './_lib/aviationWeatherApiCore';
import { proxyWeatherForecast } from './_lib/weatherApiCore';

const RAINVIEWER_UPSTREAM = 'https://api.rainviewer.com/public/weather-maps.json';

export type WeatherAction = 'forecast' | 'aviation' | 'rainviewer';

export function resolveWeatherAction(req: VercelRequest): WeatherAction {
  const raw = req.query.action;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === 'aviation' || value === 'rainviewer' || value === 'forecast') {
    return value;
  }

  const path = (req.url ?? '').split('?')[0];
  if (path.includes('aviation-weather')) {
    return 'aviation';
  }
  if (path.includes('rainviewer-maps')) {
    return 'rainviewer';
  }
  return 'forecast';
}

function setCors(response: VercelResponse): void {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  response.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function handleRainviewerMaps(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const upstream = await fetch(RAINVIEWER_UPSTREAM, {
      headers: { Accept: 'application/json', 'User-Agent': 'FlightAcademyTsx/1.0' },
    });
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: 'Upstream error', status: upstream.status });
      return;
    }
    const data: unknown = await upstream.json();
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.status(200).json(data);
  } catch (e) {
    console.error('[rainviewer-maps]', e);
    res.status(502).json({ error: 'Proxy failed' });
  }
}

/**
 * Hobby の関数本数を抑えるため、一般気象・METAR/TAF・RainViewer を 1 ファイルにまとめる。
 * 既存 URL は vercel.json の rewrite で `?action=` に載せる。
 */
export default async function handler(request: VercelRequest, response: VercelResponse) {
  setCors(response);

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  const action = resolveWeatherAction(request);

  if (action === 'aviation') {
    if (request.method !== 'GET') {
      return response.status(405).json({ error: 'Method Not Allowed' });
    }
    const result = await proxyAviationWeather(
      request.query as Record<string, string | string[] | undefined>,
    );
    return response.status(result.status).json(result.body);
  }

  if (action === 'rainviewer') {
    return handleRainviewerMaps(request, response);
  }

  console.log(`Weather API Request - lat: ${request.query.lat}, lon: ${request.query.lon}`);
  console.log(`Environment: WEATHER_API_KEY=${process.env.WEATHER_API_KEY ? 'set' : 'not set'}`);

  const result = await proxyWeatherForecast(
    request.query as Record<string, string | string[] | undefined>,
    { allowMockWithoutKey: false },
  );

  if (result.cacheControl) {
    response.setHeader('Cache-Control', result.cacheControl);
  }

  return response.status(result.status).json(result.body);
}
