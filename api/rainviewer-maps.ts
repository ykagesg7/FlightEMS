/**
 * RainViewer weather-maps.json プロキシ（ブラウザ CORS 回避用・任意）。
 * GET /api/rainviewer-maps
 *
 * クライアントは `VITE_RAINVIEWER_USE_MANIFEST_PROXY=true` で利用。
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

const UPSTREAM = 'https://api.rainviewer.com/public/weather-maps.json';

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
    const upstream = await fetch(UPSTREAM, {
      headers: { Accept: 'application/json', 'User-Agent': 'FlightAcademyTsx/1.0' },
    });
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: 'Upstream error', status: upstream.status });
      return;
    }
    const data = await upstream.json();
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.status(200).json(data);
  } catch (e) {
    console.error('[rainviewer-maps]', e);
    res.status(502).json({ error: 'Proxy failed' });
  }
}
