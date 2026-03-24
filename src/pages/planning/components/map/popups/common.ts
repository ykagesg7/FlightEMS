// Common helpers for building Leaflet popup HTML safely and consistently
import L from 'leaflet';

export type ItemPrefix = 'weather' | 'airport';

export const escapeHtml = (raw: unknown): string => {
  const str = String(raw ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Build a key/value row (label and value on one line; wraps if needed).
 * prefix controls CSS class names (weather|airport)
 */
export const kvItem = (
  prefix: ItemPrefix,
  label: string,
  value: string,
  opts?: { readout?: boolean }
): string => {
  const readoutClass = opts?.readout ? ' hud-readout' : '';
  const safeLabel = escapeHtml(label);
  const safeValue = escapeHtml(value);
  return `
    <div class="text-sm ${prefix}-item">
      <span class="${prefix}-label">${safeLabel}</span><span class="${prefix}-value${readoutClass}">${safeValue}</span>
    </div>
  `;
};

/** Simple section header + optional right-side icon */
export const sectionHeader = (title: string, iconHtml?: string): string => {
  return `
    <div class="mb-2">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-bold mb-0 popup-section-title">${escapeHtml(title)}</h4>
        ${iconHtml ?? ''}
      </div>
    </div>
  `;
};

/** METAR/TAF と同系の折りたたみ（本文は呼び出し側でエスケープ済みを渡す） */
export const collapsibleHtmlSection = (
  summaryTitle: string,
  bodyHtml: string,
  extraClass = 'metar-taf-collapsible',
): string => `
  <details class="${extraClass} notam-collapsible">
    <summary class="metar-taf-summary cursor-pointer select-none">
      <span class="metar-taf-summary-title">${escapeHtml(summaryTitle)}</span>
      <span class="metar-taf-summary-hint text-slate-500">開く</span>
    </summary>
    <div class="metar-taf-body mt-1">${bodyHtml}</div>
  </details>
`;

export const createPopup = (latlng: [number, number]) =>
  L.popup({
    className: 'airport-weather-popup',
    maxWidth: 400,
    keepInView: true,
    autoPan: true,
    autoPanPadding: L.point(24, 24),
  }).setLatLng(latlng);


