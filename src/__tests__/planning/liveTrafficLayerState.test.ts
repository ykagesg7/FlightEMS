import { describe, expect, it } from 'vitest';
import {
  capTrafficCache,
  formatTrafficAgeLabel,
  isTrafficLayerStale,
  mergeTrafficCache,
  pruneStaleTrafficCache,
} from '../../pages/planning/components/map/liveTrafficLayerState';
import type { ParsedOpenSkyAircraft } from '../../utils/openskyTraffic';
import { TRAFFIC_STALE_MAX_AGE_MS } from '../../utils/openskyTraffic';

function ac(icao: string, lat = 35, lon = 139): ParsedOpenSkyAircraft {
  return {
    icao24: icao,
    callsign: null,
    latitude: lat,
    longitude: lon,
    baroAltitudeM: 5000,
    geoAltitudeM: null,
    velocityMs: 100,
    trueTrackDeg: 90,
    onGround: false,
    lastContact: 1,
    timePosition: 1,
  };
}

describe('liveTrafficLayerState', () => {
  it('mergeTrafficCache updates by icao24', () => {
    const now = 1000;
    const cache = mergeTrafficCache(new Map(), [ac('a1')], now);
    expect(cache.size).toBe(1);
    const updated = mergeTrafficCache(cache, [ac('a1', 36, 140)], now + 100);
    expect(updated.get('a1')!.aircraft.latitude).toBe(36);
    expect(updated.get('a1')!.lastSeenAtMs).toBe(now + 100);
  });

  it('pruneStaleTrafficCache removes old entries', () => {
    const now = 1_000_000;
    let cache = mergeTrafficCache(new Map(), [ac('old'), ac('new')], now - TRAFFIC_STALE_MAX_AGE_MS - 1);
    cache = mergeTrafficCache(cache, [ac('new')], now);
    const pruned = pruneStaleTrafficCache(cache, now);
    expect(pruned.has('old')).toBe(false);
    expect(pruned.has('new')).toBe(true);
  });

  it('capTrafficCache keeps most recently seen', () => {
    const now = 5000;
    let cache = new Map<string, { aircraft: ParsedOpenSkyAircraft; lastSeenAtMs: number }>();
    for (let i = 0; i < 10; i++) {
      cache = mergeTrafficCache(cache, [ac(`x${i}`)], now - i * 1000);
    }
    const capped = capTrafficCache(cache, 3);
    expect(capped.size).toBe(3);
    expect(capped.has('x0')).toBe(true);
    expect(capped.has('x9')).toBe(false);
  });

  it('formatTrafficAgeLabel shows minutes', () => {
    const now = 120_000;
    expect(
      formatTrafficAgeLabel({ lastSuccessAtMs: 60_000, lastFetchFailed: false, openSkyTimeSec: 1 }, now)
    ).toBe('1分前');
  });

  it('isTrafficLayerStale when fetch failed or age exceeds poll', () => {
    const now = 200_000;
    expect(
      isTrafficLayerStale({ lastSuccessAtMs: 0, lastFetchFailed: true, openSkyTimeSec: null }, 180_000, now)
    ).toBe(true);
    expect(
      isTrafficLayerStale({ lastSuccessAtMs: 50_000, lastFetchFailed: false, openSkyTimeSec: 1 }, 180_000, now)
    ).toBe(false);
    expect(
      isTrafficLayerStale({ lastSuccessAtMs: 10_000, lastFetchFailed: false, openSkyTimeSec: 1 }, 60_000, now)
    ).toBe(true);
  });
});
