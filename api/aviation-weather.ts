/**
 * Vercel Serverless Function: Aviation Weather (METAR/TAF) Proxy
 *
 * NOAA Aviation Weather Center APIへのサーバーサイドプロキシ
 * CORSエラーを回避するため、サーバーサイドでAPIを呼び出す
 *
 * エンドポイント:
 * - GET /api/aviation-weather?type=metar&icao=RJAA
 * - GET /api/aviation-weather?type=taf&icao=RJAA
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// NOAA Aviation Weather Center API Base URL
const AVIATION_WEATHER_API_BASE = 'https://aviationweather.gov/api/data';

/**
 * Vercel Serverless Function
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONSリクエスト（プリフライト）への対応
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GETメソッドのみ許可
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { type, icao } = req.query;

    // パラメータバリデーション
    if (!type || !icao) {
      res.status(400).json({
        error: 'Missing required parameters',
        message: 'Both "type" and "icao" parameters are required'
      });
      return;
    }

    // typeのバリデーション
    if (type !== 'metar' && type !== 'taf') {
      res.status(400).json({
        error: 'Invalid type parameter',
        message: 'Type must be either "metar" or "taf"'
      });
      return;
    }

    // ICAOコードのバリデーション（基本的なチェック）
    if (typeof icao !== 'string' || icao.length < 3 || icao.length > 4) {
      res.status(400).json({
        error: 'Invalid ICAO code',
        message: 'ICAO code must be 3-4 characters'
      });
      return;
    }

    // NOAA APIへのリクエストURL構築
    const noaaUrl = `${AVIATION_WEATHER_API_BASE}/${type}?ids=${icao.toUpperCase()}&format=json`;

    console.log(`Fetching ${type.toUpperCase()} for ${icao.toUpperCase()} from NOAA...`);

    // NOAA APIへのリクエスト
    const response = await fetch(noaaUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FlightAcademyTsx/1.0',
      },
      // タイムアウト設定（10秒）
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`NOAA API error: ${response.status} ${response.statusText}`);

      // NOAA APIからのエラーをクライアントに返す
      res.status(response.status).json({
        error: 'NOAA API Error',
        message: `Failed to fetch ${type.toUpperCase()} data from NOAA`,
        status: response.status,
      });
      return;
    }

    // レスポンスを取得
    const data = await response.json();

    // データが空の場合（該当するデータがない）
    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.log(`No ${type.toUpperCase()} data found for ${icao.toUpperCase()}`);
      res.status(404).json({
        error: 'No data found',
        message: `No ${type.toUpperCase()} data available for ${icao.toUpperCase()}`,
        data: [],
      });
      return;
    }

    // 成功レスポンス
    console.log(`Successfully fetched ${type.toUpperCase()} for ${icao.toUpperCase()}`);
    res.status(200).json(data);

  } catch (error: any) {
    console.error('Aviation Weather API Error:', error);

    // タイムアウトエラー
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      res.status(504).json({
        error: 'Gateway Timeout',
        message: 'Request to NOAA API timed out',
      });
      return;
    }

    // その他のエラー
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred',
    });
  }
}

