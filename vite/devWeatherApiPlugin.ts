import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin, ViteDevServer } from 'vite';
import { loadEnv } from 'vite';

type Next = (err?: unknown) => void;

/**
 * `ssrLoadModule` が named export を `{ default: { fn, ... } }` で返すことがある（依存の interop）。
 * `dispatchSwimNotamSearch` が undefined になり 500 になるのを防ぐ。
 */
function unwrapSsrModuleExports<T extends Record<string, unknown>>(loaded: unknown): T {
  if (
    loaded !== null &&
    typeof loaded === 'object' &&
    'default' in loaded &&
    (loaded as { default: unknown }).default !== null &&
    typeof (loaded as { default: unknown }).default === 'object'
  ) {
    return (loaded as { default: T }).default;
  }
  return loaded as T;
}

function parseQuery(rawUrl: string): Record<string, string | string[] | undefined> {
  const u = new URL(rawUrl, 'http://127.0.0.1');
  const query: Record<string, string | string[] | undefined> = {};
  u.searchParams.forEach((value, key) => {
    query[key] = value;
  });
  return query;
}

function sendCorsJson(
  res: ServerResponse,
  status: number,
  body: unknown,
  extraHeaders?: Record<string, string>,
) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (extraHeaders) {
    for (const [k, v] of Object.entries(extraHeaders)) {
      res.setHeader(k, v);
    }
  }
  res.end(JSON.stringify(body));
}

/**
 * npm run dev のみ（dev:weather / 3001 プロキシなし）でも以下が動く:
 * - /api/weather … WEATHER_API_KEY が .env にあれば WeatherAPI.com、なければモック
 * - /api/aviation-weather … NOAA METAR/TAF（キー不要）
 * - /api/swim-notam-search … SWIM（.env.local の SWIM_LOGIN_* を process.env に補完）
 */
export function devWeatherApiPlugin(): Plugin {
  return {
    name: 'dev-weather-api',
    enforce: 'pre',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      const handle = async (req: IncomingMessage, res: ServerResponse, next: Next) => {
        const rawUrl = req.url ?? '';
        const isWeather = rawUrl.startsWith('/api/weather');
        const isAviation = rawUrl.startsWith('/api/aviation-weather');
        const isSwim = rawUrl.startsWith('/api/swim-notam-search');
        if (!isWeather && !isAviation && !isSwim) {
          next();
          return;
        }

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.end();
          return;
        }

        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        try {
          const query = parseQuery(rawUrl);

          if (isSwim) {
            const env = loadEnv(server.config.mode, process.cwd(), '');
            const rawSwim = await server.ssrLoadModule('/api/lib/swimNotamHttpShared.ts');
            const mod = unwrapSsrModuleExports<{
              mergeSwimEnvFromLoaded: (e: Record<string, string>) => void;
              dispatchSwimNotamSearch: (
                q: Record<string, string | string[] | undefined>,
              ) => Promise<{ status: number; body: unknown; cacheControl?: string }>;
            }>(rawSwim);
            const { mergeSwimEnvFromLoaded, dispatchSwimNotamSearch } = mod;
            mergeSwimEnvFromLoaded(env);
            const result = await dispatchSwimNotamSearch(query);
            const extra: Record<string, string> = {};
            if (result.cacheControl) {
              extra['Cache-Control'] = result.cacheControl;
            }
            sendCorsJson(res, result.status, result.body, extra);
            return;
          }

          if (isAviation) {
            const rawAviation = await server.ssrLoadModule('/api/lib/aviationWeatherApiCore.ts');
            const mod = unwrapSsrModuleExports<{
              proxyAviationWeather: (
                q: Record<string, string | string[] | undefined>,
              ) => Promise<{ status: number; body: unknown }>;
            }>(rawAviation);
            const { proxyAviationWeather } = mod;
            const result = await proxyAviationWeather(query);
            sendCorsJson(res, result.status, result.body);
            return;
          }

          const env = loadEnv(server.config.mode, process.cwd(), '');
          const apiKey = env.WEATHER_API_KEY || process.env.WEATHER_API_KEY || '';

          const rawWeather = await server.ssrLoadModule('/api/lib/weatherApiCore.ts');
          const mod = unwrapSsrModuleExports<{
            proxyWeatherForecast: (
              q: Record<string, string | string[] | undefined>,
              opts?: { apiKey?: string; allowMockWithoutKey?: boolean },
            ) => Promise<{ status: number; body: unknown; cacheControl?: string }>;
          }>(rawWeather);
          const { proxyWeatherForecast } = mod;
          const result = await proxyWeatherForecast(query, {
            apiKey: apiKey || undefined,
            allowMockWithoutKey: true,
          });
          const extra: Record<string, string> = {};
          if (result.cacheControl) {
            extra['Cache-Control'] = result.cacheControl;
          }
          sendCorsJson(res, result.status, result.body, extra);
        } catch (err) {
          console.error('[dev-weather-api]', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ error: 'Internal Server Error' }));
        }
      };

      const stack = (server.middlewares as { stack: { route: string; handle: typeof handle }[] }).stack;
      stack.unshift({ route: '', handle });
    },
  };
}
