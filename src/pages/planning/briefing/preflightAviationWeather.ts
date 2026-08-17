import type { AviationWeatherData } from '../../../types/aviation';
import { formatMETAR, formatTAF, translateFlightCategory } from '../../../services/aviationWeather';
import type { PreflightAirportNotamTarget, PreflightAirportRole } from './preflightNotamBriefing';

const PREVIEW_MAX = 88;

export type AirportWeatherSnapshot = {
  icao: string;
  label: string;
  role: PreflightAirportRole;
  loading: boolean;
  error: string | null;
  fltCat: string | null;
  metarPreview: string | null;
  metarFull: string | null;
  tafPreview: string | null;
  tafFull: string | null;
};

function previewText(full: string): string {
  const t = full.replace(/\s+/g, ' ').trim();
  return t.length > PREVIEW_MAX ? `${t.slice(0, PREVIEW_MAX)}…` : t;
}

export function buildAirportWeatherSnapshot(
  target: PreflightAirportNotamTarget,
  state: {
    loading: boolean;
    error: string | null;
    data: AviationWeatherData | null;
  },
): AirportWeatherSnapshot {
  const metarRaw = state.data?.metar?.rawOb
    ? formatMETAR(state.data.metar.rawOb)
    : null;
  const tafRaw = state.data?.taf?.rawTAF ? formatTAF(state.data.taf.rawTAF) : null;
  const fltCat = state.data?.metar?.fltCat
    ? translateFlightCategory(state.data.metar.fltCat)
    : null;

  return {
    icao: target.icao,
    label: target.label,
    role: target.role,
    loading: state.loading,
    error: state.error,
    fltCat,
    metarPreview: metarRaw ? previewText(metarRaw) : null,
    metarFull: metarRaw,
    tafPreview: tafRaw ? previewText(tafRaw.replace(/\n/g, ' ')) : null,
    tafFull: tafRaw,
  };
}
