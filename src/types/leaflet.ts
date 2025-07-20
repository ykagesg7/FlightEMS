// Leaflet専用型定義ファイル
// MapTab.tsxで使用されるLeaflet関連の型定義

import type { GeoJSON } from 'geojson';
import type L from 'leaflet';

// Leaflet GeoJSON Feature型定義
export interface LeafletGeoJSONFeature extends GeoJSON.Feature {
  properties: Record<string, unknown>;
  geometry: GeoJSON.Geometry;
}

// Leaflet Layer型定義
export interface LeafletLayer extends L.Layer {
  bindPopup: (content: string | L.Popup) => void;
  bindTooltip: (content: string, options?: L.TooltipOptions) => void;
  on: (event: string, handler: () => void) => void;
}

// Leaflet Map型定義
export interface LeafletMap extends L.Map {
  closePopup: () => void;
}

// Leaflet Popup型定義
export interface LeafletPopup extends L.Popup {
  setContent: (content: string) => void;
}

// Leaflet DomUtil型定義
export interface LeafletDomUtil {
  create: (tagName: string, className: string) => HTMLElement;
}

// Leaflet MouseEvent型定義
export interface LeafletMouseEvent extends L.LeafletMouseEvent {
  latlng: L.LatLng;
}

// Leaflet Circle型定義
export interface LeafletCircle extends L.Circle {
  setRadius: (radius: number) => void;
  setStyle: (style: L.PathOptions) => void;
}

// Leaflet CircleMarker型定義
export interface LeafletCircleMarker extends L.CircleMarker {
  setRadius: (radius: number) => void;
  setStyle: (style: L.PathOptions) => void;
}

// Leaflet LayerGroup型定義
export interface LeafletLayerGroup extends L.LayerGroup {
  addLayer: (layer: L.Layer) => void;
  removeLayer: (layer: L.Layer) => void;
}

// Leaflet Control型定義
export interface LeafletControl extends L.Control {
  onAdd: (map: L.Map) => HTMLElement;
  onRemove: (map: L.Map) => void;
}

// Leaflet Control Layers型定義
export interface LeafletControlLayers extends L.Control.Layers {
  addOverlay: (layer: L.Layer, name: string) => void;
  removeLayer: (layer: L.Layer) => void;
}

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
