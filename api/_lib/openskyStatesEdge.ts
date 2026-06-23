/**
 * Edge Runtime 向け OpenSky プロキシ（node:https 非依存・fetch のみ）。
 * Vercel Node サーバレスから opensky-network.org へ届かない場合の本番経路。
 */
import {
  getOpenSkyBearerToken,
  OPENSKY_TOKEN_URL,
  parseTokenResponse,
} from './openskyOAuthToken';

const OPENSKY_BASE = 'https://opensky-network.org/api/states/all';
const OPENSKY_EDGE_STATES_TIMEOUT_MS = 22000;
const OPENSKY_EDGE_TOKEN_TIMEOUT_MS = 5000;
const TRAFFIC_BBOX_QUANTIZE_STEP_DEG = 0.5;

const JAPAN = {
  lamin: 20.0,
  lamax: 46.5,
  lomin: 122.0,
  lomax: 154.5,
};

export type OpenSkyStatesProxyResult = {
  status: number;
  body: unknown;
  retryAfterSeconds?: number;
};

function parseBboxParam(v: string | null | undefined): number | null {
  if (v === undefined || v === null) return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

function quantizeBboxForTrafficCache(
  lamin: number,
  lamax: number,
  lomin: number,
  lomax: number
) {
  const step = TRAFFIC_BBOX_QUANTIZE_STEP_DEG;
  return {
    lamin: Math.floor(lamin / step) * step,
    lamax: Math.ceil(lamax / step) * step,
    lomin: Math.floor(lomin / step) * step,
    lomax: Math.ceil(lomax / step) * step,
  };
}

function clipToJapan(lamin: number, lamax: number, lomin: number, lomax: number) {
  return {
    lamin: Math.max(lamin, JAPAN.lamin),
    lamax: Math.min(lamax, JAPAN.lamax),
    lomin: Math.max(lomin, JAPAN.lomin),
    lomax: Math.min(lomax, JAPAN.lomax),
  };
}

function parseRetryAfterSeconds(headers: Headers): number | undefined {
  const raw = headers.get('x-rate-limit-retry-after-seconds');
  if (!raw) return undefined;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

async function edgeFetchText(
  urlStr: string,
  init: RequestInit & { timeoutMs: number }
): Promise<{ statusCode: number; text: string; headers: Headers }> {
  const res = await fetch(urlStr, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Connection: 'close',
    },
    signal: AbortSignal.timeout(init.timeoutMs),
  });
  const text = await res.text();
  return { statusCode: res.status, text, headers: res.headers };
}

async function fetchOAuthTokenFromEnv(): Promise<ReturnType<typeof parseTokenResponse>> {
  const clientId = process.env.OPENSKY_CLIENT_ID;
  const clientSecret = process.env.OPENSKY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  }).toString();

  try {
    const { statusCode, text } = await edgeFetchText(OPENSKY_TOKEN_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
      timeoutMs: OPENSKY_EDGE_TOKEN_TIMEOUT_MS,
    });
    if (statusCode < 200 || statusCode >= 300) return null;
    return parseTokenResponse(JSON.parse(text) as unknown, Date.now());
  } catch {
    return null;
  }
}

export async function proxyOpenSkyStatesEdge(
  query: Record<string, string | null | undefined>
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

  const quantized = quantizeBboxForTrafficCache(lamin, lamax, lomin, lomax);
  const clipped = clipToJapan(quantized.lamin, quantized.lamax, quantized.lomin, quantized.lomax);
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

  const bearer = await getOpenSkyBearerToken(fetchOAuthTokenFromEnv);
  if (bearer) {
    headers.Authorization = `Bearer ${bearer}`;
  }

  try {
    const { statusCode, text, headers: responseHeaders } = await edgeFetchText(url, {
      method: 'GET',
      headers,
      timeoutMs: OPENSKY_EDGE_STATES_TIMEOUT_MS,
    });

    if (statusCode === 429) {
      const retryAfterSeconds = parseRetryAfterSeconds(responseHeaders);
      return {
        status: 429,
        body: {
          error: 'Too Many Requests',
          message: 'OpenSky rate limit',
          retryAfterSeconds,
        },
        retryAfterSeconds,
      };
    }

    if (statusCode < 200 || statusCode >= 300) {
      return {
        status: 502,
        body: { error: 'Bad Gateway', message: `OpenSky HTTP ${statusCode}` },
      };
    }

    return { status: 200, body: JSON.parse(text) as unknown };
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
