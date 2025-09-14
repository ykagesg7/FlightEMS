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

// GeoJSON Feature型定義
export interface GeoJSONFeature {
  type: 'Feature';
  properties: GeoJSONProperties;
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon';
    coordinates: [number, number] | [number, number][] | [number, number][][];
  };
}

// GeoJSON FeatureCollection型定義
export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

// Navaid GeoJSON Feature型定義
export interface NavaidGeoJSONFeature extends GeoJSONFeature {
  properties: GeoJSONProperties & {
    id: string;
    name: string;
    type: 'VOR' | 'TACAN' | 'VORTAC';
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

// Airport GeoJSON Feature型定義
export interface AirportGeoJSONFeature extends GeoJSONFeature {
  properties: GeoJSONProperties & {
    id: string;
    name1: string;
    type: 'civilian' | 'military' | 'joint';
    'Elev(ft)'?: number;
    RWY1?: string;
    RWY2?: string;
    RWY3?: string;
    RWY4?: string;
    'MAG Var'?: number;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

// Waypoint GeoJSON Feature型定義
export interface WaypointGeoJSONFeature extends GeoJSONFeature {
  properties: GeoJSONProperties & {
    id: string;
    name1: string;
    type: 'Compulsory' | 'Optional' | 'Custom';
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

// Leaflet Layer型定義
export interface LeafletLayerWithBringToFront extends L.Layer {
  bringToFront?: () => void;
}

// Weather Data型定義
export interface WeatherData {
  temperature: number;
  conditions: string;
  humidity?: number;
  pressure?: number;
  windSpeed?: number;
  windDirection?: number;
}

// Airport Properties型定義
export interface AirportProperties {
  id: string;
  name1: string;
  type: string;
  'Elev(ft)'?: number;
  RWY1?: string;
  RWY2?: string;
  RWY3?: string;
  RWY4?: string;
  'MAG Var'?: number;
  [key: string]: string | number | boolean | null | undefined;
}

// Layer Control型定義
export interface LayerControlOptions {
  collapsed?: boolean;
  position?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
}

// Overlay Layers型定義
export interface OverlayLayers {
  [key: string]: L.Layer;
}
