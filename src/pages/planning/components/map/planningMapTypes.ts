import type * as L from 'leaflet';
import type { LatLng } from 'leaflet';

export interface LayerControlRef {
  current: L.Control.Layers | null;
}

/** regions_index.json の 1 エントリ */
export interface PlanningMapRegion {
  id: string;
  name: string;
  source: string;
}

/** 地図上の NAVAID 簡易表現（Navaids.geojson 由来） */
export interface PlanningMapNavaid {
  coordinates: LatLng;
  id: string;
  name: string;
}
