import L from 'leaflet';
import { useEffect, useRef } from 'react';
import {
  buildRainViewerTileUrlTemplate,
  fetchRainViewerManifest,
  pickLatestPastPath,
  RAINVIEWER_ATTRIBUTION,
  RAINVIEWER_TILE_MAX_NATIVE_ZOOM,
} from '../../../../../utils/rainViewerRadar';

const PANE_NAME = 'rainViewerPane';
const PANE_Z_INDEX = '250';

function ensureRainViewerPane(map: L.Map): void {
  if (map.getPane(PANE_NAME)) return;
  map.createPane(PANE_NAME);
  const el = map.getPane(PANE_NAME);
  if (el) {
    el.style.zIndex = PANE_Z_INDEX;
    el.style.pointerEvents = 'none';
  }
}

/**
 * Common Layers のレイヤーグループ内に RainViewer タイルを載せる。
 * オーバーレイ OFF 時はタイルを除去する。
 */
export function useRainViewerRadarLayer(
  map: L.Map | null,
  layerGroup: L.LayerGroup | null,
  enabled: boolean
): void {
  const tileRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!map || !layerGroup) return;

    if (!enabled) {
      if (tileRef.current) {
        layerGroup.removeLayer(tileRef.current);
        tileRef.current.remove();
        tileRef.current = null;
      }
      return;
    }

    let cancelled = false;
    ensureRainViewerPane(map);

    void (async () => {
      const manifest = await fetchRainViewerManifest();
      if (cancelled || !manifest) return;
      const path = pickLatestPastPath(manifest);
      if (cancelled || !path) return;

      const urlTemplate = buildRainViewerTileUrlTemplate(manifest.host, path);

      if (tileRef.current) {
        layerGroup.removeLayer(tileRef.current);
        tileRef.current.remove();
        tileRef.current = null;
      }

      const layer = L.tileLayer(urlTemplate, {
        pane: PANE_NAME,
        opacity: 0.62,
        attribution: RAINVIEWER_ATTRIBUTION,
        maxNativeZoom: RAINVIEWER_TILE_MAX_NATIVE_ZOOM,
        maxZoom: 22,
        minZoom: 0,
      });

      tileRef.current = layer;
      layerGroup.addLayer(layer);
    })();

    return () => {
      cancelled = true;
    };
  }, [map, layerGroup, enabled]);

  useEffect(() => {
    return () => {
      if (tileRef.current) {
        tileRef.current.remove();
        tileRef.current = null;
      }
    };
  }, []);
}
