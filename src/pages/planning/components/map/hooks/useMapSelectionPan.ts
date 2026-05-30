import type L from 'leaflet';
import { useEffect } from 'react';
import { computePanByY } from '../mapSelectionPanUtils';
import type { AirspaceSelection } from '../planningAirspaceTypes';

export function useMapSelectionPan(
  map: L.Map | null,
  selection: AirspaceSelection | null,
  sheetHeightPx: number,
): void {
  useEffect(() => {
    if (!map || !selection || sheetHeightPx <= 0) return;

    const size = map.getSize();
    const point = map.latLngToContainerPoint(selection.latlng);
    const panY = computePanByY(point.y, size.y, sheetHeightPx);

    if (panY !== 0) {
      map.panBy([0, panY], { animate: true, duration: 0.25 });
    }
  }, [map, selection?.latlng.lat, selection?.latlng.lng, sheetHeightPx]);
}
