import L from 'leaflet';
import { useCallback, useEffect, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { fetchTrafficStates } from '../../../../../services/openskyTraffic';
import { intersectWithJapanBBox } from '../../../../../utils/openskyTraffic';

const POLL_MS = 50_000;
const MOVE_DEBOUNCE_MS = 500;
const MAX_MARKERS = 400;

const OPENSKY_AC_ICON_SRC = '/airplane.png';

/** OpenSky true_track（真方位°）。上視シルエット（ノーズ上＝北）を進行方向へ回転 */
function openskyAircraftIcon(trackDeg: number | null, onGround: boolean): L.DivIcon {
  const deg = trackDeg != null && Number.isFinite(trackDeg) ? trackDeg : 0;
  const groundClass = onGround ? ' opensky-ac-on-ground' : '';
  const img = `<img src="${OPENSKY_AC_ICON_SRC}" alt="" class="opensky-ac-img" width="26" height="26" />`;
  const html = `<div class="opensky-ac-rot${groundClass}" style="transform:rotate(${deg}deg);width:30px;height:30px;display:flex;align-items:center;justify-content:center">${img}</div>`;
  return L.divIcon({
    html,
    className: 'leaflet-opensky-ac-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -14],
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * レイヤーが ON の間、日本域クリップ BBOX で OpenSky をポーリングし layerGroup にマーカーを描画する。
 */
export function useLiveTrafficLayer(
  map: L.Map | null,
  layerGroup: L.LayerGroup | null,
  enabled: boolean
): void {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    if (!map || !layerGroup || !enabled) return;
    // レイヤー ON 直後は Leaflet の addLayer と React の state 更新が 1 フレームずれることがあり、
    // hasLayer が false のまま refresh が走ると一切フェッチしない。enabled を信頼する。

    const b = map.getBounds();
    const box = intersectWithJapanBBox({
      south: b.getSouth(),
      west: b.getWest(),
      north: b.getNorth(),
      east: b.getEast(),
    });

    if (!box) {
      layerGroup.clearLayers();
      return;
    }

    try {
      const { states } = await fetchTrafficStates(box);
      const limited = states.slice(0, MAX_MARKERS);
      layerGroup.clearLayers();

      for (const ac of limited) {
        const m = L.marker([ac.latitude, ac.longitude], {
          icon: openskyAircraftIcon(ac.trueTrackDeg, ac.onGround),
        });
        const altFt =
          ac.baroAltitudeM != null
            ? String(Math.round(ac.baroAltitudeM * 3.28084))
            : ac.geoAltitudeM != null
              ? String(Math.round(ac.geoAltitudeM * 3.28084))
              : '—';
        const spdKt =
          ac.velocityMs != null ? String(Math.round(ac.velocityMs * 1.94384)) : '—';
        const trackStr =
          ac.trueTrackDeg != null && Number.isFinite(ac.trueTrackDeg)
            ? `${Math.round(ac.trueTrackDeg)}°`
            : '—';
        const cs = ac.callsign ? escapeHtml(ac.callsign.trim()) : '—';
        const icao = escapeHtml(ac.icao24);
        m.bindPopup(
          `<div class="opensky-ac-popup">` +
            `<div class="opensky-ac-popup-header">` +
            `<span class="opensky-ac-popup-icao">${icao}</span>` +
            `<img src="${OPENSKY_AC_ICON_SRC}" class="opensky-ac-popup-thumb" width="22" height="22" alt="" />` +
            `</div>` +
            `<div class="opensky-ac-popup-body">` +
            `<div class="opensky-ac-popup-row"><span class="opensky-ac-popup-label">Callsign</span><span class="opensky-ac-popup-value">${cs}</span></div>` +
            `<div class="opensky-ac-popup-row"><span class="opensky-ac-popup-label">進行方位(真)</span><span class="opensky-ac-popup-value">${trackStr}</span></div>` +
            `<div class="opensky-ac-popup-row"><span class="opensky-ac-popup-label">高度(ft)</span><span class="opensky-ac-popup-value">${altFt}</span></div>` +
            `<div class="opensky-ac-popup-row"><span class="opensky-ac-popup-label">地速(kt)</span><span class="opensky-ac-popup-value">${spdKt}</span></div>` +
            `</div>` +
            `<div class="opensky-ac-popup-foot">参考・OpenSky（実運航用ではありません）</div>` +
            `</div>`,
          { className: 'opensky-traffic-popup', maxWidth: 300 }
        );
        m.addTo(layerGroup);
      }
    } catch (e) {
      console.warn('[useLiveTrafficLayer]', e);
    }
  }, [map, layerGroup, enabled]);

  const debouncedRefresh = useDebouncedCallback(refresh, MOVE_DEBOUNCE_MS);

  useEffect(() => {
    if (!enabled && layerGroup) {
      layerGroup.clearLayers();
    }
  }, [enabled, layerGroup]);

  useEffect(() => {
    if (!enabled || !map || !layerGroup) return;

    void refresh();
    intervalRef.current = setInterval(() => void refresh(), POLL_MS);

    const onMoveEnd = () => debouncedRefresh();
    map.on('moveend', onMoveEnd);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      map.off('moveend', onMoveEnd);
      debouncedRefresh.cancel();
    };
  }, [map, layerGroup, enabled, refresh, debouncedRefresh]);
}
