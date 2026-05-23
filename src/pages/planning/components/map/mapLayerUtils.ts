import L from 'leaflet';
import type { MapLayerCatalogEntry } from './mapLayerCatalog';

export type PlanningMapOverlayGroups = {
  'Common Layers': Record<string, L.Layer>;
  Waypoints: Record<string, L.Layer>;
  'Local Layers': Record<string, L.Layer>;
};

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
