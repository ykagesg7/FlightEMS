import type { SwimNotamSearchResult } from './swimNotamCore';

const CACHE_TTL_MS = 60_000;

type CacheEntry = {
  result: SwimNotamSearchResult;
  expiresAtMs: number;
};

const cache = new Map<string, CacheEntry>();

export function swimNotamCacheKey(rawKey: string): string {
  return rawKey;
}

export function readSwimNotamSearchCache(
  key: string,
  nowMs = Date.now(),
): SwimNotamSearchResult | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAtMs <= nowMs) {
    cache.delete(key);
    return null;
  }
  return entry.result;
}

export function writeSwimNotamSearchCache(
  key: string,
  result: SwimNotamSearchResult,
  nowMs = Date.now(),
): void {
  if (result.ok !== true) return;
  cache.set(key, { result, expiresAtMs: nowMs + CACHE_TTL_MS });
}

export function __clearSwimNotamSearchCacheForTests(): void {
  cache.clear();
}
