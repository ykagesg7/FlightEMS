/**
 * @deprecated 実装は `api/lib/aviationWeatherApiCore.ts` に移動（Vercel 本番バンドルで CommonJS 整合が必要）。
 * re-export のみ。
 */
export { proxyAviationWeather, type AviationWeatherProxyResult } from '../api/lib/aviationWeatherApiCore';
