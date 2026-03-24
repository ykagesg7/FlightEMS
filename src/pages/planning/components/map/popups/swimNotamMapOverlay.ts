import type { GeoJsonObject } from 'geojson';
import L from 'leaflet';

const overlayByMap = new WeakMap<L.Map, L.FeatureGroup>();

function getOrCreateOverlayGroup(map: L.Map): L.FeatureGroup {
  let g = overlayByMap.get(map);
  if (!g) {
    g = L.featureGroup();
    overlayByMap.set(map, g);
  }
  return g;
}

/**
 * デジタルノータムの GeoJSON 幾何を地図に重ねる（既存の NOTAM オーバーレイは置き換え）。
 */
export function showSwimNotamGeometryOnMap(map: L.Map, geometry: GeoJsonObject): void {
  const fg = getOrCreateOverlayGroup(map);
  fg.clearLayers();
  const layer = L.geoJSON(geometry, {
    style: {
      color: '#f59e0b',
      weight: 2,
      fillOpacity: 0.15,
      opacity: 0.9,
    },
  });
  fg.addLayer(layer);
  if (!map.hasLayer(fg)) {
    fg.addTo(map);
  }
  const b = fg.getBounds();
  if (b.isValid()) {
    map.fitBounds(b, { padding: L.point(24, 24), maxZoom: 15 });
  } else if (geometry.type === 'Point') {
    const c = geometry.coordinates as [number, number];
    map.setView([c[1], c[0]], Math.max(map.getZoom(), 13));
  }
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
}

/** ポップアップ閉鎖時にオーバーレイを消すリスナを1本だけ張る */
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
