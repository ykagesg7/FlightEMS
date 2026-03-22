import type { GeoBBox } from '../utils/openskyTraffic';
import { buildStatesQueryParams, parseOpenSkyStatesJson, type OpenSkyStatesResponse } from '../utils/openskyTraffic';
import { getDevApiBase } from '../utils/devApiBase';

/**
 * プロキシ経由で OpenSky states を取得（/api/opensky-states）
 */
export async function fetchTrafficStates(bbox: GeoBBox): Promise<OpenSkyStatesResponse> {
  const qs = buildStatesQueryParams(bbox).toString();
  const base = getDevApiBase();
  const url = `${base}/api/opensky-states?${qs}`;
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
