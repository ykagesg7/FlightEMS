import type { VercelRequest, VercelResponse } from '@vercel/node';
import { proxyWeatherForecast } from './lib/weatherApiCore';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  console.log(`Weather API Request - lat: ${request.query.lat}, lon: ${request.query.lon}`);
  console.log(`Environment: WEATHER_API_KEY=${process.env.WEATHER_API_KEY ? 'set' : 'not set'}`);

  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  response.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  const result = await proxyWeatherForecast(
    request.query as Record<string, string | string[] | undefined>,
    { allowMockWithoutKey: false },
  );

  if (result.cacheControl) {
    response.setHeader('Cache-Control', result.cacheControl);
  }

  return response.status(result.status).json(result.body);
}
