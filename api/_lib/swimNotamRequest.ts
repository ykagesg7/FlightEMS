import type { VercelRequest } from '@vercel/node';

export function getSwimNotamClientKey(req: VercelRequest): string {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0]?.trim() || 'unknown';
  }
  if (Array.isArray(xff) && xff[0]) {
    return String(xff[0]).trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.length > 0) return realIp.trim();
  return 'unknown';
}
