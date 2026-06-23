import type { ParsedOpenSkyAircraft } from '../../../../utils/openskyTraffic';
import { TRAFFIC_STALE_MAX_AGE_MS } from '../../../../utils/openskyTraffic';

export const MAX_TRAFFIC_MARKERS = 400;

export type CachedTrafficAircraft = {
  aircraft: ParsedOpenSkyAircraft;
  /** Client wall-clock ms when this aircraft was last seen in a successful fetch. */
  lastSeenAtMs: number;
};

export type TrafficLayerFetchMeta = {
  lastSuccessAtMs: number | null;
  lastFetchFailed: boolean;
  openSkyTimeSec: number | null;
};

/**
 * Merge incoming aircraft into cache by icao24; update lastSeenAtMs for each.
 */
export function mergeTrafficCache(
  cache: Map<string, CachedTrafficAircraft>,
  incoming: ParsedOpenSkyAircraft[],
  nowMs: number
): Map<string, CachedTrafficAircraft> {
  const next = new Map(cache);
  for (const ac of incoming) {
    next.set(ac.icao24, { aircraft: ac, lastSeenAtMs: nowMs });
  }
  return next;
}

/**
 * Remove aircraft not updated within maxAgeMs.
 */
export function pruneStaleTrafficCache(
  cache: Map<string, CachedTrafficAircraft>,
  nowMs: number,
  maxAgeMs = TRAFFIC_STALE_MAX_AGE_MS
): Map<string, CachedTrafficAircraft> {
  const next = new Map<string, CachedTrafficAircraft>();
  for (const [icao, entry] of cache) {
    if (nowMs - entry.lastSeenAtMs <= maxAgeMs) {
      next.set(icao, entry);
    }
  }
  return next;
}

/**
 * Cap marker count; prefer most recently seen aircraft.
 */
export function capTrafficCache(
  cache: Map<string, CachedTrafficAircraft>,
  maxMarkers = MAX_TRAFFIC_MARKERS
): Map<string, CachedTrafficAircraft> {
  if (cache.size <= maxMarkers) return cache;
  const sorted = [...cache.entries()].sort((a, b) => b[1].lastSeenAtMs - a[1].lastSeenAtMs);
  const next = new Map<string, CachedTrafficAircraft>();
  for (let i = 0; i < maxMarkers && i < sorted.length; i++) {
    const [icao, entry] = sorted[i]!;
    next.set(icao, entry);
  }
  return next;
}

/**
 * Returns age label for popup footer (Japanese).
 */
export function formatTrafficAgeLabel(
  meta: TrafficLayerFetchMeta,
  nowMs: number
): string {
  if (meta.lastFetchFailed && meta.lastSuccessAtMs === null) {
    return '取得できませんでした';
  }
  const refMs = meta.lastSuccessAtMs;
  if (refMs === null) return '参考';
  const ageMin = Math.max(0, Math.floor((nowMs - refMs) / 60_000));
  if (ageMin <= 0) return '1分未満前';
  return `${ageMin}分前`;
}

/** True when markers should render with stale styling. */
export function isTrafficLayerStale(meta: TrafficLayerFetchMeta, pollMs: number, nowMs: number): boolean {
  if (meta.lastFetchFailed) return true;
  if (meta.lastSuccessAtMs === null) return false;
  return nowMs - meta.lastSuccessAtMs > pollMs;
}
