import type { GeoBBox } from '../utils/openskyTraffic';
import {
  buildAirplanesLiveUrl,
  filterAircraftToBBox,
  parseAirplanesLiveJson,
  type OpenSkyStatesResponse,
} from '../utils/openskyTraffic';

export type TrafficFetchResult =
  | { ok: true; response: OpenSkyStatesResponse }
  | { ok: false; status: number; retryAfterSeconds?: number };

/**
 * airplanes.live（ADSBExchange v2 互換）から ADS-B 機体を直接取得する。
 *
 * OpenSky はクラウド（Vercel）IP を遮断するためサーバ側プロキシが使えず、
 * かつ OpenSky の CORS は自社オリジンのみ許可でブラウザ直 fetch も不可。
 * airplanes.live は `Access-Control-Allow-Origin: *` でブラウザ直 fetch 可能。
 *
 * 表示矩形は中心 + 半径（最大 250NM）へ変換して問い合わせ、結果を矩形へ絞り込む。
 * レート制限は 1 req/sec。クライアントのポーリングは 3 分間隔のため余裕がある。
 */
export async function fetchTrafficStates(bbox: GeoBBox): Promise<TrafficFetchResult> {
  const url = buildAirplanesLiveUrl(bbox);

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
  } catch (err) {
    console.warn('[openskyTraffic] fetch error', err);
    return { ok: false, status: 0 };
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.warn('[openskyTraffic] fetch failed', res.status, text.slice(0, 200));

    let retryAfterSeconds: number | undefined;
    const header = res.headers.get('retry-after');
    if (header) {
      const n = parseInt(header, 10);
      if (Number.isFinite(n) && n >= 0) retryAfterSeconds = n;
    }

    return { ok: false, status: res.status, retryAfterSeconds };
  }

  const json: unknown = await res.json();
  const parsed = parseAirplanesLiveJson(json);
  return {
    ok: true,
    response: { time: parsed.time, states: filterAircraftToBBox(parsed.states, bbox) },
  };
}
