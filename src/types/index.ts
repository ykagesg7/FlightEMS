import type * as L from 'leaflet';
import type { CustomGroupOption, CustomSelectOption } from './react-select';

// エラー関連の型をエクスポート
export type { Database } from './database.types';
export * from './error';
export * from './learning';
export * from './map';

// 専用型定義ファイルをインポート
export * from './leaflet';
export * from './react-select';

// 基本型定義（重複を削除）
export interface Airport extends CustomSelectOption {
  value: string;
  label: string;
  name: string;
  type: 'civilian' | 'military' | 'joint';
  latitude: number;
  longitude: number;
  properties?: Record<string, unknown>;
}

export interface Waypoint {
  id: string;
  name: string;
  type: 'custom' | 'navaid' | 'airport' | 'waypoint';
  sourceId?: string;
  ch?: string;
  coordinates: [number, number];
  latitude: number;
  longitude: number;
  nameEditable?: boolean;
  metadata?: WaypointMetadata;
}

export interface RouteSegment {
  from: string;
  to: string;
  speed: number;
  bearing: number;
  altitude: number;
  eta: string;
  distance: number;
}

export interface FlightPlan {
  departure?: Airport;
  arrival?: Airport;
  waypoints: Waypoint[];
  speed: number;
  altitude: number;
  departureTime: string;
  groundTempC: number;
  groundElevationFt: number;
  totalDistance: number;
  ete: string;
  eta: string;
  tas: number;
  mach: number;
  routeSegments: RouteSegment[];
}

export interface Navaid {
  id: string;
  name: string;
  type: 'VOR' | 'TACAN' | 'VORTAC';
  latitude: number;
  longitude: number;
}

export interface WaypointMetadata {
  baseNavaid: string;
  bearing?: number;
  distance?: number;
  baseLatitude: number;
  baseLongitude: number;
}

// RoutePlanning関連の型定義
export interface AirportOption extends CustomSelectOption {
  value: string;
  label: string;
  name: string;
  type: 'civilian' | 'military' | 'joint';
  latitude: number;
  longitude: number;
  properties?: Record<string, unknown>;
}

export interface NavaidOption extends CustomSelectOption {
  value: string;
  label: string;
  name: string;
  type: 'VOR' | 'TACAN' | 'VORTAC';
  latitude: number;
  longitude: number;
  frequency?: string;
  ch?: string;
}

export interface WaypointOption extends CustomSelectOption {
  value: string;      // id
  label: string;      // "id - name1"形式
  name: string;       // name1
  type: string;       // "Non-Compulsory"など
  latitude: number;
  longitude: number;
}

// 空港グループ化オプション
export interface AirportGroupOption extends CustomGroupOption {
  label: string;
  options: AirportOption[];
}

// GeoJSON関連の型定義
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

// 天気関連の型定義
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
