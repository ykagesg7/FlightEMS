import type { GeoBBox } from '../utils/openskyTraffic';
import { buildStatesQueryParams, parseOpenSkyStatesJson, type OpenSkyStatesResponse } from '../utils/openskyTraffic';
import { getDevApiBase } from '../utils/devApiBase';

/**
 * プロキシ経由で OpenSky states を取得（/api/opensky-states）
 *
 * 本番では `window.location.origin` を優先する（weather / aviation-weather と同様）。
 * `VITE_VERCEL_DEV_API_ORIGIN` が Production に誤設定されると getDevApiBase() だけだと
 * localhost へ向き、ブラウザから到達不能で常に空表示になる。
 */
export async function fetchTrafficStates(bbox: GeoBBox): Promise<OpenSkyStatesResponse> {
  const qs = buildStatesQueryParams(bbox).toString();
  const isProd = import.meta.env.PROD;
  const deploymentDomain =
    isProd && typeof window !== 'undefined' ? window.location.origin : null;
  const devApi = getDevApiBase();
  const url = deploymentDomain
    ? `${deploymentDomain}/api/opensky-states?${qs}`
    : devApi
      ? `${devApi}/api/opensky-states?${qs}`
      : `/api/opensky-states?${qs}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.warn('[openskyTraffic] fetch failed', res.status, text.slice(0, 200));
    return { time: 0, states: [] };
  }

  const json: unknown = await res.json();
  return parseOpenSkyStatesJson(json);
}
