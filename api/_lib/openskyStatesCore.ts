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

/** 補助: undici fetch が Vercel から失敗しても効くよう DNS 明示 IPv4 + https（SNI 維持） */
try {
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch {
  /* 非 Node ランタイムでは無視 */
}

/**
 * opensky-network.org へ IPv4 のみで HTTPS GET（Host/SNI は元ホスト名）。
 * 本番で global fetch が `fetch failed` となるため undici に依存しない。
 *
 * 壁時計ベースの絶対期限: `req.setTimeout` は受信チャンクごとに延長されうり、
 * 大きな JSON の遅い転送で Vercel maxDuration を超えて 504 になるため使わない。
 */
function httpsGetTextIpv4(
  urlStr: string,
  reqHeaders: Record<string, string>,
  timeoutMs: number
): Promise<{ statusCode: number; text: string }> {
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

    const ok = (v: { statusCode: number; text: string }) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      resolve(v);
    };

    const deadline = setTimeout(() => {
      fail(Object.assign(new Error('OpenSky upstream timeout'), { name: 'TimeoutError' }));
    }, timeoutMs);

    dns.promises
      .lookup(u.hostname, { family: 4 })
      .then(({ address }) => {
        if (settled) return;
        req = https.request(
          {
            host: address,
            servername: u.hostname,
            port: u.port || 443,
            path: `${u.pathname}${u.search}`,
            method: 'GET',
            headers: { ...reqHeaders, Host: u.hostname },
            agent: false,
          },
          (res) => {
            const chunks: Buffer[] = [];
            res.on('data', (ch) => chunks.push(ch));
            res.on('end', () => {
              ok({
                statusCode: res.statusCode ?? 0,
                text: Buffer.concat(chunks).toString('utf8'),
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

        req.end();
      })
      .catch((err) => {
        fail(err instanceof Error ? err : new Error(String(err)));
      });
  });
}

const OPENSKY_BASE = 'https://opensky-network.org/api/states/all';

/**
 * OpenSky 待ち上限（壁時計）。`vercel.json` の `api/opensky-states.ts` の maxDuration より
 * 数秒短くし、JSON 解析とレスポンス送信の余裕を残す。
 */
const OPENSKY_FETCH_TIMEOUT_MS = 26000;

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
    const { statusCode, text } = await httpsGetTextIpv4(url, headers, OPENSKY_FETCH_TIMEOUT_MS);

    if (statusCode === 429) {
      return {
        status: 429,
        body: { error: 'Too Many Requests', message: 'OpenSky rate limit' },
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
