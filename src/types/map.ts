import type * as L from 'leaflet';

// GeoJSON関連型定義
export interface GeoJSONProperties {
  id?: string;
  name?: string;
  name1?: string;
  type?: string;
  ch?: string;
  freq?: number;
  frequency?: string;
  'Elev(ft)'?: number;
  RWY1?: string;
  RWY2?: string;
  RWY3?: string;
  RWY4?: string;
  'MAG Var'?: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface GeoJSONGeometry {
  type: 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon';
  coordinates: number[] | number[][] | number[][][];
}

export interface GeoJSONFeature {
  type: 'Feature';
  properties: GeoJSONProperties;
  geometry: GeoJSONGeometry;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

// 地図ナビゲーション関連型
export interface MapNavaid {
  id: string;
  name: string;
  type: 'VOR' | 'TACAN' | 'VORTAC' | 'NDB' | 'DME';
  latitude: number;
  longitude: number;
  frequency?: string;
  ch?: string;
}

// 空港プロパティ型
export interface AirportProperties extends GeoJSONProperties {
  id: string;
  name1: string;
  type: 'civilian' | 'military' | 'joint';
  'Elev(ft)': number;
  RWY1?: string;
  RWY2?: string;
  RWY3?: string;
  RWY4?: string;
  'MAG Var'?: number;
}

// Waypoint関連型
export interface WaypointGeoJSON extends GeoJSONFeature {
  properties: GeoJSONProperties & {
    name: string;
    type?: 'waypoint' | 'intersection' | 'fix';
  };
}

// 気象データ型
export interface WeatherData {
  metar?: string;
  taf?: string;
  temperature?: number;
  windSpeed?: number;
  windDirection?: number;
  visibility?: number;
  ceiling?: number;
  conditions?: string;
  pressure?: number;
  dewpoint?: number;
  [key: string]: string | number | undefined;
}

// レイヤー制御型
export interface LayerControlOptions {
  position?: L.ControlPosition;
  collapsed?: boolean;
  autoZIndex?: boolean;
  hideSingleBase?: boolean;
  sortLayers?: boolean;
  sortFunction?: (a: L.Layer, b: L.Layer, aName: string, bName: string) => number;
}

// ポップアップコンテンツ生成関数型
export type PopupContentGenerator = (properties: GeoJSONProperties, weatherData?: WeatherData) => string;

// スタイル関数型
export type FeatureStyleFunction = (feature?: GeoJSONFeature) => L.PathOptions;

// イベントハンドラー型
export type FeatureEventHandler = (feature: GeoJSONFeature, layer: L.Layer) => void; 