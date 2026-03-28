/**
 * @deprecated 実装は `api/lib/weatherApiCore.ts` に移動（Vercel 本番バンドルで CommonJS 整合が必要）。
 * dev / 既存 import 互換のため re-export のみ。
 */
export {
  createDevMockFilteredWeather,
  proxyWeatherForecast,
  type WeatherForecastProxyResult,
  type ProxyWeatherForecastOptions,
} from '../api/lib/weatherApiCore';
