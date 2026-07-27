import type L from 'leaflet';
import Leaflet from 'leaflet';
import { useEffect } from 'react';
import type { PlanningMapNavaid } from '../planningMapTypes';
import {
  NAVAID_DME_STEP_NM,
  NAVAID_RADIAL_MAX_NM,
  NAVAID_RADIAL_SAMPLE_STEP_NM,
  NAVAID_RADIAL_STEP_DEG,
  buildRadialPolyline,
  dmeLabelBearings,
  formatDmeLabel,
  formatRadialLabel,
  listDmeRingNm,
  listRadialBearings,
  radialEndpoint,
  radialLabelDistancesNm,
} from '../navaidRadialGridUtils';

const NM_TO_M = 1852;

const RADIAL_STYLE: L.PolylineOptions = {
  color: '#f5d76e',
  weight: 1,
  opacity: 0.45,
  interactive: false,
  className: 'navaid-radial-line',
};

const RING_PATH_STYLE = {
  color: '#f5d76e',
  weight: 1,
  opacity: 0.4,
  fillOpacity: 0,
  interactive: false,
  className: 'navaid-dme-ring',
} as const;

function labelIcon(text: string, kind: 'radial' | 'dme'): L.DivIcon {
  return Leaflet.divIcon({
    className: `navaid-radial-label navaid-radial-label--${kind}`,
    html: `<span>${text}</span>`,
    iconSize: [28, 14],
    iconAnchor: kind === 'radial' ? [14, 7] : [10, 7],
  });
}

/**
 * 選択 NAVAID から磁方位 10°・DME 10 nm（最大 100 nm）の網を描画する。
 * 方位ラベル: 000/090/180/270 は 10 nm 刻み、その他は 50/100 nm。
 * DME 距離ラベル: 010/100/190/280 上に 10 nm 刻み。
 */
export function useNavaidRadialGridLayer(
  map: L.Map | null,
  layerGroup: L.LayerGroup | null,
  enabled: boolean,
  stationId: string | null,
  navaids: PlanningMapNavaid[],
): void {
  useEffect(() => {
    if (!layerGroup) return;

    layerGroup.clearLayers();

    if (!enabled || !stationId || !map) return;
    if (!map.hasLayer(layerGroup)) return;

    const station = navaids.find((n) => n.id === stationId);
    if (!station) return;

    const origin = { lat: station.coordinates.lat, lon: station.coordinates.lng };

    for (const bearing of listRadialBearings(NAVAID_RADIAL_STEP_DEG)) {
      const latlngs = buildRadialPolyline(
        origin,
        bearing,
        NAVAID_RADIAL_MAX_NM,
        NAVAID_RADIAL_SAMPLE_STEP_NM,
      );
      Leaflet.polyline(latlngs, RADIAL_STYLE).addTo(layerGroup);

      for (const labelNm of radialLabelDistancesNm(bearing)) {
        const labelAt = radialEndpoint(origin, bearing, labelNm);
        Leaflet.marker([labelAt.lat, labelAt.lon], {
          icon: labelIcon(formatRadialLabel(bearing), 'radial'),
          interactive: false,
          keyboard: false,
        }).addTo(layerGroup);
      }
    }

    for (const nm of listDmeRingNm(NAVAID_DME_STEP_NM, NAVAID_RADIAL_MAX_NM)) {
      Leaflet.circle([origin.lat, origin.lon], {
        ...RING_PATH_STYLE,
        radius: nm * NM_TO_M,
      }).addTo(layerGroup);

      for (const bearing of dmeLabelBearings()) {
        const labelAt = radialEndpoint(origin, bearing, nm);
        Leaflet.marker([labelAt.lat, labelAt.lon], {
          icon: labelIcon(formatDmeLabel(nm), 'dme'),
          interactive: false,
          keyboard: false,
        }).addTo(layerGroup);
      }
    }

    Leaflet.circleMarker([origin.lat, origin.lon], {
      radius: 5,
      color: '#f5d76e',
      weight: 2,
      fillColor: '#f5d76e',
      fillOpacity: 0.9,
      interactive: false,
      className: 'navaid-radial-origin',
    }).addTo(layerGroup);
  }, [map, layerGroup, enabled, stationId, navaids]);
}
