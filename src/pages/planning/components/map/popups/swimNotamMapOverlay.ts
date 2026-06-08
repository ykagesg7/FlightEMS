import type { GeoJsonObject, Point } from 'geojson';
import L from 'leaflet';

export type NotamOverlayVariant = 'current' | 'future';

type OverlayEntry = {
  layer: L.GeoJSON;
  variant: NotamOverlayVariant;
};

const overlayByMap = new WeakMap<L.Map, L.FeatureGroup>();
const layersByMap = new WeakMap<L.Map, Map<string, OverlayEntry>>();

function getOrCreateOverlayGroup(map: L.Map): L.FeatureGroup {
  let g = overlayByMap.get(map);
  if (!g) {
    g = L.featureGroup();
    overlayByMap.set(map, g);
  }
  return g;
}

function getLayerRegistry(map: L.Map): Map<string, OverlayEntry> {
  let reg = layersByMap.get(map);
  if (!reg) {
    reg = new Map();
    layersByMap.set(map, reg);
  }
  return reg;
}

function styleForVariant(variant: NotamOverlayVariant): L.PathOptions {
  if (variant === 'future') {
    return {
      color: '#eab308',
      weight: 2,
      dashArray: '6 4',
      fillOpacity: 0.08,
      opacity: 0.85,
    };
  }
  return {
    color: '#f59e0b',
    weight: 2,
    fillOpacity: 0.15,
    opacity: 0.9,
  };
}

function createGeoLayer(geometry: GeoJsonObject, variant: NotamOverlayVariant): L.GeoJSON {
  return L.geoJSON(geometry, { style: styleForVariant(variant) });
}

/** @deprecated 単一幾何の置換表示。addSwimNotamGeometry を優先 */
export function showSwimNotamGeometryOnMap(map: L.Map, geometry: GeoJsonObject): void {
  clearSwimNotamMapOverlay(map);
  addSwimNotamGeometry(map, '__legacy-single__', geometry, 'current');
  const fg = getOrCreateOverlayGroup(map);
  const b = fg.getBounds();
  if (b.isValid()) {
    map.fitBounds(b, { padding: L.point(24, 24), maxZoom: 15 });
  } else if (geometry.type === 'Point') {
    const coords = (geometry as Point).coordinates;
    map.setView([coords[1], coords[0]], Math.max(map.getZoom(), 13));
  }
}

export function addSwimNotamGeometry(
  map: L.Map,
  id: string,
  geometry: GeoJsonObject,
  variant: NotamOverlayVariant = 'current',
): void {
  removeSwimNotamGeometry(map, id);
  const fg = getOrCreateOverlayGroup(map);
  const layer = createGeoLayer(geometry, variant);
  fg.addLayer(layer);
  getLayerRegistry(map).set(id, { layer, variant });
  if (!map.hasLayer(fg)) {
    fg.addTo(map);
  }
}

export function removeSwimNotamGeometry(map: L.Map, id: string): void {
  const reg = layersByMap.get(map);
  const entry = reg?.get(id);
  if (!entry) return;
  const fg = overlayByMap.get(map);
  fg?.removeLayer(entry.layer);
  reg?.delete(id);
}

export function clearSwimNotamMapOverlay(map: L.Map): void {
  const fg = overlayByMap.get(map);
  if (fg) {
    fg.clearLayers();
    if (map.hasLayer(fg)) {
      map.removeLayer(fg);
    }
    overlayByMap.delete(map);
  }
  layersByMap.delete(map);
}

export function fitSwimNotamMapOverlay(map: L.Map): void {
  const fg = overlayByMap.get(map);
  if (!fg) return;
  const b = fg.getBounds();
  if (b.isValid()) {
    map.fitBounds(b, { padding: L.point(24, 24), maxZoom: 15 });
  }
}

export function hasSwimNotamGeometryOnMap(map: L.Map, id: string): boolean {
  return layersByMap.get(map)?.has(id) ?? false;
}

export function listSwimNotamGeometryIds(map: L.Map): string[] {
  const reg = layersByMap.get(map);
  return reg ? [...reg.keys()] : [];
}

/** @deprecated ポップアップ閉鎖時の自動消去。NOTAM シートでは使用しない */
export function attachSwimNotamOverlayCleanup(map: L.Map, popup: L.Popup): void {
  const ext = popup as L.Popup & { _swimNotamRemoveCleanup?: () => void };
  if (ext._swimNotamRemoveCleanup) {
    popup.off('remove', ext._swimNotamRemoveCleanup);
  }
  ext._swimNotamRemoveCleanup = () => {
    clearSwimNotamMapOverlay(map);
  };
  popup.on('remove', ext._swimNotamRemoveCleanup);
}
