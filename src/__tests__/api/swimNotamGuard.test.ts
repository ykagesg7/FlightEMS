import { describe, expect, it, beforeEach } from 'vitest';
import {
  __resetSwimNotamRateLimitForTests,
  checkSwimNotamRateLimit,
} from '../../../api/_lib/swimNotamRateLimit';
import {
  __clearSwimNotamSearchCacheForTests,
  readSwimNotamSearchCache,
  writeSwimNotamSearchCache,
} from '../../../api/_lib/swimNotamSearchResultCache';
import {
  __resetSwimLoginSessionForTests,
  readSwimLoginSession,
  writeSwimLoginSession,
} from '../../../api/_lib/swimNotamLoginSession';
import { buildSwimNotamQueryCacheKey } from '../../../api/_lib/swimNotamQueryCacheKey';

describe('swimNotam rate limit', () => {
  beforeEach(() => {
    __resetSwimNotamRateLimitForTests();
  });

  it('allows requests up to the per-minute cap', () => {
    const t0 = 1_000_000;
    for (let i = 0; i < 30; i++) {
      expect(checkSwimNotamRateLimit('test-client', t0 + i)).toEqual({ ok: true });
    }
    const blocked = checkSwimNotamRateLimit('test-client', t0 + 30);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    }
  });
});

describe('swimNotam search cache', () => {
  beforeEach(() => {
    __clearSwimNotamSearchCacheForTests();
  });

  it('returns cached ok results within TTL', () => {
    const key = 'RJTT||';
    const result = {
      ok: true as const,
      current: [],
      future: [],
      swimErrorCode: '0',
    };
    writeSwimNotamSearchCache(key, result, 0);
    expect(readSwimNotamSearchCache(key, 30_000)).toEqual(result);
    expect(readSwimNotamSearchCache(key, 61_000)).toBeNull();
  });
});

describe('swimNotam login session', () => {
  beforeEach(() => {
    __resetSwimLoginSessionForTests();
  });

  it('reuses cookie until TTL', () => {
    writeSwimLoginSession('session=abc', 0);
    expect(readSwimLoginSession(60_000)).toBe('session=abc');
    expect(readSwimLoginSession(8 * 60 * 1000 + 1)).toBeNull();
  });
});

describe('buildSwimNotamQueryCacheKey', () => {
  it('normalizes location to uppercase', () => {
    const key = buildSwimNotamQueryCacheKey({ location: 'rjtt' });
    expect(key).toContain('RJTT');
  });
});
