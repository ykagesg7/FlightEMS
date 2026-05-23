import type L from 'leaflet';
import { useEffect } from 'react';

/**
 * モバイルでレイヤーボトムシート表示中、地図のホイールズームを抑止する。
 * パン（ドラッグ）は許可したまま。
 */
export function useMapLayersOpenMapLock(
  map: L.Map | null,
  layersOpen: boolean,
  isDesktop: boolean,
): void {
  useEffect(() => {
    if (!map || !layersOpen || isDesktop) return;

    if (map.scrollWheelZoom.enabled()) {
      map.scrollWheelZoom.disable();
    }

    return () => {
      if (!map.scrollWheelZoom.enabled()) {
        map.scrollWheelZoom.enable();
      }
    };
  }, [map, layersOpen, isDesktop]);
}
