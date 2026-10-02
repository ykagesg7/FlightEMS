import { describe, expect, it, beforeEach } from 'vitest';
import {
  GsiDemTileCache,
  gsiDemParentKey,
  gsiDemTileKey,
  resetSharedGsiDemTileCacheForTests,
} from '../../pages/planning/components/flight/flightViewer3d/gsiDemTileCache';

describe('GsiDemTileCache', () => {
  beforeEach(() => {
    resetSharedGsiDemTileCacheForTests();
  });

  it('inherits barren status from parent without refetching child', () => {
    const cache = new GsiDemTileCache();
    cache.set(5, 29, 12, 'missing');
    expect(cache.shouldSkipNetworkFetch(6, 58, 24)).toBe('missing');
    expect(cache.shouldSkipNetworkFetch(6, 59, 24)).toBe('missing');
  });

  it('does not inherit when parent has elevation data', () => {
    const cache = new GsiDemTileCache();
    cache.set(13, 7278, 3230, 'elevated');
    expect(cache.shouldSkipNetworkFetch(14, 14556, 6460)).toBeNull();
  });

  it('builds stable tile keys', () => {
    expect(gsiDemTileKey(14, 14557, 6456)).toBe('14/14557/6456');
    expect(gsiDemParentKey(14, 14557, 6456)).toBe('13/7278/3228');
  });
});
