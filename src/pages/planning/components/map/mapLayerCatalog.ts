import type { PlanningMapRegion } from './planningMapTypes';

export type MapLayerGroupId = 'aviation' | 'waypoints' | 'local' | 'reference';

export type MapBaseLayerId = 'map' | 'satellite';

export type MapLayerCatalogEntry = {
  id: string;
  label: string;
  group: MapLayerGroupId;
  /** overlayLayers 内の Leaflet グループ名 */
  overlayGroup: 'Common Layers' | 'Waypoints' | 'Local Layers';
  /** overlayGroup 内のキー */
  layerKey: string;
  referenceOnly?: boolean;
};

export const MAP_LAYER_GROUP_LABELS: Record<MapLayerGroupId, string> = {
  aviation: '航空情報',
  waypoints: 'Waypoints',
  local: 'Local Layers',
  reference: '参考データ',
};

export const BASE_LAYER_CATALOG: { id: MapBaseLayerId; label: string }[] = [
  { id: 'map', label: '地図' },
  { id: 'satellite', label: '衛星写真' },
];

/** 地域非依存の固定オーバーレイ */
export const STATIC_MAP_LAYER_CATALOG: MapLayerCatalogEntry[] = [
  { id: 'airport', label: '空港', group: 'aviation', overlayGroup: 'Common Layers', layerKey: '空港' },
  { id: 'navaids', label: 'Navaids', group: 'aviation', overlayGroup: 'Common Layers', layerKey: 'Navaids' },
  { id: 'restricted_airspace', label: '制限空域', group: 'aviation', overlayGroup: 'Common Layers', layerKey: '制限空域' },
  { id: 'training_high', label: '高高度訓練空域', group: 'aviation', overlayGroup: 'Common Layers', layerKey: '高高度訓練空域' },
  { id: 'training_low', label: '低高度訓練空域', group: 'aviation', overlayGroup: 'Common Layers', layerKey: '低高度訓練空域' },
  { id: 'training_civil', label: '民間訓練空域', group: 'aviation', overlayGroup: 'Common Layers', layerKey: '民間訓練空域' },
  { id: 'rapcon', label: 'RAPCON', group: 'aviation', overlayGroup: 'Common Layers', layerKey: 'RAPCON' },
  { id: 'acc_sector_high', label: 'ACC-Sector High', group: 'aviation', overlayGroup: 'Common Layers', layerKey: 'ACC-Sector High' },
  { id: 'acc_sector_low', label: 'ACC-Sector Low', group: 'aviation', overlayGroup: 'Common Layers', layerKey: 'ACC-Sector Low' },
  { id: 'opensky_traffic', label: '航空機（参考・OpenSky）', group: 'reference', overlayGroup: 'Common Layers', layerKey: '航空機（参考・OpenSky）', referenceOnly: true },
  { id: 'rainviewer_radar', label: '降水レーダー（参考・RainViewer）', group: 'reference', overlayGroup: 'Common Layers', layerKey: '降水レーダー（参考・RainViewer）', referenceOnly: true },
  { id: 'wind_barbs', label: '上層風バーブ（参考・Open-Meteo）', group: 'reference', overlayGroup: 'Common Layers', layerKey: '上層風バーブ（参考・Open-Meteo）', referenceOnly: true },
  { id: 'waypoints_all', label: 'すべて', group: 'waypoints', overlayGroup: 'Waypoints', layerKey: 'すべて' },
  { id: 'rjfa', label: 'RJFA', group: 'local', overlayGroup: 'Local Layers', layerKey: 'RJFA' },
  { id: 'rjfz', label: 'RJFZ', group: 'local', overlayGroup: 'Local Layers', layerKey: 'RJFZ' },
];

export function waypointRegionLayerId(regionId: string): string {
  return `waypoints_${regionId}`;
}

export function buildWaypointRegionCatalogEntries(regions: PlanningMapRegion[]): MapLayerCatalogEntry[] {
  return regions.map((region) => ({
    id: waypointRegionLayerId(region.id),
    label: region.name,
    group: 'waypoints' as const,
    overlayGroup: 'Waypoints' as const,
    layerKey: region.name,
  }));
}

export function buildFullLayerCatalog(regions: PlanningMapRegion[]): MapLayerCatalogEntry[] {
  return [...STATIC_MAP_LAYER_CATALOG, ...buildWaypointRegionCatalogEntries(regions)];
}

export function getCatalogEntryById(
  catalog: MapLayerCatalogEntry[],
  overlayId: string,
): MapLayerCatalogEntry | undefined {
  return catalog.find((entry) => entry.id === overlayId);
}

export function getKnownOverlayIds(catalog: MapLayerCatalogEntry[]): Set<string> {
  return new Set(catalog.map((entry) => entry.id));
}
