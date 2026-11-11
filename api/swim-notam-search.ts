/**
 * SWIM デジタルノータム検索プロキシ（認証情報はサーバのみ）
 *
 * GET /api/swim-notam-search?location=RJTT
 * GET /api/swim-notam-search?keyword=XXXX&andOrCondition=0
 * 任意: fir, nof
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { dispatchSwimNotamSearch } from './_lib/swimNotamHttpShared';
import { applySwimNotamCors } from './_lib/swimNotamCors';
import { checkSwimNotamRateLimit } from './_lib/swimNotamRateLimit';
import { getSwimNotamClientKey } from './_lib/swimNotamRequest';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySwimNotamCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }

  const rate = checkSwimNotamRateLimit(getSwimNotamClientKey(req));
  if (!rate.ok) {
    res.setHeader('Retry-After', String(rate.retryAfterSeconds));
    res.status(429).json({
      ok: false,
      error: 'リクエストが多すぎます。しばらくしてから再度お試しください。',
      retryAfterSeconds: rate.retryAfterSeconds,
    });
    return;
  }

  try {
    const { status, body, cacheControl } = await dispatchSwimNotamSearch(req.query);
    if (cacheControl) res.setHeader('Cache-Control', cacheControl);
    res.status(status).json(body);
  } catch (err) {
    console.error('[swim-notam-search]', err);
    res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : 'Internal error',
    });
  }
}
