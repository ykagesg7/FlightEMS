/**
 * Vercel Serverless: OpenSky Network /api/states/all プロキシ（CORS 回避・日本域クリップ）
 *
 * GET /api/opensky-states?lamin=&lamax=&lomin=&lomax=
 * クエリはサーバ側で日本域 BBOX に再度クリップする。
 *
 * オプション: OPENSKY_USERNAME / OPENSKY_PASSWORD で Basic 認証（レート緩和）
 *
 * 共有ロジックは静的 import（@vercel/node の依存トレースで lib がバンドルに含まれる）。
 * vercel dev で CJS/ESM 不整合が出る場合は `npm run dev:full` または Vite プラグイン経由を利用。
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { proxyOpenSkyStates } from '../lib/openskyStatesCore';

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

  try {
    const result = await proxyOpenSkyStates(req.query);
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error('[opensky-states]', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err instanceof Error ? err.message : 'handler failed',
    });
  }
}
