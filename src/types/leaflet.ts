// Leaflet専用型定義ファイル
// MapTab.tsxで使用されるLeaflet関連の型定義

import type { Feature, Geometry } from 'geojson';
import type L from 'leaflet';

// Leaflet GeoJSON Feature型定義
export interface LeafletGeoJSONFeature extends Feature {
  properties: Record<string, unknown>;
  geometry: Geometry;
}

// @types/leaflet のメソッドチェーン戻り値（this）と衝突するため extends ではなくエイリアスを使用
export type LeafletLayer = L.Layer;
export type LeafletMap = L.Map;
export type LeafletPopup = L.Popup;
export type LeafletDomUtil = typeof L.DomUtil;
export type LeafletMouseEvent = L.LeafletMouseEvent;
export type LeafletCircle = L.Circle;
export type LeafletCircleMarker = L.CircleMarker;
export type LeafletLayerGroup = L.LayerGroup;
export type LeafletControl = L.Control;
export type LeafletControlLayers = L.Control.Layers;

// Leaflet GeoJSON Options型定義
export interface LeafletGeoJSONOptions {
  pointToLayer?: (feature: LeafletGeoJSONFeature, latlng: L.LatLng) => L.Layer;
  onEachFeature?: (feature: LeafletGeoJSONFeature, layer: LeafletLayer) => void;
  style?: (feature: LeafletGeoJSONFeature) => L.PathOptions;
  filter?: (feature: LeafletGeoJSONFeature) => boolean;
}

// Leaflet Popup Options型定義
export interface LeafletPopupOptions {
  className?: string;
  maxWidth?: number;
  closeButton?: boolean;
  autoClose?: boolean;
  closeOnClick?: boolean;
}

// Leaflet Tooltip Options型定義
export interface LeafletTooltipOptions {
  permanent?: boolean;
  direction?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'auto';
  className?: string;
  offset?: L.PointExpression;
  opacity?: number;
}

// Leaflet Path Options型定義
export interface LeafletPathOptions {
  color?: string;
  weight?: number;
  opacity?: number;
  fillColor?: string;
  fillOpacity?: number;
  dashArray?: string;
  lineCap?: string;
  lineJoin?: string;
}

// Leaflet Circle Options型定義
export interface LeafletCircleOptions extends LeafletPathOptions {
  radius?: number;
}

// Leaflet Circle Marker Options型定義
export interface LeafletCircleMarkerOptions extends LeafletPathOptions {
  radius?: number;
}
