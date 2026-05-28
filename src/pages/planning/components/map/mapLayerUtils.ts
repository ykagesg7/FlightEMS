import L from 'leaflet';
import type { MapLayerCatalogEntry } from './mapLayerCatalog';

export type PlanningMapOverlayGroups = {
  'Common Layers': Record<string, L.Layer>;
  Waypoints: Record<string, L.Layer>;
  'Local Layers': Record<string, L.Layer>;
};

export type OverlayLayerSyncHandlers = {
  removeOverlay: (entry: MapLayerCatalogEntry, layer: L.Layer) => void;
  addOverlay: (entry: MapLayerCatalogEntry, layer: L.Layer) => void;
};

/** カタログ上の全エントリについて、指定 overlayLayers 世代の実体をマップから外す */
export function removeCatalogLayersFromMap(
  map: L.Map,
  catalog: MapLayerCatalogEntry[],
  overlayLayers: PlanningMapOverlayGroups,
  removeOverlay: (entry: MapLayerCatalogEntry, layer: L.Layer) => void,
): void {
  for (const entry of catalog) {
    const layer = resolveOverlayLayer(overlayLayers, entry);
    if (layer && map.hasLayer(layer)) {
      removeOverlay(entry, layer);
    }
  }
}

/** enabled 状態に合わせて、現 overlayLayers 世代の実体をマップへ載せる */
export function applyEnabledCatalogLayersToMap(
  map: L.Map,
  catalog: MapLayerCatalogEntry[],
  overlayLayers: PlanningMapOverlayGroups,
  enabledIds: ReadonlySet<string>,
  addOverlay: (entry: MapLayerCatalogEntry, layer: L.Layer) => void,
): void {
  for (const entry of catalog) {
    if (!enabledIds.has(entry.id)) continue;
    const layer = resolveOverlayLayer(overlayLayers, entry);
    if (layer && !map.hasLayer(layer)) {
      addOverlay(entry, layer);
    }
  }
}

/** 2 つのカタログを id でマージ（旧世代 cleanup 用） */
export function mergeCatalogEntries(
  prevCatalog: MapLayerCatalogEntry[],
  nextCatalog: MapLayerCatalogEntry[],
): MapLayerCatalogEntry[] {
  const byId = new Map<string, MapLayerCatalogEntry>();
  for (const entry of prevCatalog) {
    byId.set(entry.id, entry);
  }
  for (const entry of nextCatalog) {
    byId.set(entry.id, entry);
  }
  return [...byId.values()];
}

export function resolveOverlayLayer(
  overlayLayers: PlanningMapOverlayGroups,
  entry: MapLayerCatalogEntry,
): L.Layer | undefined {
  const group = overlayLayers[entry.overlayGroup];
  return group?.[entry.layerKey];
}

export function bringWaypointLayerToFront(layer: L.Layer): void {
  if (!(layer instanceof L.GeoJSON)) return;
  layer.eachLayer((child) => {
    if (child instanceof L.Path) {
      child.bringToFront();
    }
  });
}

/** Waypoints「すべて」ON 時に地域レイヤーを連動追加する id 一覧 */
export function getWaypointRegionOverlayIds(catalog: MapLayerCatalogEntry[]): string[] {
  return catalog
    .filter((e) => e.group === 'waypoints' && e.id !== 'waypoints_all')
    .map((e) => e.id);
}
