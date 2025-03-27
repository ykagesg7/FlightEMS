import React, { createContext, useState, useContext, ReactNode } from 'react';

// WeatherDataの型定義
export interface WeatherData {
  current?: {
    condition?: {
      text: string;
      japanese?: string;
      icon?: string;
    };
    temp_c?: number;
    wind?: {
      degree?: number;
      kph?: number;
      knots?: number;
    };
    pressure?: {
      mb?: number;
      inch?: string | number;
    };
    visibility_km?: number;
    humidity?: number;
    last_updated?: string;
  };
  astronomy?: {
    sunrise?: string;
    sunset?: string;
  } | null;
  location?: {
    name?: string;
    region?: string;
    country?: string;
    localtime?: string;
  };
}

// キャッシュの型定義
export interface WeatherCache {
  [airportId: string]: {
    data: WeatherData;
    timestamp: number;
  };
}

// Contextが提供する値の型定義
interface WeatherCacheContextType {
  weatherCache: WeatherCache;
  setWeatherCache: React.Dispatch<React.SetStateAction<WeatherCache>>;
}

// Contextオブジェクトを作成 (初期値はundefined)
const WeatherCacheContext = createContext<WeatherCacheContextType | undefined>(undefined);

// キャッシュの有効期間 (1時間 = 60 * 60 * 1000ミリ秒)
export const CACHE_DURATION = 60 * 60 * 1000;

// ProviderコンポーネントのProps型定義
interface WeatherCacheProviderProps {
  children: ReactNode;
}

// Providerコンポーネント: キャッシュの状態管理とContextの値を提供
export const WeatherCacheProvider: React.FC<WeatherCacheProviderProps> = ({ children }) => {
  const [weatherCache, setWeatherCache] = useState<WeatherCache>({});

  return (
    <WeatherCacheContext.Provider value={{ weatherCache, setWeatherCache }}>
      {children}
    </WeatherCacheContext.Provider>
  );
};

// Contextを使用するためのカスタムフック
export const useWeatherCache = (): WeatherCacheContextType => {
  const context = useContext(WeatherCacheContext);
  if (context === undefined) {
    throw new Error('useWeatherCache must be used within a WeatherCacheProvider');
  }
  return context;
};

// 現在のキャッシュから特定の空港の気象情報を取得するユーティリティ関数
export const getCachedWeatherData = (
  cache: WeatherCache,
  airportId: string
): { data: WeatherData | null; isValid: boolean } => {
  const cachedEntry = cache[airportId];
  const now = Date.now();

  if (cachedEntry && now - cachedEntry.timestamp < CACHE_DURATION) {
    return { data: cachedEntry.data, isValid: true };
  }

  return { data: cachedEntry?.data || null, isValid: false };
}; 