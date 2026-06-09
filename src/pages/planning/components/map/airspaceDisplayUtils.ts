import type { AirspaceFeatureHit } from '../../../../utils/airspace';
import type { ACCSectorProps, RAPCONProps } from './types';
import type { AirspaceSelection } from './planningAirspaceTypes';

export const formatFreqDisplay = (raw: string): string => {
  if (!raw || raw === 'N/A') return 'N/A';
  const trimmed = raw.trim();
  if (!trimmed) return 'N/A';
  // GeoJSON 側で MHz 付きで入っている場合はそのまま（複合表記も含む）
  if (/MHz/i.test(trimmed)) return trimmed;
  const withoutUnit = trimmed.replace(/\s*MHz\s*/gi, '').trim();
  return withoutUnit ? `${withoutUnit} MHz` : 'N/A';
};

export const getFreqVhf = (p: Record<string, unknown>): string => {
  const v = (p.Freq_VHF ?? p['Freq(VHF)'] ?? '') as string;
  return formatFreqDisplay(v && v.trim() ? v : '');
};

export const getFreqUhf = (p: Record<string, unknown>): string => {
  const v = (p.Freq_UHF ?? p['Freq(UHF)'] ?? '') as string;
  return formatFreqDisplay(v && v.trim() ? v : '');
};

export const formatAltitudeRange = (floor?: string, ceiling?: string): string => {
  const f = floor && floor.trim() ? floor : 'N/A';
  const c = ceiling && ceiling.trim() ? ceiling : 'N/A';
  return `${f} - ${c}`;
};

export const getAirspaceHitLabel = (hit: AirspaceFeatureHit): string => {
  const props = hit.feature.properties ?? {};
  if (hit.kind === 'rapcon') {
    const areaId = (props as RAPCONProps).Area_ID;
    return areaId && String(areaId).trim() ? `RAPCON: ${areaId}` : 'RAPCON';
  }
  const id = (props as ACCSectorProps).ID;
  return id && String(id).trim() ? `ACC Sector: ${id}` : 'ACC Sector';
};

export const getAirspaceDisplayCallsign = (
  kind: 'acc' | 'rapcon',
  props: Record<string, unknown>,
): string => {
  if (kind === 'rapcon') {
    const rap = props as RAPCONProps;
    const callsign = rap.Callsign && String(rap.Callsign).trim();
    if (callsign) return callsign;
    const areaId = rap.Area_ID && String(rap.Area_ID).trim();
    return areaId ? areaId : 'N/A';
  }
  const callsign = (props as ACCSectorProps).Callsign;
  return callsign && String(callsign).trim() ? String(callsign) : 'N/A';
};

export const getAirspaceHitCallsign = (hit: AirspaceFeatureHit): string =>
  getAirspaceDisplayCallsign(hit.kind, hit.feature.properties ?? {});

export const getAirspaceHitAltitudeRange = (hit: AirspaceFeatureHit): string => {
  const props = hit.feature.properties ?? {};
  return formatAltitudeRange(
    props.Floor as string | undefined,
    props.Ceiling as string | undefined,
  );
};

export const getAirspaceHitSourceLabel = (hit: AirspaceFeatureHit): string => {
  switch (hit.sourceId) {
    case 'ACC_Sector_High':
      return 'ACC High';
    case 'ACC_Sector_Low':
      return 'ACC Low';
    case 'RAPCON':
      return 'RAPCON';
    default:
      return hit.sourceId;
  }
};

export function buildAirspacePeekSummary(selection: AirspaceSelection): string {
  const { hits } = selection;
  if (hits.length === 0) return '空域情報';

  const primaryHit = hits[0];
  const primary = getAirspaceHitLabel(primaryHit);
  const alt = getAirspaceHitAltitudeRange(primaryHit);
  const props = primaryHit.feature.properties ?? {};
  const vhf = getFreqVhf(props);
  const uhf = getFreqUhf(props);
  const freqPart =
    vhf !== 'N/A' || uhf !== 'N/A' ? ` · VHF ${vhf} · UHF ${uhf}` : '';

  if (hits.length === 1) {
    return `${primary} · ${alt}${freqPart}`;
  }

  return `${primary} 他${hits.length - 1}件 · ${alt}${freqPart}`;
}
