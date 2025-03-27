import type * as L from 'leaflet';

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
    [key: string]: any;
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

export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}