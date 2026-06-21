import type { Feature } from 'geojson';
import type { Layer } from 'leaflet';
import {
  formatAltitudeRange,
  getAirspaceDisplayCallsign,
  getFreqUhf,
  getFreqVhf,
} from '../airspaceDisplayUtils';
import { escapeHtml } from './common';

export type AirspacePopupKind = 'acc' | 'rapcon';

function getAirspacePopupTitle(kind: AirspacePopupKind, props: Record<string, unknown>): string {
  if (kind === 'rapcon') {
    const areaId = String(props.Area_ID ?? '').trim();
    return areaId ? `RAPCON: ${areaId}` : 'RAPCON';
  }
  const id = String(props.ID ?? '').trim();
  return id ? `ACC Sector: ${id}` : 'ACC Sector';
}

export function buildAirspacePopupHtml(
  kind: AirspacePopupKind,
  properties: Record<string, unknown>,
): string {
  const title = getAirspacePopupTitle(kind, properties);
  const callsign = getAirspaceDisplayCallsign(kind, properties);
  const vhf = getFreqVhf(properties);
  const uhf = getFreqUhf(properties);
  const alt = formatAltitudeRange(
    properties.Floor as string | undefined,
    properties.Ceiling as string | undefined,
  );
  const callsignLabel = kind === 'rapcon' ? 'エリア / 呼称' : 'Callsign';

  return `
    <div class="airspace-popup">
      <div class="airspace-popup-header">
        <div class="airspace-popup-title">${escapeHtml(title)}</div>
        ${callsign !== 'N/A' ? `<div class="airspace-popup-subtitle">${escapeHtml(callsign)}</div>` : ''}
      </div>
      <div class="airspace-popup-body">
        <div class="airspace-popup-row">
          <span class="airspace-popup-label">${escapeHtml(callsignLabel)}:</span>
          ${escapeHtml(callsign)}
        </div>
        <div class="airspace-popup-row">
          <span class="airspace-popup-label">VHF:</span>
          <span class="font-mono">${escapeHtml(vhf)}</span>
        </div>
        <div class="airspace-popup-row">
          <span class="airspace-popup-label">UHF:</span>
          <span class="font-mono">${escapeHtml(uhf)}</span>
        </div>
        <div class="airspace-popup-row airspace-popup-altitude">
          <span class="airspace-popup-label">高度:</span>
          <span class="font-mono">${escapeHtml(alt)}</span>
        </div>
      </div>
    </div>
  `;
}

export function bindAirspaceFeaturePopup(
  feature: Feature,
  layer: Layer,
  kind: AirspacePopupKind,
): void {
  const html = buildAirspacePopupHtml(kind, feature.properties ?? {});
  layer.bindPopup(html, {
    className: 'airspace-custom-popup',
    maxWidth: 300,
    keepInView: true,
  });
}
