import type L from 'leaflet';
import { useEffect } from 'react';

export function useCloseLayersOnMapClick(
  map: L.Map | null,
  layersOpen: boolean,
  onClose: () => void,
): void {
  useEffect(() => {
    if (!map || !layersOpen) return;

    const onMapClick = (e: L.LeafletMouseEvent) => {
      const target = e.originalEvent.target;
      if (target instanceof Element && target.closest('.leaflet-popup')) {
        return;
      }
      onClose();
    };

    map.on('click', onMapClick);
    return () => {
      map.off('click', onMapClick);
    };
  }, [map, layersOpen, onClose]);
}
