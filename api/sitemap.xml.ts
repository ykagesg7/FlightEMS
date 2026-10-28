import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildRuntimeSitemapXml } from './_lib/sitemapHttp';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.status(405).setHeader('Allow', 'GET, HEAD, OPTIONS').end('Method Not Allowed');
    return;
  }

  try {
    const xml = await buildRuntimeSitemapXml(process.env);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200);
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    res.send(xml);
  } catch (error) {
    console.error('[sitemap.xml]', error);
    res.status(500).setHeader('Content-Type', 'text/plain; charset=utf-8').end('Sitemap unavailable');
  }
}
