import type * as L from 'leaflet';

// エラー関連の型をエクスポート
export type { Database } from './database.types';
export * from './error';
export * from './learning';
export * from './map';

// Profile型定義（既存のany型を置き換え）
export interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  email: string | null;
  created_at: string | null;
  updated_at: string | null;
  roll: string | null;
}

export interface Airport {
  value: string;
  name: string;
  label: string;
  type: 'civilian' | 'military' | 'joint';
  latitude: number;
  longitude: number;
  properties?: {
    id?: string;
    name1?: string;
    type?: string;
    "Elev(ft)"?: number;
    RWY1?: string;
    RWY2?: string;
    RWY3?: string;
    RWY4?: string;
    "MAG Var"?: number;
    [key: string]: string | number | boolean | null | undefined;
  };
}

export interface Navaid {
  id: string;
  name: string;
  type: 'VOR' | 'TACAN' | 'VORTAC';
  latitude: number;
  longitude: number;
}

export interface Waypoint {
  id: string;
  name: string;
  type: 'airport' | 'navaid' | 'custom';
  sourceId?: string;
  ch?: string;
  coordinates: [number, number];
  latitude: number;
  longitude: number;
  nameEditable?: boolean;
  metadata?: WaypointMetadata;
}

export interface WaypointMetadata {
  baseNavaid: string;
  bearing: number;
  distance: number;
  baseLatitude: number;
  baseLongitude: number;
}

export interface FlightPlan {
  departure: Airport | null;
  arrival: Airport | null;
  waypoints: Waypoint[];
  speed: number;
  altitude: number;
  departureTime: string;
  tas: number;
  mach: number;
  totalDistance: number;
  ete?: string;
  eta?: string;
  routeSegments?: RouteSegment[];
  groundTempC: number; // 地上気温 (摂氏)
  groundElevationFt: number; // 地上標高 (フィート)
}

export interface RouteSegment {
  from: string;
  to: string;
  speed: number; // CAS
  bearing: number; // 磁方位
  altitude: number;
  eta?: string; // 予定到着時刻
  distance?: number;
}

export interface GeoJSONFeature {
  type: string;
  properties: {
    id?: string;
    name?: string;
    type?: string;
    ch?: string;
    freq?: number;
  };
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

export interface GeoJSONData extends L.GeoJSON {
  features: GeoJSONFeature[];
}

// 学習システム型
export type {
  LearningAnalytics, LearningContent,
  LearningContentType,
  LearningProgress,
  LearningSession, SessionMetadata, SubjectStats, TestSessionStats, UserWeakArea
} from './learning';


// Weather API型定義
export interface WeatherCondition {
  text: string;
  japanese: string;
  icon: string;
}

export interface WeatherWind {
  degree: number;
  kph: number;
  knots: number;
}

export interface WeatherPressure {
  mb: number;
  inch: string;
}

export interface WeatherAstronomy {
  sunrise: string;
  sunset: string;
}

export interface WeatherLocation {
  name: string;
  region: string;
  country: string;
  localtime: string;
}

export interface CurrentWeather {
  condition: WeatherCondition;
  temp_c: number;
  wind: WeatherWind;
  pressure: WeatherPressure;
  visibility_km: number;
  humidity: number;
  last_updated: string;
}

export interface WeatherAPIResponse {
  current: CurrentWeather;
  astronomy: WeatherAstronomy | null;
  location: WeatherLocation;
}

// 外部Weather API生レスポンス型
export interface ExternalWeatherData {
  current: {
    condition: { text: string; icon: string };
    temp_c: number;
    wind_degree: number;
    wind_kph: number;
    pressure_mb: number;
    vis_km: number;
    humidity: number;
    last_updated: string;
  };
  location: {
    name: string;
    region: string;
    country: string;
    localtime: string;
  };
  forecast?: {
    forecastday?: Array<{
      astro?: {
        sunrise: string;
        sunset: string;
      };
    }>;
  };
}
