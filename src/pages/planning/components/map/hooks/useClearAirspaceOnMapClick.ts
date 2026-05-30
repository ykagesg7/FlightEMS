import type L from 'leaflet';
import { useEffect } from 'react';
import type { AirspaceSelection } from '../planningAirspaceTypes';

export function useClearAirspaceOnMapClick(
  map: L.Map | null,
  selection: AirspaceSelection | null,
  onClear: () => void,
): void {
  useEffect(() => {
    if (!map || !selection) return;

    const onMapClick = (e: L.LeafletMouseEvent) => {
      const target = e.originalEvent.target;
      if (target instanceof Element && target.closest('.leaflet-interactive')) {
        return;
      }
      if (target instanceof Element && target.closest('.map-airspace-sheet')) {
        return;
      }
      if (target instanceof Element && target.closest('.map-cursor-hud')) {
        return;
      }
      onClear();
    };

    map.on('click', onMapClick);
    return () => {
      map.off('click', onMapClick);
    };
  }, [map, selection, onClear]);
}
