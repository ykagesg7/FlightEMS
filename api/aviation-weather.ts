/**
 * Vercel Serverless Function: Aviation Weather (METAR/TAF) Proxy
 *
 * エンドポイント:
 * - GET /api/aviation-weather?type=metar&icao=RJAA
 * - GET /api/aviation-weather?type=taf&icao=RJAA
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { proxyAviationWeather } from '../lib/aviationWeatherApiCore';

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

  const result = await proxyAviationWeather(
    req.query as Record<string, string | string[] | undefined>,
  );
  res.status(result.status).json(result.body);
}
