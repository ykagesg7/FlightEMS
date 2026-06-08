import { useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import type { FlightPlan } from '../../../types';
import { fetchSwimNotams, type SwimNotamFetchOk } from '../../../services/swimNotam';
import {
  buildAirportNotamBriefingSnapshot,
  extractPreflightNotamTargets,
  notamTargetsCacheKey,
  type AirportNotamBriefingSnapshot,
  type PreflightAirportNotamTarget,
} from './preflightNotamBriefing';

const CACHE_TTL_MS = 3 * 60 * 1000;
const DEBOUNCE_MS = 600;

type AirportFetchState = {
  loading: boolean;
  error: string | null;
  data: SwimNotamFetchOk | null;
};

type CacheEntry = {
  fetchedAt: number;
  data: SwimNotamFetchOk;
};

const responseCache = new Map<string, CacheEntry>();

function cacheKeyForIcao(icao: string): string {
  return icao.trim().toUpperCase();
}

function readCache(icao: string): SwimNotamFetchOk | null {
  const entry = responseCache.get(cacheKeyForIcao(icao));
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) {
    responseCache.delete(cacheKeyForIcao(icao));
    return null;
  }
  return entry.data;
}

function writeCache(icao: string, data: SwimNotamFetchOk): void {
  responseCache.set(cacheKeyForIcao(icao), { fetchedAt: Date.now(), data });
}

async function fetchAirportNotam(icao: string): Promise<AirportFetchState> {
  const cached = readCache(icao);
  if (cached) {
    return { loading: false, error: null, data: cached };
  }
  const res = await fetchSwimNotams({ location: icao });
  if (!res.ok) {
    return { loading: false, error: res.error, data: null };
  }
  writeCache(icao, res);
  return { loading: false, error: null, data: res };
}

export type PreflightNotamBriefingResult = {
  targets: PreflightAirportNotamTarget[];
  snapshots: AirportNotamBriefingSnapshot[];
  loading: boolean;
  hasAnyError: boolean;
};

export function usePreflightNotamBriefing(flightPlan: FlightPlan): PreflightNotamBriefingResult {
  const targets = useMemo(() => extractPreflightNotamTargets(flightPlan), [flightPlan]);
  const cacheKey = useMemo(() => notamTargetsCacheKey(targets), [targets]);
  const [states, setStates] = useState<Record<string, AirportFetchState>>({});
  const lastFetchedKeyRef = useRef<string | null>(null);

  const load = useDebouncedCallback(async (key: string, list: PreflightAirportNotamTarget[]) => {
    if (list.length === 0) {
      setStates({});
      return;
    }

    const initial: Record<string, AirportFetchState> = {};
    for (const t of list) {
      const cached = readCache(t.icao);
      initial[t.icao] = cached
        ? { loading: false, error: null, data: cached }
        : { loading: true, error: null, data: null };
    }
    setStates(initial);

    const results = await Promise.all(
      list.map(async (t) => {
        const result = await fetchAirportNotam(t.icao);
        return { icao: t.icao, result };
      }),
    );

    if (lastFetchedKeyRef.current !== key) return;

    setStates((prev) => {
      const next = { ...prev };
      for (const { icao, result } of results) {
        next[icao] = result;
      }
      return next;
    });
  }, DEBOUNCE_MS);

  useEffect(() => {
    if (targets.length === 0) {
      lastFetchedKeyRef.current = null;
      setStates({});
      return;
    }
    if (lastFetchedKeyRef.current === cacheKey) return;
    lastFetchedKeyRef.current = cacheKey;
    void load(cacheKey, targets);
  }, [cacheKey, targets, load]);

  const snapshots = useMemo(
    () =>
      targets.map((target) =>
        buildAirportNotamBriefingSnapshot(target, states[target.icao] ?? {
          loading: true,
          error: null,
          data: null,
        }),
      ),
    [targets, states],
  );

  const loading = snapshots.some((s) => s.loading);
  const hasAnyError = snapshots.some((s) => s.error != null);

  return { targets, snapshots, loading, hasAnyError };
}
