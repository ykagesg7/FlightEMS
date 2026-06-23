import type { GeoBBox } from '../utils/openskyTraffic';
import {
  buildStatesQueryParams,
  parseOpenSkyStatesJson,
  quantizeBoundsForTrafficCache,
  type OpenSkyStatesResponse,
} from '../utils/openskyTraffic';
import { getDevApiBase } from '../utils/devApiBase';

export type TrafficFetchResult =
  | { ok: true; response: OpenSkyStatesResponse }
  | { ok: false; status: number; retryAfterSeconds?: number };

/**
 * プロキシ経由で OpenSky states を取得（/api/opensky-states）
 *
 * bbox は量子化してから送信（CDN ヒット率・微小パンでの再取得抑制）。
 */
export async function fetchTrafficStates(bbox: GeoBBox): Promise<TrafficFetchResult> {
  const qbox = quantizeBoundsForTrafficCache(bbox);
  const qs = buildStatesQueryParams(qbox).toString();
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

    let retryAfterSeconds: number | undefined;
    try {
      const errJson = JSON.parse(text) as { retryAfterSeconds?: unknown };
      if (typeof errJson.retryAfterSeconds === 'number' && Number.isFinite(errJson.retryAfterSeconds)) {
        retryAfterSeconds = errJson.retryAfterSeconds;
      }
    } catch {
      /* ignore */
    }

    return { ok: false, status: res.status, retryAfterSeconds };
  }

  const json: unknown = await res.json();
  return { ok: true, response: parseOpenSkyStatesJson(json) };
}
