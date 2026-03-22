import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { buildWindBarbDivHtml } from '../../../../../utils/windBarbHtml';
import type { WindGridPoint } from '../../../../../utils/windGridOpenMeteo';

/**
 * 共有格子 `gridPoints` から日本域の風バーブを描画する（取得は usePlanningMapWindGrid に集約）。
 */
export function useWindBarbLayer(
  map: L.Map | null,
  layerGroup: L.LayerGroup | null,
  enabled: boolean,
  gridPoints: WindGridPoint[]
): void {
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!enabled || !layerGroup) {
      if (layerGroup) {
        for (const m of markersRef.current) {
          layerGroup.removeLayer(m);
        }
      }
      markersRef.current = [];
      return;
    }

    if (!map || !map.hasLayer(layerGroup)) {
      return;
    }

    for (const m of markersRef.current) {
      layerGroup.removeLayer(m);
    }
    markersRef.current = [];

    for (const p of gridPoints) {
      const html = buildWindBarbDivHtml(p.windFromDeg, p.speedKt, 34);
      const icon = L.divIcon({
        html,
        className: 'leaflet-wind-barb-icon',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
      const marker = L.marker([p.lat, p.lon], { icon, interactive: false });
      marker.addTo(layerGroup);
      markersRef.current.push(marker);
    }
  }, [map, layerGroup, enabled, gridPoints]);
}
