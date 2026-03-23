/**
 * OpenSky /api/states/all プロキシの共有ロジック
 *
 * 配置は `api/lib/`（Vercel サーバレスが確実にバンドルするため）。
 * ルートの `lib/openskyStatesCore.ts` はここへの re-export。
 *
 * JAPAN は src/utils/openskyTraffic.ts の JAPAN_BBOX と同期すること。
 */
import dns from 'node:dns';

/** Vercel 上の Node fetch(undici) が IPv6 を優先し opensky-network.org へ繋がらず `fetch failed` になる事例への対策 */
try {
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch {
  /* 非 Node ランタイムでは無視 */
}

const OPENSKY_BASE = 'https://opensky-network.org/api/states/all';

/**
 * OpenSky 待ち上限。`vercel.json` の `maxDuration` 未満に収める。
 * 既定リージョン iad1 から欧州の OpenSky へは往復が重く ~10s 付近で undici が `fetch failed` になりやすい。
 * `vercel.json` で `api/opensky-states.ts` を `fra1` に寄せる前提で 12s。
 */
const OPENSKY_FETCH_TIMEOUT_MS = 12000;

const JAPAN = {
  lamin: 20.0,
  lamax: 46.5,
  lomin: 122.0,
  lomax: 154.5,
};

/** Node 18 未満・一部ランタイム向け（AbortSignal.timeout 非対応時） */
function abortAfter(ms: number): AbortSignal {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms);
  }
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), ms);
  return ctrl.signal;
}

function parseBboxParam(v: string | string[] | undefined): number | null {
  if (v === undefined) return null;
  const s = Array.isArray(v) ? v[0] : v;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

function clipToJapan(lamin: number, lamax: number, lomin: number, lomax: number) {
  return {
    lamin: Math.max(lamin, JAPAN.lamin),
    lamax: Math.min(lamax, JAPAN.lamax),
    lomin: Math.max(lomin, JAPAN.lomin),
    lomax: Math.min(lomax, JAPAN.lomax),
  };
}

export type OpenSkyStatesProxyResult = { status: number; body: unknown };

/**
 * クエリ（lamin/lamax/lomin/lomax）から OpenSky を取得し、HTTP 応答相当を返す。
 */
export async function proxyOpenSkyStates(
  query: Record<string, string | string[] | undefined>
): Promise<OpenSkyStatesProxyResult> {
  const lamin = parseBboxParam(query.lamin);
  const lamax = parseBboxParam(query.lamax);
  const lomin = parseBboxParam(query.lomin);
  const lomax = parseBboxParam(query.lomax);

  if (lamin === null || lamax === null || lomin === null || lomax === null) {
    return {
      status: 400,
      body: {
        error: 'Bad Request',
        message: 'Required query: lamin, lamax, lomin, lomax (finite numbers)',
      },
    };
  }

  if (lamin > lamax || lomin > lomax) {
    return {
      status: 400,
      body: {
        error: 'Bad Request',
        message: 'Invalid bbox: lamin <= lamax and lomin <= lomax required',
      },
    };
  }

  const clipped = clipToJapan(lamin, lamax, lomin, lomax);
  if (clipped.lamin > clipped.lamax || clipped.lomin > clipped.lomax) {
    return { status: 200, body: { time: 0, states: [] } };
  }

  const qs = new URLSearchParams({
    lamin: String(clipped.lamin),
    lamax: String(clipped.lamax),
    lomin: String(clipped.lomin),
    lomax: String(clipped.lomax),
  });
  const url = `${OPENSKY_BASE}?${qs.toString()}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'User-Agent': 'FlightAcademyTsx/1.0',
  };
  const user = process.env.OPENSKY_USERNAME;
  const pass = process.env.OPENSKY_PASSWORD;
  if (user && pass) {
    headers.Authorization = `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: abortAfter(OPENSKY_FETCH_TIMEOUT_MS),
    });

    if (response.status === 429) {
      return {
        status: 429,
        body: { error: 'Too Many Requests', message: 'OpenSky rate limit' },
      };
    }

    if (!response.ok) {
      return {
        status: 502,
        body: { error: 'Bad Gateway', message: `OpenSky HTTP ${response.status}` },
      };
    }

    const data = await response.json();
    return { status: 200, body: data };
  } catch (error: unknown) {
    const name = error instanceof Error ? error.name : '';
    if (name === 'AbortError' || name === 'TimeoutError') {
      return {
        status: 504,
        body: { error: 'Gateway Timeout', message: 'OpenSky request timed out' },
      };
    }
    return {
      status: 502,
      body: {
        error: 'Bad Gateway',
        message: error instanceof Error ? error.message : 'upstream fetch failed',
      },
    };
  }
}
