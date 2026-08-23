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

export type RouteSegmentPhase = 'climb' | 'cruise' | 'descent';

export interface RouteSegment {
  from: string;
  to: string;
  speed: number;
  bearing: number;
  altitude: number;
  eta: string;
  distance: number;
  duration?: string; // セグメントの所要時間（時分秒形式）
  fuelUsedLb?: number;
  fuelRemainingLb?: number;
  frequency?: string;
  frequencySourceId?: string;
  /** Open-Meteo 反映時: 気象風（吹いてくる方位・kt） */
  windFromDeg?: number;
  windSpeedKt?: number;
  /** 地速 kt（風補正後。未設定時は TAS を地速扱い） */
  groundSpeedKt?: number;
  phase?: RouteSegmentPhase;
  trueCourseDeg?: number;
  magneticCourseDeg?: number;
  magneticVariationDeg?: number;
  windCorrectionAngleDeg?: number;
  trueHeadingDeg?: number;
  magneticHeadingDeg?: number;
  startAltitudeFt?: number;
  endAltitudeFt?: number;
  verticalSpeedFpm?: number;
  fuelFlowLbPerHr?: number;
  windUnsolvable?: boolean;
  /** 幾何レグの override キー（TOC/TOD 分割後も元レグを指す） */
  overrideKey?: string;
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
  aircraftId?: string;
  initialFuelLb?: number;
  reserveFuelLb?: number;
  taxiFuelLb?: number;
  cruiseFuelFlowLbPerHr?: number;
  totalFuelUsedLb?: number;
  totalFuelRemainingLb?: number;
  /** true のとき経路 ETE/燃料に Open-Meteo の上層風を反映（参考・非商用枠） */
  useOpenMeteoWind?: boolean;
  /** 幾何レグ `${from}->${to}` ごとの CAS/高度上書き */
  segmentOverrides?: Record<string, { casKt?: number; altitudeFt?: number }>;
  alternateFuelLb?: number;
  /** 機体プリセットの性能値を計画単位で上書き */
  performanceOverrides?: AircraftPerformanceOverrides;
  /** 降下率の選択（既定は標準） */
  descentMode?: DescentMode;
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

// 機体プリセット・燃料計算
export interface VerticalRatePoint {
  altitudeFt: number;
  fpm: number;
}

export interface VerticalSegmentProfile {
  targetCasKt: number;
  targetMach?: number;
  ratesFpm: VerticalRatePoint[];
  /** アイドル降下など、標準と別の率を選ぶ場合に使う */
  idleRatesFpm?: VerticalRatePoint[];
  fuelFlowLbPerHr: number;
}

export type DescentMode = 'standard' | 'idle';

/**
 * 機体プリセットの性能値を計画単位で上書きする。
 * プリセットは教育用モックのため、教官・学生が現場値へ差し替えられるようにする。
 */
export interface AircraftPerformanceOverrides {
  climbCasKt?: number;
  climbMach?: number;
  climbRateFpm?: number;
  climbFuelFlowLbPerHr?: number;
  descentCasKt?: number;
  descentRateFpm?: number;
  descentIdleRateFpm?: number;
  descentFuelFlowLbPerHr?: number;
  cruiseFuelFlowLbPerHr?: number;
  serviceCeilingFt?: number;
  maxFuelLb?: number;
}

export interface CruiseFuelFlowPoint {
  altitudeFt: number;
  lbPerHr: number;
}

export interface AircraftPreset {
  id: string;
  name: string;
  cruiseFuelFlowLbPerHr: number;
  taxiFuelLb: number;
  reserveFuelLb: number;
  defaultInitialFuelLb: number;
  climb?: VerticalSegmentProfile;
  descent?: VerticalSegmentProfile;
  cruiseFuelFlowByAltitude?: CruiseFuelFlowPoint[];
  serviceCeilingFt?: number;
  maxFuelLb?: number;
  alternateFuelLb?: number;
}

// 計画データの正本(JSON)スキーマ
export interface PlanDocumentV1 {
  schemaVersion: 1;
  createdAt: string;
  updatedAt: string;
  units: {
    fuel: 'lb';
    fuelFlow: 'lb/hr';
    remainingDisplay: 'klb';
  };
  planInput: FlightPlan;
  derived?: {
    notes?: string;
    extensions?: Record<string, unknown>;
  };
  meta?: {
    appVersion?: string;
  };
}
