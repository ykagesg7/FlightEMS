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
import {
  buildOpenSkyTrafficPopupHtml,
  OPENSKY_TRAFFIC_POPUP_OPTIONS,
} from '../popups/openskyTrafficPopup';

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

function iconNeedsUpdate(
  prev: ParsedOpenSkyAircraft,
  next: ParsedOpenSkyAircraft,
  stale: boolean,
  prevStale: boolean
): boolean {
  return (
    prev.trueTrackDeg !== next.trueTrackDeg ||
    prev.onGround !== next.onGround ||
    stale !== prevStale
  );
}

type MarkerEntry = {
  marker: L.Marker;
  cached: CachedTrafficAircraft;
  stale: boolean;
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
  const openPopupIcaoRef = useRef<string | null>(null);
  const metaRef = useRef<TrafficLayerFetchMeta>({
    lastSuccessAtMs: null,
    lastFetchFailed: false,
    openSkyTimeSec: null,
  });

  const bindOpenPopupTracking = useCallback((marker: L.Marker, icao: string) => {
    marker.on('popupopen', () => {
      openPopupIcaoRef.current = icao;
    });
    marker.on('popupclose', () => {
      if (openPopupIcaoRef.current === icao) {
        openPopupIcaoRef.current = null;
      }
    });
  }, []);

  const syncMarkersToCache = useCallback(
    (layerGroupLocal: L.LayerGroup, stale: boolean) => {
      const cache = cacheRef.current;
      const markers = markersRef.current;
      const meta = metaRef.current;
      const ageLabel = formatTrafficAgeLabel(meta, Date.now());
      let reopenIcao: string | null = null;

      for (const [icao, entry] of cache) {
        const ac = entry.aircraft;
        const html = buildOpenSkyTrafficPopupHtml(ac, ageLabel);
        const existing = markers.get(icao);

        if (existing) {
          const wasOpen = existing.marker.isPopupOpen();
          const prevAc = existing.cached.aircraft;
          const prevStale = existing.stale;
          existing.cached = entry;

          const latLng = L.latLng(ac.latitude, ac.longitude);
          if (!existing.marker.getLatLng().equals(latLng)) {
            existing.marker.setLatLng(latLng);
          }

          if (iconNeedsUpdate(prevAc, ac, stale, prevStale)) {
            existing.marker.setIcon(openskyAircraftIcon(ac.trueTrackDeg, ac.onGround, stale));
            existing.stale = stale;
          }

          const popup = existing.marker.getPopup();
          if (popup) {
            popup.setContent(html);
            if (wasOpen) {
              popup.update();
              reopenIcao = icao;
            }
          } else {
            existing.marker.bindPopup(html, OPENSKY_TRAFFIC_POPUP_OPTIONS);
          }
        } else {
          const m = L.marker([ac.latitude, ac.longitude], {
            icon: openskyAircraftIcon(ac.trueTrackDeg, ac.onGround, stale),
          });
          m.bindPopup(html, OPENSKY_TRAFFIC_POPUP_OPTIONS);
          bindOpenPopupTracking(m, icao);
          m.addTo(layerGroupLocal);
          markers.set(icao, { marker: m, cached: entry, stale });
        }
      }

      for (const [icao, entry] of markers) {
        if (!cache.has(icao)) {
          if (openPopupIcaoRef.current === icao) {
            openPopupIcaoRef.current = null;
          }
          layerGroupLocal.removeLayer(entry.marker);
          markers.delete(icao);
        }
      }

      const trackedOpen = openPopupIcaoRef.current;
      const icaoToReopen = reopenIcao ?? trackedOpen;
      if (icaoToReopen) {
        const target = markers.get(icaoToReopen);
        if (target && !target.marker.isPopupOpen()) {
          target.marker.openPopup();
        }
      }
    },
    [bindOpenPopupTracking]
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
      openPopupIcaoRef.current = null;
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

    const onMoveEnd = () => {
      const icao = openPopupIcaoRef.current;
      if (!icao) return;
      const entry = markersRef.current.get(icao);
      if (entry && !entry.marker.isPopupOpen()) {
        entry.marker.openPopup();
      }
    };
    map.on('moveend', onMoveEnd);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      map.off('moveend', onMoveEnd);
    };
  }, [map, layerGroup, enabled, refresh]);
}
