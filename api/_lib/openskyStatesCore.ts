/**
 * OpenSky /api/states/all プロキシの共有ロジック
 *
 * 配置は `api/lib/`（Vercel サーバレスが確実にバンドルするため）。
 * ルートの `lib/openskyStatesCore.ts` はここへの re-export。
 *
 * JAPAN は src/utils/openskyTraffic.ts の JAPAN_BBOX と同期すること。
 */
import dns from 'node:dns';
import https from 'node:https';
import type { ClientRequest } from 'node:http';
import {
  getOpenSkyBearerToken,
  OPENSKY_TOKEN_URL,
  parseTokenResponse,
} from './openskyOAuthToken';

/** 補助: undici fetch が Vercel から失敗しても効くよう DNS 明示 IPv4 + https（SNI 維持） */
try {
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch {
  /* 非 Node ランタイムでは無視 */
}

/** Vercel: undici fetch 1 試行あたりの上限（合計は options.timeoutMs 内） */
const VERCEL_FETCH_SLICE_MS = 7000;

/** Vercel: node:https hostname フォールバック（IPv4 直結は fra1 から ETIMEDOUT のため使わない） */
const VERCEL_HTTPS_SLICE_MS = 7000;

/** Vercel: fetch 再試行（Undici の瞬断対策） */
const VERCEL_FETCH_RETRY_MS = 5000;

function formatUpstreamError(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const cause = err.cause instanceof Error ? err.cause.message : '';
  return cause ? `${err.message} (${cause})` : err.message;
}

/** @internal テスト用 */
export function isUpstreamTimeoutError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  if (error.name === 'AbortError' || error.name === 'TimeoutError') return true;
  const msg = error.message.toLowerCase();
  if (msg.includes('timeout') || msg.includes('timed out')) return true;
  const cause = error.cause;
  if (cause instanceof Error) {
    if (cause.name === 'AbortError' || cause.name === 'TimeoutError') return true;
    const code = (cause as NodeJS.ErrnoException).code;
    if (code === 'ETIMEDOUT' || code === 'UND_ERR_CONNECT_TIMEOUT') return true;
  }
  return false;
}

/**
 * Vercel 本番: fetch → node:https(hostname) → fetch 再試行。
 * IPv4 直結は除外（30s 内・OAuth 前置きと両立）。
 */
async function upstreamHttpsRequestVercel(
  urlStr: string,
  options: {
    method: 'GET' | 'POST';
    reqHeaders: Record<string, string>;
    body?: string;
    timeoutMs: number;
  }
): Promise<{ statusCode: number; text: string; responseHeaders: Record<string, string | string[] | undefined> }> {
  const fetchMs = Math.min(VERCEL_FETCH_SLICE_MS, options.timeoutMs);
  const httpsMs = Math.min(
    VERCEL_HTTPS_SLICE_MS,
    Math.max(3000, options.timeoutMs - fetchMs)
  );
  const retryMs = Math.min(
    VERCEL_FETCH_RETRY_MS,
    Math.max(3000, options.timeoutMs - fetchMs - httpsMs)
  );
  const errors: string[] = [];

  try {
    return await fetchUpstreamText(urlStr, { ...options, timeoutMs: fetchMs });
  } catch (err) {
    errors.push(`fetch: ${formatUpstreamError(err)}`);
  }

  try {
    return await httpsRequestByHostname(urlStr, { ...options, timeoutMs: httpsMs });
  } catch (err) {
    errors.push(`hostname: ${formatUpstreamError(err)}`);
  }

  try {
    return await fetchUpstreamText(urlStr, { ...options, timeoutMs: retryMs });
  } catch (err) {
    errors.push(`fetch-retry: ${formatUpstreamError(err)}`);
  }

  throw Object.assign(new Error(errors.join(' | ')), { name: 'UpstreamError' });
}

/**
 * opensky-network.org へ HTTPS（fetch 優先、失敗時 hostname / IPv4 直結の順で試行）。
 * Vercel 本番では undici fetch が不安定なため hostname https フォールバックを挟む（IPv4 直結は使わない）。
 */
async function upstreamHttpsRequest(
  urlStr: string,
  options: {
    method: 'GET' | 'POST';
    reqHeaders: Record<string, string>;
    body?: string;
    timeoutMs: number;
  }
): Promise<{ statusCode: number; text: string; responseHeaders: Record<string, string | string[] | undefined> }> {
  if (process.env.VERCEL) {
    return upstreamHttpsRequestVercel(urlStr, options);
  }

  const fallbackMs = Math.min(options.timeoutMs, OPENSKY_FALLBACK_TIMEOUT_MS);
  const errors: string[] = [];

  try {
    return await fetchUpstreamText(urlStr, options);
  } catch (err) {
    errors.push(`fetch: ${err instanceof Error ? err.message : String(err)}`);
  }

  try {
    return await httpsRequestByHostname(urlStr, { ...options, timeoutMs: fallbackMs });
  } catch (err) {
    errors.push(`hostname: ${err instanceof Error ? err.message : String(err)}`);
  }

  try {
    return await httpsRequestTextIpv4(urlStr, { ...options, timeoutMs: fallbackMs });
  } catch (err) {
    errors.push(`ipv4: ${err instanceof Error ? err.message : String(err)}`);
  }

  throw Object.assign(new Error(errors.join(' | ')), { name: 'UpstreamError' });
}

async function fetchUpstreamText(
  urlStr: string,
  options: {
    method: 'GET' | 'POST';
    reqHeaders: Record<string, string>;
    body?: string;
    timeoutMs: number;
  }
): Promise<{ statusCode: number; text: string; responseHeaders: Record<string, string | string[] | undefined> }> {
  const res = await fetch(urlStr, {
    method: options.method,
    headers: { ...options.reqHeaders, Connection: 'close' },
    body: options.body,
    signal: AbortSignal.timeout(options.timeoutMs),
  });
  const text = await res.text();
  const responseHeaders: Record<string, string | string[] | undefined> = {};
  res.headers.forEach((value, key) => {
    responseHeaders[key.toLowerCase()] = value;
  });
  return { statusCode: res.status, text, responseHeaders };
}

function httpsRequestByHostname(
  urlStr: string,
  options: {
    method: 'GET' | 'POST';
    reqHeaders: Record<string, string>;
    body?: string;
    timeoutMs: number;
  }
): Promise<{ statusCode: number; text: string; responseHeaders: Record<string, string | string[] | undefined> }> {
  const u = new URL(urlStr);
  return new Promise((resolve, reject) => {
    let settled = false;
    let req: ClientRequest | null = null;

    const fail = (err: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      req?.destroy();
      reject(err);
    };

    const ok = (v: {
      statusCode: number;
      text: string;
      responseHeaders: Record<string, string | string[] | undefined>;
    }) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      resolve(v);
    };

    const deadline = setTimeout(() => {
      fail(Object.assign(new Error('OpenSky upstream timeout'), { name: 'TimeoutError' }));
    }, options.timeoutMs);

    req = https.request(
      {
        hostname: u.hostname,
        port: u.port || 443,
        path: `${u.pathname}${u.search}`,
        method: options.method,
        headers: options.reqHeaders,
        agent: false,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (ch) => chunks.push(ch));
        res.on('end', () => {
          ok({
            statusCode: res.statusCode ?? 0,
            text: Buffer.concat(chunks).toString('utf8'),
            responseHeaders: res.headers,
          });
        });
        res.on('error', (err) => {
          fail(err instanceof Error ? err : new Error(String(err)));
        });
      }
    );

    req.on('error', (err) => {
      fail(err instanceof Error ? err : new Error(String(err)));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

/**
 * opensky-network.org へ IPv4 のみで HTTPS GET（Host/SNI は元ホスト名）。
 */
function httpsRequestTextIpv4(
  urlStr: string,
  options: {
    method: 'GET' | 'POST';
    reqHeaders: Record<string, string>;
    body?: string;
    timeoutMs: number;
  }
): Promise<{ statusCode: number; text: string; responseHeaders: Record<string, string | string[] | undefined> }> {
  const u = new URL(urlStr);
  return new Promise((resolve, reject) => {
    let settled = false;
    let req: ClientRequest | null = null;

    const fail = (err: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      req?.destroy();
      reject(err);
    };

    const ok = (v: {
      statusCode: number;
      text: string;
      responseHeaders: Record<string, string | string[] | undefined>;
    }) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      resolve(v);
    };

    const deadline = setTimeout(() => {
      fail(Object.assign(new Error('OpenSky upstream timeout'), { name: 'TimeoutError' }));
    }, options.timeoutMs);

    dns.promises
      .lookup(u.hostname, { family: 4 })
      .then(({ address }) => {
        if (settled) return;
        const headers = { ...options.reqHeaders, Host: u.hostname };
        req = https.request(
          {
            host: address,
            servername: u.hostname,
            port: u.port || 443,
            path: `${u.pathname}${u.search}`,
            method: options.method,
            headers,
            agent: false,
          },
          (res) => {
            const chunks: Buffer[] = [];
            res.on('data', (ch) => chunks.push(ch));
            res.on('end', () => {
              ok({
                statusCode: res.statusCode ?? 0,
                text: Buffer.concat(chunks).toString('utf8'),
                responseHeaders: res.headers,
              });
            });
            res.on('error', (err) => {
              fail(err instanceof Error ? err : new Error(String(err)));
            });
          }
        );

        req.on('error', (err) => {
          fail(err instanceof Error ? err : new Error(String(err)));
        });

        if (options.body) {
          req.write(options.body);
        }
        req.end();
      })
      .catch((err) => {
        fail(err instanceof Error ? err : new Error(String(err)));
      });
  });
}

const OPENSKY_BASE = 'https://opensky-network.org/api/states/all';

/**
 * OpenSky 待ち上限（壁時計）。`vercel.json` maxDuration 30s より短く、
 * フォールバック試行分の余裕も残す。
 */
const OPENSKY_FETCH_TIMEOUT_MS = 18000;

/** ローカル dev フォールバック用 */
const OPENSKY_FALLBACK_TIMEOUT_MS = 6000;

/** OAuth トークン取得（states より前に走るため短め） */
const OPENSKY_TOKEN_TIMEOUT_MS = 8000;

/** CDN ヒット率向上用。src/utils/openskyTraffic.ts の TRAFFIC_BBOX_QUANTIZE_STEP_DEG と同期。 */
export const TRAFFIC_BBOX_QUANTIZE_STEP_DEG = 0.5;

const JAPAN = {
  lamin: 20.0,
  lamax: 46.5,
  lomin: 122.0,
  lomax: 154.5,
};

function parseBboxParam(v: string | string[] | undefined): number | null {
  if (v === undefined) return null;
  const s = Array.isArray(v) ? v[0] : v;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

/** @internal テスト・CDN キー安定化 */
export function quantizeBboxForTrafficCache(
  lamin: number,
  lamax: number,
  lomin: number,
  lomax: number,
  stepDeg = TRAFFIC_BBOX_QUANTIZE_STEP_DEG
): { lamin: number; lamax: number; lomin: number; lomax: number } {
  return {
    lamin: Math.floor(lamin / stepDeg) * stepDeg,
    lamax: Math.ceil(lamax / stepDeg) * stepDeg,
    lomin: Math.floor(lomin / stepDeg) * stepDeg,
    lomax: Math.ceil(lomax / stepDeg) * stepDeg,
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

function parseRetryAfterSeconds(
  headers: Record<string, string | string[] | undefined>
): number | undefined {
  const raw = headers['x-rate-limit-retry-after-seconds'];
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (s === undefined) return undefined;
  const n = parseInt(String(s), 10);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
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
    const { statusCode, text } = await upstreamHttpsRequest(OPENSKY_TOKEN_URL, {
      method: 'POST',
      reqHeaders: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': String(Buffer.byteLength(body)),
        'User-Agent': 'FlightAcademyTsx/1.0',
      },
      body,
      timeoutMs: OPENSKY_TOKEN_TIMEOUT_MS,
    });

    if (statusCode < 200 || statusCode >= 300) {
      console.warn('[opensky-states] OAuth token HTTP', statusCode, text.slice(0, 200));
      return null;
    }

    let json: unknown;
    try {
      json = JSON.parse(text) as unknown;
    } catch {
      return null;
    }
    return parseTokenResponse(json, Date.now());
  } catch (err) {
    console.warn('[opensky-states] OAuth token fetch failed', err);
    return null;
  }
}

export type OpenSkyStatesProxyResult = {
  status: number;
  body: unknown;
  retryAfterSeconds?: number;
};

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
    const { statusCode, text, responseHeaders } = await upstreamHttpsRequest(url, {
      method: 'GET',
      reqHeaders: headers,
      timeoutMs: OPENSKY_FETCH_TIMEOUT_MS,
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

    let data: unknown;
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      return {
        status: 502,
        body: { error: 'Bad Gateway', message: 'OpenSky response was not valid JSON' },
      };
    }
    return { status: 200, body: data };
  } catch (error: unknown) {
    if (isUpstreamTimeoutError(error)) {
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
