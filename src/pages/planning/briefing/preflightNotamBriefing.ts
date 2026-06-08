import type { Airport, FlightPlan } from '../../../types';
import type { SwimNotamFetchOk, SwimNotamItem } from '../../../services/swimNotam';
import { buildNotamPeekSummary } from '../components/map/notamDisplayUtils';
import { isIcaoLocationCode } from '../components/map/notamDisplayUtils';

export type PreflightAirportRole = 'departure' | 'arrival';

export type PreflightAirportNotamTarget = {
  role: PreflightAirportRole;
  icao: string;
  label: string;
  lat?: number;
  lon?: number;
};

export function extractIcaoFromAirport(airport: Airport | undefined): string | null {
  if (!airport) return null;
  const value = airport.value?.trim().toUpperCase();
  if (value && isIcaoLocationCode(value)) return value;
  const propId = airport.properties?.id;
  if (typeof propId === 'string') {
    const id = propId.trim().toUpperCase();
    if (isIcaoLocationCode(id)) return id;
  }
  return null;
}

export function extractPreflightNotamTargets(plan: FlightPlan): PreflightAirportNotamTarget[] {
  const targets: PreflightAirportNotamTarget[] = [];
  const depIcao = extractIcaoFromAirport(plan.departure);
  if (depIcao && plan.departure) {
    targets.push({
      role: 'departure',
      icao: depIcao,
      label: plan.departure.label || depIcao,
      lat: plan.departure.latitude,
      lon: plan.departure.longitude,
    });
  }
  const arrIcao = extractIcaoFromAirport(plan.arrival);
  if (arrIcao && plan.arrival) {
    if (arrIcao !== depIcao) {
      targets.push({
        role: 'arrival',
        icao: arrIcao,
        label: plan.arrival.label || arrIcao,
        lat: plan.arrival.latitude,
        lon: plan.arrival.longitude,
      });
    }
  }
  return targets;
}

export function notamTargetsCacheKey(targets: PreflightAirportNotamTarget[]): string {
  return targets.map((t) => `${t.role}:${t.icao}`).join('|');
}

export type AirportNotamBriefingSnapshot = {
  icao: string;
  label: string;
  role: PreflightAirportRole;
  loading: boolean;
  error: string | null;
  currentCount: number;
  futureCount: number;
  peekSummary: string;
  highlights: string[];
};

const HIGHLIGHT_MAX = 3;
const HIGHLIGHT_TEXT_MAX = 120;

function pickHighlightText(item: SwimNotamItem): string {
  const text = (item.impactLabel ?? item.primaryText ?? item.summary).trim();
  return text.length > HIGHLIGHT_TEXT_MAX ? `${text.slice(0, HIGHLIGHT_TEXT_MAX)}…` : text;
}

export function buildAirportNotamBriefingSnapshot(
  target: PreflightAirportNotamTarget,
  state: {
    loading: boolean;
    error: string | null;
    data: SwimNotamFetchOk | null;
  },
): AirportNotamBriefingSnapshot {
  const current = state.data?.current ?? [];
  const future = state.data?.future ?? [];
  const combined = [...current, ...future];
  const highlights = combined.slice(0, HIGHLIGHT_MAX).map(pickHighlightText);

  return {
    icao: target.icao,
    label: target.label,
    role: target.role,
    loading: state.loading,
    error: state.error,
    currentCount: current.length,
    futureCount: future.length,
    peekSummary: state.loading
      ? `${target.icao} — 読み込み中…`
      : state.error
        ? `${target.icao} — 取得エラー`
        : buildNotamPeekSummary(target.icao, current.length, future.length),
    highlights,
  };
}

export function roleLabelJa(role: PreflightAirportRole): string {
  return role === 'departure' ? '出発' : '到着';
}
