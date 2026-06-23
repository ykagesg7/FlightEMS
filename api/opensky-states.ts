/**
 * Vercel Edge: OpenSky Network /api/states/all プロキシ（CORS 回避・日本域クリップ）
 *
 * Node サーバレス（fra1 / iad1）から opensky-network.org へ届かない事象があるため
 * Edge Runtime + fetch のみで上流へ接続する。
 */
import { proxyOpenSkyStatesEdge } from './_lib/openskyStatesEdge';

export const config = {
  runtime: 'edge',
};

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }

  if (request.method !== 'GET') {
    return Response.json({ error: 'Method Not Allowed' }, { status: 405, headers: CORS_HEADERS });
  }

  try {
    const url = new URL(request.url);
    const query: Record<string, string | null> = {
      lamin: url.searchParams.get('lamin'),
      lamax: url.searchParams.get('lamax'),
      lomin: url.searchParams.get('lomin'),
      lomax: url.searchParams.get('lomax'),
    };

    const result = await proxyOpenSkyStatesEdge(query);
    const headers = new Headers(CORS_HEADERS);
    if (result.status === 200) {
      headers.set('Cache-Control', 'public, s-maxage=150, stale-while-revalidate=180');
    }
    return Response.json(result.body, { status: result.status, headers });
  } catch (err) {
    console.error('[opensky-states]', err);
    return Response.json(
      {
        error: 'Internal Server Error',
        message: err instanceof Error ? err.message : 'handler failed',
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
