import type { PopupOptions } from 'leaflet';
import type { ParsedOpenSkyAircraft } from '../../../../../utils/openskyTraffic';
import { escapeHtml } from './common';

export const OPENSKY_TRAFFIC_POPUP_OPTIONS: PopupOptions = {
  className: 'opensky-traffic-popup opensky-custom-popup',
  maxWidth: 280,
  autoPan: false,
};

export function buildOpenSkyTrafficPopupHtml(
  ac: ParsedOpenSkyAircraft,
  ageLabel: string
): string {
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
    `<div class="opensky-ac-popup-title">${icao}</div>` +
    `<div class="opensky-ac-popup-subtitle">${cs !== '—' ? cs : 'Callsign —'}</div>` +
    `</div>` +
    `<div class="opensky-ac-popup-body">` +
    `<div class="opensky-ac-popup-row"><span class="opensky-ac-popup-label">進行方位(真):</span><span class="opensky-ac-popup-value">${trackStr}</span></div>` +
    `<div class="opensky-ac-popup-row"><span class="opensky-ac-popup-label">高度(ft):</span><span class="opensky-ac-popup-value">${altFt}</span></div>` +
    `<div class="opensky-ac-popup-row"><span class="opensky-ac-popup-label">地速(kt):</span><span class="opensky-ac-popup-value">${spdKt}</span></div>` +
    `</div>` +
    `<div class="opensky-ac-popup-foot">参考・OpenSky（${escapeHtml(ageLabel)}・実運航用ではありません）</div>` +
    `</div>`
  );
}
