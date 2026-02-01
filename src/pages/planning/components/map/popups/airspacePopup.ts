import L from 'leaflet';
import { escapeHtml } from './common';
import type { ACCSectorProps, RAPCONProps } from '../types';

const orNa = (v: string | undefined): string => (v && v.trim() ? escapeHtml(v) : 'N/A');

const formatFreqDisplay = (raw: string): string => {
  if (!raw || raw === 'N/A') return 'N/A';
  const trimmed = raw.replace(/\s*MHz\s*/gi, '').trim();
  return trimmed ? `${trimmed} MHz` : 'N/A';
};

const getFreqVhf = (p: Record<string, unknown>): string => {
  const v = (p.Freq_VHF ?? p['Freq(VHF)'] ?? '') as string;
  return formatFreqDisplay(v && v.trim() ? v : '');
};

const getFreqUhf = (p: Record<string, unknown>): string => {
  const v = (p.Freq_UHF ?? p['Freq(UHF)'] ?? '') as string;
  return formatFreqDisplay(v && v.trim() ? v : '');
};

const formatAltitudeRange = (floor?: string, ceiling?: string): string => {
  const f = floor && floor.trim() ? escapeHtml(floor) : 'N/A';
  const c = ceiling && ceiling.trim() ? escapeHtml(ceiling) : 'N/A';
  return `${f} - ${c}`;
};

export const buildACCSectorPopupContent = (props: ACCSectorProps | Record<string, unknown>): string => {
  const id = orNa((props as ACCSectorProps).ID);
  const callsign = orNa((props as ACCSectorProps).Callsign);
  const vhf = getFreqVhf(props as Record<string, unknown>);
  const uhf = getFreqUhf(props as Record<string, unknown>);
  const floor = (props as ACCSectorProps).Floor;
  const ceiling = (props as ACCSectorProps).Ceiling;
  const altRange = formatAltitudeRange(floor, ceiling);

  return `
    <div class="airspace-popup">
      <div class="airspace-popup-header">
        <div class="airspace-popup-title">ACC Sector: ${id}</div>
        <div class="airspace-popup-subtitle">${callsign}</div>
      </div>
      <div class="airspace-popup-body">
        <div class="airspace-popup-row"><span class="airspace-popup-label">VHF:</span> ${vhf}</div>
        <div class="airspace-popup-row"><span class="airspace-popup-label">UHF:</span> ${uhf}</div>
        <div class="airspace-popup-row airspace-popup-altitude"><span class="airspace-popup-label">高度範囲:</span> ${altRange}</div>
      </div>
    </div>
  `;
};

export const buildRAPCONPopupContent = (props: RAPCONProps | Record<string, unknown>): string => {
  const areaId = orNa((props as RAPCONProps).Area_ID);
  const callsign = orNa((props as RAPCONProps).Callsign);
  const vhf = getFreqVhf(props as Record<string, unknown>);
  const uhf = getFreqUhf(props as Record<string, unknown>);
  const floor = (props as RAPCONProps).Floor;
  const ceiling = (props as RAPCONProps).Ceiling;
  const altRange = formatAltitudeRange(floor, ceiling);

  return `
    <div class="airspace-popup">
      <div class="airspace-popup-header">
        <div class="airspace-popup-title">RAPCON: ${areaId}</div>
        <div class="airspace-popup-subtitle">${callsign}</div>
      </div>
      <div class="airspace-popup-body">
        <div class="airspace-popup-row"><span class="airspace-popup-label">VHF:</span> ${vhf}</div>
        <div class="airspace-popup-row"><span class="airspace-popup-label">UHF:</span> ${uhf}</div>
        <div class="airspace-popup-row airspace-popup-altitude"><span class="airspace-popup-label">高度範囲:</span> ${altRange}</div>
      </div>
    </div>
  `;
};

export const bindACCSectorPopup = (feature: GeoJSON.Feature, layer: L.Layer): void => {
  if (!feature.properties) return;
  const content = buildACCSectorPopupContent(feature.properties as ACCSectorProps);
  const popup = L.popup({ className: 'airspace-custom-popup', maxWidth: 280 });
  popup.setContent(content);
  layer.bindPopup(popup);
};

export const bindRAPCONPopup = (feature: GeoJSON.Feature, layer: L.Layer): void => {
  if (!feature.properties) return;
  const content = buildRAPCONPopupContent(feature.properties as RAPCONProps);
  const popup = L.popup({ className: 'airspace-custom-popup', maxWidth: 280 });
  popup.setContent(content);
  layer.bindPopup(popup);
};
