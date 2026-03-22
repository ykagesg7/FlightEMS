/**
 * WeatherAPI.com プロキシの共有ロジック（Vercel api + Vite dev プラグイン）
 *
 * ブラウザにキーを出さず、サーバー側の WEATHER_API_KEY のみ使用する。
 */
import type { ExternalWeatherData, WeatherAPIResponse } from '../src/types';

export type WeatherForecastProxyResult = {
  status: number;
  body: unknown;
  cacheControl?: string;
};

export type ProxyWeatherForecastOptions = {
  /** 省略時は process.env.WEATHER_API_KEY */
  apiKey?: string | undefined;
  /**
   * true かつ apiKey 未設定のとき 200 + モック（npm run dev のみ想定）。
   * Vercel ハンドラでは必ず false または未指定。
   */
  allowMockWithoutKey?: boolean;
};

function firstQuery(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

/** 開発用: クライアント createMockWeatherData と同構造（WeatherAPIResponse） */
export function createDevMockFilteredWeather(lat: number, lon: number): WeatherAPIResponse {
  return {
    current: {
      condition: {
        text: 'Partly cloudy',
        japanese: '晴れ時々曇り',
        icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
      },
      temp_c: 20,
      wind: {
        degree: 180,
        kph: 15,
        knots: 8,
      },
      pressure: {
        mb: 1013,
        inch: '29.91',
      },
      visibility_km: 10,
      humidity: 65,
      last_updated: new Date().toISOString(),
    },
    astronomy: {
      sunrise: '06:30',
      sunset: '18:30',
    },
    location: {
      name: `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
      region: 'Development',
      country: 'JP',
      localtime: new Date().toISOString(),
    },
  };
}

function filterWeatherData(data: ExternalWeatherData): WeatherAPIResponse {
  const conditionMap: { [key: string]: string } = {
    Sunny: '晴れ',
    Clear: '快晴',
    'Partly cloudy': '晴れ時々曇り',
    Cloudy: '曇り',
    Overcast: '曇天',
    Mist: '霧',
    Fog: '濃霧',
    'Freezing fog': '着氷性霧',
    'Patchy rain possible': '所により雨の可能性',
    'Patchy snow possible': '所により雪の可能性',
    'Patchy sleet possible': '所によりみぞれの可能性',
    'Patchy freezing drizzle possible': '所により着氷性の霧雨の可能性',
    'Thundery outbreaks possible': '雷雨の可能性',
    'Blowing snow': '吹雪',
    Blizzard: '猛吹雪',
    Rain: '雨',
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
    'Patchy heavy snow': '所により大雪',
  };

  const current = data.current;
  const location = data.location;
  const forecast = data.forecast?.forecastday?.[0];
  const astro = forecast?.astro;

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return timeStr;

    let hours = parseInt(match[1], 10);
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
        icon: current.condition.icon,
      },
      temp_c: current.temp_c,
      wind: {
        degree: current.wind_degree,
        kph: current.wind_kph,
        knots: Math.round(current.wind_kph * 0.539957),
      },
      pressure: {
        mb: current.pressure_mb,
        inch: (current.pressure_mb * 0.02953).toFixed(2),
      },
      visibility_km: current.vis_km,
      humidity: current.humidity,
      last_updated: current.last_updated,
    },
    astronomy: astro
      ? {
          sunrise: formatTime(astro.sunrise),
          sunset: formatTime(astro.sunset),
        }
      : null,
    location: {
      name: location.name,
      region: location.region,
      country: location.country,
      localtime: location.localtime,
    },
  };
}

/**
 * クエリ lat/lon から WeatherAPI.com を取得し、HTTP 応答相当を返す。
 */
export async function proxyWeatherForecast(
  query: Record<string, string | string[] | undefined>,
  options: ProxyWeatherForecastOptions = {},
): Promise<WeatherForecastProxyResult> {
  const latRaw = firstQuery(query.lat);
  const lonRaw = firstQuery(query.lon);

  if (!latRaw || !lonRaw) {
    return {
      status: 400,
      body: {
        error: '緯度と経度が必要です',
        code: 'MISSING_PARAMS',
      },
    };
  }

  const latNum = Number(latRaw);
  const lonNum = Number(lonRaw);

  if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
    return {
      status: 400,
      body: {
        error: '緯度と経度は数値である必要があります',
        code: 'INVALID_NUMERIC_PARAMS',
      },
    };
  }

  if (Math.abs(latNum) > 90 || Math.abs(lonNum) > 180) {
    return {
      status: 400,
      body: {
        error: '緯度は-90〜90、経度は-180〜180の範囲である必要があります',
        code: 'OUT_OF_RANGE',
      },
    };
  }

  const apiKey = options.apiKey ?? process.env.WEATHER_API_KEY ?? '';
  const allowMock = options.allowMockWithoutKey === true;

  if (!apiKey) {
    if (allowMock) {
      return {
        status: 200,
        body: createDevMockFilteredWeather(latNum, lonNum),
        cacheControl: 'public, max-age=60',
      };
    }
    return {
      status: 500,
      body: {
        error: '天気データの取得に失敗しました',
        code: 'API_KEY_MISSING',
        message: 'サーバー設定エラー',
      },
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let weatherResponse: Response;
    try {
      weatherResponse = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${latNum},${lonNum}&days=1&aqi=no`,
        {
          signal: controller.signal,
        },
      );
      clearTimeout(timeoutId);
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return {
          status: 504,
          body: {
            error: '天気データの取得に失敗しました',
            code: 'TIMEOUT',
            message: 'リクエストがタイムアウトしました',
          },
        };
      }
      throw fetchError;
    }

    if (!weatherResponse.ok) {
      if (weatherResponse.status === 401) {
        return {
          status: 500,
          body: {
            error: '天気データの取得に失敗しました',
            code: 'API_KEY_INVALID',
            message: '認証エラー',
          },
        };
      }

      if (weatherResponse.status === 429) {
        return {
          status: 500,
          body: {
            error: '天気データの取得に失敗しました',
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'リクエスト制限に達しました',
          },
        };
      }

      return {
        status: 500,
        body: {
          error: '天気データの取得に失敗しました',
          code: 'UPSTREAM_ERROR',
          message: `外部APIエラー: ${weatherResponse.status}`,
        },
      };
    }

    const weatherData = (await weatherResponse.json()) as ExternalWeatherData;

    if (!weatherData || !weatherData.current) {
      return {
        status: 500,
        body: {
          error: '天気データの取得に失敗しました',
          code: 'INVALID_RESPONSE',
          message: '無効なレスポンス形式',
        },
      };
    }

    const filteredData = filterWeatherData(weatherData);

    return {
      status: 200,
      body: filteredData,
      cacheControl: 'public, max-age=1800',
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
          status: 500,
          body: {
            error: '天気データの取得に失敗しました',
            code: 'NETWORK_ERROR',
            message: 'ネットワークエラー',
          },
        };
      }
    }

    return {
      status: 500,
      body: {
        error: '天気データの取得に失敗しました',
        code: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : '未知のエラー',
      },
    };
  }
}
