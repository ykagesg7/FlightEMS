import L from 'leaflet';
import { useCallback, useEffect, useRef } from 'react';
import { fetchTrafficStates } from '../../../../../services/openskyTraffic';
import {
  intersectWithJapanBBox,
  TRAFFIC_POLL_MS,
  type ParsedOpenSkyAircraft,
} from '../../../../../utils/openskyTraffic';
import {
  capTrafficCache,
  formatTrafficAgeLabel,
  isTrafficLayerStale,
  mergeTrafficCache,
  pruneStaleTrafficCache,
  type CachedTrafficAircraft,
  type TrafficLayerFetchMeta,
} from '../liveTrafficLayerState';

const OPENSKY_AC_ICON_SRC = '/airplane.png';

/** OpenSky true_track（真方位°）。上視シルエット（ノーズ上＝北）を進行方向へ回転 */
function openskyAircraftIcon(trackDeg: number | null, onGround: boolean, stale: boolean): L.DivIcon {
  const deg = trackDeg != null && Number.isFinite(trackDeg) ? trackDeg : 0;
  const groundClass = onGround ? ' opensky-ac-on-ground' : '';
  const staleClass = stale ? ' opensky-ac-stale' : '';
  const img = `<img src="${OPENSKY_AC_ICON_SRC}" alt="" class="opensky-ac-img" width="26" height="26" />`;
  const html = `<div class="opensky-ac-rot${groundClass}${staleClass}" style="transform:rotate(${deg}deg);width:30px;height:30px;display:flex;align-items:center;justify-content:center">${img}</div>`;
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

function buildPopupHtml(ac: ParsedOpenSkyAircraft, ageLabel: string): string {
  const altFt =
    ac.baroAltitudeM != null
      ? String(Math.round(ac.baroAltitudeM * 3.28084))
      : ac.geoAltitudeM != null
        ? String(Math.round(ac.geoAltitudeM * 3.28084))
        : '—';
  const spdKt = ac.velocityMs != null ? String(Math.round(ac.velocityMs * 1.94384)) : '—';
  const trackStr =
    ac.trueTrackDeg != null && Number.isFinite(ac.trueTrackDeg)
      ? `${Math.round(ac.trueTrackDeg)}°`
      : '—';
  const cs = ac.callsign ? escapeHtml(ac.callsign.trim()) : '—';
  const icao = escapeHtml(ac.icao24);
  return (
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
    `<div class="opensky-ac-popup-foot">参考・OpenSky（${escapeHtml(ageLabel)}・実運航用ではありません）</div>` +
    `</div>`
  );
}

type MarkerEntry = {
  marker: L.Marker;
  cached: CachedTrafficAircraft;
};

/**
 * レイヤー ON の間、日本域クリップ BBOX で OpenSky を 3 分間隔でポーリング。
 * 失敗時・パン時はマーカーを保持（Stale 表示）。
 */
export function useLiveTrafficLayer(
  map: L.Map | null,
  layerGroup: L.LayerGroup | null,
  enabled: boolean
): void {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cacheRef = useRef<Map<string, CachedTrafficAircraft>>(new Map());
  const markersRef = useRef<Map<string, MarkerEntry>>(new Map());
  const metaRef = useRef<TrafficLayerFetchMeta>({
    lastSuccessAtMs: null,
    lastFetchFailed: false,
    openSkyTimeSec: null,
  });

  const syncMarkersToCache = useCallback(
    (layerGroupLocal: L.LayerGroup, stale: boolean) => {
      const cache = cacheRef.current;
      const markers = markersRef.current;
      const meta = metaRef.current;
      const ageLabel = formatTrafficAgeLabel(meta, Date.now());

      for (const [icao, entry] of cache) {
        const ac = entry.aircraft;
        const existing = markers.get(icao);
        if (existing) {
          existing.cached = entry;
          existing.marker.setLatLng([ac.latitude, ac.longitude]);
          existing.marker.setIcon(openskyAircraftIcon(ac.trueTrackDeg, ac.onGround, stale));
          existing.marker.setPopupContent(buildPopupHtml(ac, ageLabel));
        } else {
          const m = L.marker([ac.latitude, ac.longitude], {
            icon: openskyAircraftIcon(ac.trueTrackDeg, ac.onGround, stale),
          });
          m.bindPopup(buildPopupHtml(ac, ageLabel), {
            className: 'opensky-traffic-popup',
            maxWidth: 300,
          });
          m.addTo(layerGroupLocal);
          markers.set(icao, { marker: m, cached: entry });
        }
      }

      for (const [icao, entry] of markers) {
        if (!cache.has(icao)) {
          layerGroupLocal.removeLayer(entry.marker);
          markers.delete(icao);
        }
      }
    },
    []
  );

  const refresh = useCallback(async () => {
    if (!map || !layerGroup || !enabled) return;

    const b = map.getBounds();
    const box = intersectWithJapanBBox({
      south: b.getSouth(),
      west: b.getWest(),
      north: b.getNorth(),
      east: b.getEast(),
    });

    if (!box) {
      // 日本域外でも保持（ユーザー合意）。fetch のみスキップ。
      const stale = isTrafficLayerStale(metaRef.current, TRAFFIC_POLL_MS, Date.now());
      syncMarkersToCache(layerGroup, stale);
      return;
    }

    const nowMs = Date.now();
    const result = await fetchTrafficStates(box);

    if (!result.ok) {
      metaRef.current = {
        ...metaRef.current,
        lastFetchFailed: true,
      };
      const stale = isTrafficLayerStale(metaRef.current, TRAFFIC_POLL_MS, nowMs);
      syncMarkersToCache(layerGroup, stale);
      console.warn('[useLiveTrafficLayer] fetch failed', result.status, result.retryAfterSeconds);
      return;
    }

    metaRef.current = {
      lastSuccessAtMs: nowMs,
      lastFetchFailed: false,
      openSkyTimeSec: result.response.time > 0 ? result.response.time : null,
    };

    let cache = mergeTrafficCache(cacheRef.current, result.response.states, nowMs);
    cache = pruneStaleTrafficCache(cache, nowMs);
    cache = capTrafficCache(cache);
    cacheRef.current = cache;

    const stale = isTrafficLayerStale(metaRef.current, TRAFFIC_POLL_MS, nowMs);
    syncMarkersToCache(layerGroup, stale);
  }, [map, layerGroup, enabled, syncMarkersToCache]);

  useEffect(() => {
    if (!enabled && layerGroup) {
      layerGroup.clearLayers();
      cacheRef.current = new Map();
      markersRef.current = new Map();
      metaRef.current = {
        lastSuccessAtMs: null,
        lastFetchFailed: false,
        openSkyTimeSec: null,
      };
    }
  }, [enabled, layerGroup]);

  useEffect(() => {
    if (!enabled || !map || !layerGroup) return;

    void refresh();
    intervalRef.current = setInterval(() => void refresh(), TRAFFIC_POLL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [map, layerGroup, enabled, refresh]);
}
