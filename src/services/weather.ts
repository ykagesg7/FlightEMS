import axios from 'axios';

// Vercelサーバーレス関数から返されるデータの型定義
// api/weather.ts の filterWeatherData 関数が返すオブジェクトの構造と一致
export interface FilteredWeatherData {
  current: {
    condition: {
      text: string;
      japanese: string;
      icon: string;
    };
    temp_c: number;
    wind: {
      degree: number;
      kph: number;
      knots: number;
    };
    pressure: {
      mb: number;
      inch: string;
    };
    visibility_km: number;
    humidity: number;
    last_updated: string;
  };
  astronomy: {
    sunrise: string;
    sunset: string;
  } | null;
  location: {
    name: string;
    region: string;
    country: string;
    localtime: string;
  };
}

// 本番環境かどうかを判定する
const isProd = import.meta.env.PROD;
// デプロイ先のドメインを取得（未設定の場合はnull）
const deploymentDomain = isProd ? window.location.origin : null;

// 開発環境でのモックデータ
const createMockWeatherData = (lat: number, lon: number): FilteredWeatherData => {
  return {
    current: {
      condition: {
        text: 'Partly cloudy',
        japanese: '晴れ時々曇り',
        icon: '//cdn.weatherapi.com/weather/64x64/day/116.png'
      },
      temp_c: 20,
      wind: {
        degree: 180,
        kph: 15,
        knots: 8
      },
      pressure: {
        mb: 1013,
        inch: '29.91'
      },
      visibility_km: 10,
      humidity: 65,
      last_updated: new Date().toISOString()
    },
    astronomy: {
      sunrise: '06:30',
      sunset: '18:30'
    },
    location: {
      name: `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
      region: 'Development',
      country: 'JP',
      localtime: new Date().toISOString()
    }
  };
};

/**
 * Vercelでホストされているサーバーレス関数を介して天気データを取得します。
 * @param lat 緯度
 * @param lon 経度
 * @returns フィルタリングされた天気データ、またはエラーの場合はnull
 */
export const fetchWeather = async (lat: number, lon: number): Promise<FilteredWeatherData | null> => {
  // Vercel関数のURLを構築
  // 開発環境ではプロキシされるように相対パスを、本番環境では完全なURLを使用
  const functionUrl = deploymentDomain
    ? `${deploymentDomain}/api/weather?lat=${lat}&lon=${lon}`
    : `/api/weather?lat=${lat}&lon=${lon}`;

  try {
    // サーバーレス関数にリクエストを送信
    const response = await axios.get<FilteredWeatherData>(functionUrl, {
      timeout: 10000, // 10秒のタイムアウト
    });

    return response.data;
  } catch (error) {
    console.error('Vercel関数へのリクエストに失敗しました:', error);

    // エラーがaxiosのエラーであるか、または他のエラーであるかをチェック
    if (axios.isAxiosError(error)) {
      // 開発環境ではモックデータを返す
      if (!isProd) {
        return createMockWeatherData(lat, lon);
      }
    }

    return null;
  }
};

/**
 * 旧バージョンとの互換性のためのエイリアス関数
 * @deprecated fetchWeather関数を使用してください
 */
export const fetchWeatherData = fetchWeather;
