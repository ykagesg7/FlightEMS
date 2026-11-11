import type { VercelRequest, VercelResponse } from '@vercel/node';

function isLocalDevOrigin(origin: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

function vercelOriginAllowed(origin: string): boolean {
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) {
    const prodOrigin = production.startsWith('http') ? production : `https://${production}`;
    if (origin === prodOrigin) return true;
  }
  const deployment = process.env.VERCEL_URL?.trim();
  if (deployment) {
    const depOrigin = deployment.startsWith('http') ? deployment : `https://${deployment}`;
    if (origin === depOrigin) return true;
  }
  return false;
}

/** SWIM プロキシ用 CORS（ワイルドカード禁止） */
export function applySwimNotamCors(req: VercelRequest, res: VercelResponse): void {
  const configured = process.env.ALLOWED_ORIGIN?.trim();
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;

  if (configured && configured !== '*') {
    res.setHeader('Access-Control-Allow-Origin', configured);
  } else if (origin && (isLocalDevOrigin(origin) || vercelOriginAllowed(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
}
