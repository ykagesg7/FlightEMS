import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ExternalWeatherData, WeatherAPIResponse } from '../src/types';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // リクエスト情報をログに出力（本番では詳細ログを削除）
  console.log(`Weather API Request - lat: ${request.query.lat}, lon: ${request.query.lon}`);
  console.log(`Environment: WEATHER_API_KEY=${process.env.WEATHER_API_KEY ? 'set' : 'not set'}`);

  // CORSヘッダーを設定（本番では許可ドメインを制限）
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  response.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONSリクエストの場合は早期に成功レスポンスを返す
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // クエリパラメータを取得
  const { lat, lon } = request.query;

  // パラメータの検証を強化
  if (!lat || !lon) {
    return response.status(400).json({
      error: '緯度と経度が必要です',
      code: 'MISSING_PARAMS'
    });
  }

  // 数値と範囲の検証
  const latNum = Number(lat);
  const lonNum = Number(lon);

  if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
    return response.status(400).json({
      error: '緯度と経度は数値である必要があります',
      code: 'INVALID_NUMERIC_PARAMS'
    });
  }

  if (Math.abs(latNum) > 90 || Math.abs(lonNum) > 180) {
    return response.status(400).json({
      error: '緯度は-90〜90、経度は-180〜180の範囲である必要があります',
      code: 'OUT_OF_RANGE'
    });
  }

  try {
    // APIキーは環境変数から取得
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
      console.error('WEATHER_API_KEY environment variable is not set');
      return response.status(500).json({
        error: '天気データの取得に失敗しました',
        code: 'API_KEY_MISSING',
        message: 'サーバー設定エラー'
      });
    }

    // 外部APIへのリクエスト（10秒タイムアウト）
    console.log(`Fetching from Weather API: lat=${latNum}, lon=${lonNum}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let weatherResponse: Response;
    try {
      weatherResponse = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${latNum},${lonNum}&days=1&aqi=no`,
        {
          signal: controller.signal
        }
      );
      clearTimeout(timeoutId);
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return response.status(504).json({
          error: '天気データの取得に失敗しました',
          code: 'TIMEOUT',
          message: 'リクエストがタイムアウトしました'
        });
      }
      throw fetchError;
    }

    if (!weatherResponse.ok) {
      console.error(`Weather API error: ${weatherResponse.status} - ${weatherResponse.statusText}`);

      // 外部APIのエラーレスポンスを適切に処理
      if (weatherResponse.status === 401) {
        return response.status(500).json({
          error: '天気データの取得に失敗しました',
          code: 'API_KEY_INVALID',
          message: '認証エラー'
        });
      }

      if (weatherResponse.status === 429) {
        return response.status(500).json({
          error: '天気データの取得に失敗しました',
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'リクエスト制限に達しました'
        });
      }

      return response.status(500).json({
        error: '天気データの取得に失敗しました',
        code: 'UPSTREAM_ERROR',
        message: `外部APIエラー: ${weatherResponse.status}`
      });
    }

    // 天気データを取得
    const weatherData = await weatherResponse.json();
    console.log('Weather data received successfully');

    // レスポンスデータの検証
    if (!weatherData || !weatherData.current) {
      return response.status(500).json({
        error: '天気データの取得に失敗しました',
        code: 'INVALID_RESPONSE',
        message: '無効なレスポンス形式'
      });
    }

    // ここでレスポンスフィルタリングを実行
    const filteredData = filterWeatherData(weatherData);

    // キャッシュヘッダーを設定（30分間有効）
    response.setHeader('Cache-Control', 'public, max-age=1800');

    // フィルタリングしたデータを返す
    return response.status(200).json(filteredData);
  } catch (error) {
    console.error('天気データの取得に失敗しました:', error);

    // エラーの種類に応じて適切なレスポンスを返す
    if (error instanceof Error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return response.status(500).json({
          error: '天気データの取得に失敗しました',
          code: 'NETWORK_ERROR',
          message: 'ネットワークエラー'
        });
      }
    }

    return response.status(500).json({
      error: '天気データの取得に失敗しました',
      code: 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : '未知のエラー'
    });
  }
}

// 天気データをフィルタリングして必要なデータのみを返す関数
function filterWeatherData(data: ExternalWeatherData): WeatherAPIResponse {
  // 天気状態の日本語訳
  const conditionMap: { [key: string]: string } = {
    'Sunny': '晴れ',
    'Clear': '快晴',
    'Partly cloudy': '晴れ時々曇り',
    'Cloudy': '曇り',
    'Overcast': '曇天',
    'Mist': '霧',
    'Fog': '濃霧',
    'Freezing fog': '着氷性霧',
    'Patchy rain possible': '所により雨の可能性',
    'Patchy snow possible': '所により雪の可能性',
    'Patchy sleet possible': '所によりみぞれの可能性',
    'Patchy freezing drizzle possible': '所により着氷性の霧雨の可能性',
    'Thundery outbreaks possible': '雷雨の可能性',
    'Blowing snow': '吹雪',
    'Blizzard': '猛吹雪',
    'Rain': '雨',
    'Light rain': '小雨',
    'Moderate rain': '雨',
    'Heavy rain': '大雨',
    'Light freezing rain': '弱い着氷性の雨',
    'Moderate or heavy freezing rain': '中～強い着氷性の雨',
    'Light sleet': '弱いみぞれ',
    'Moderate or heavy sleet': '中～強いみぞれ',
    'Light snow': '小雪',
    'Moderate snow': '雪',
    'Heavy snow': '大雪',
    'Patchy light rain': '所により小雨',
    'Patchy moderate rain': '所により雨',
    'Patchy heavy rain': '所により大雨',
    'Patchy light snow': '所により小雪',
    'Patchy moderate snow': '所により雪',
    'Patchy heavy snow': '所により大雪'
  };

  const current = data.current;
  const location = data.location;
  const forecast = data.forecast?.forecastday?.[0];
  const astro = forecast?.astro;

  // 時刻フォーマットの簡略化
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return timeStr;

    let hours = parseInt(match[1]);
    const minutes = match[2];
    const ampm = match[3]?.toUpperCase();

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  return {
    current: {
      condition: {
        text: current.condition.text,
        japanese: conditionMap[current.condition.text] || current.condition.text,
        icon: current.condition.icon
      },
      temp_c: current.temp_c,
      wind: {
        degree: current.wind_degree,
        kph: current.wind_kph,
        knots: Math.round(current.wind_kph * 0.539957)
      },
      pressure: {
        mb: current.pressure_mb,
        inch: (current.pressure_mb * 0.02953).toFixed(2)
      },
      visibility_km: current.vis_km,
      humidity: current.humidity,
      last_updated: current.last_updated
    },
    astronomy: astro ? {
      sunrise: formatTime(astro.sunrise),
      sunset: formatTime(astro.sunset)
    } : null,
    location: {
      name: location.name,
      region: location.region,
      country: location.country,
      localtime: location.localtime
    }
  };
}
