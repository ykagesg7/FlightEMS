/**
 * Vercel Serverless: OpenSky Network /api/states/all プロキシ（CORS 回避・日本域クリップ）
 *
 * GET /api/opensky-states?lamin=&lamax=&lomin=&lomax=
 * クエリはサーバ側で日本域 BBOX に再度クリップする。
 *
 * オプション: OPENSKY_USERNAME / OPENSKY_PASSWORD で Basic 認証（レート緩和）
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * vercel dev は api/*.ts を CJS の require 経由で読み込むことがあり、
 * package.json の "type":"module" 下の ../lib/*.ts を静的 import すると ESM エラーになる。
 * 動的 import() はランタイムの ESM ローダを使うためここで解決する。
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { proxyOpenSkyStates } = await import('../lib/openskyStatesCore');
  const result = await proxyOpenSkyStates(req.query);
  res.status(result.status).json(result.body);
}
