import { describe, expect, it } from 'vitest';
import {
  gsiDemExtractChildQuadrant,
  gsiDemHeightsLookLikeSea,
  gsiDemParentFallbackFetch,
  gsiDemSeaLevelAllowsChildRefinement,
  gsiDemUpsampleShiftFromParent,
  resolveGsiDemFetchTile,
} from '../../pages/planning/components/flight/flightViewer3d/gsiDemTerrainFallback';

describe('gsiDemTerrainFallback', () => {
  it('allows child refinement for sea-level tiles below max zoom', () => {
    expect(gsiDemSeaLevelAllowsChildRefinement(14)).toBe(true);
    expect(gsiDemSeaLevelAllowsChildRefinement(15)).toBe(false);
  });

  it('computes parent fetch coordinates', () => {
    expect(gsiDemParentFallbackFetch(14, 14557, 6456)).toEqual({
      parentLevel: 13,
      parentX: 7278,
      parentY: 3228,
    });
    expect(gsiDemParentFallbackFetch(1, 0, 0)).toBeNull();
  });

  it('adjusts upsample shift for child quadrant within parent', () => {
    const left = gsiDemUpsampleShiftFromParent(10, 20, 2, 0.25, 0.5);
    expect(left.shift).toBe(3);
    expect(left.shiftX).toBeCloseTo(0.125, 5);
    expect(left.shiftY).toBeCloseTo(0.25, 5);

    const right = gsiDemUpsampleShiftFromParent(11, 21, 2, 0.25, 0.5);
    expect(right.shiftX).toBeCloseTo(0.625, 5);
    expect(right.shiftY).toBeCloseTo(0.75, 5);
  });

  it('extracts the correct child quadrant from a parent height grid', () => {
    const parent: number[][] = [
      [0, 0, 100, 100],
      [0, 0, 100, 100],
      [0, 0, 100, 100],
      [0, 0, 100, 100],
    ];
    const topLeft = gsiDemExtractChildQuadrant(parent, 10, 20);
    expect(topLeft).toEqual([[0, 0], [0, 0]]);
    const bottomRight = gsiDemExtractChildQuadrant(parent, 11, 21);
    expect(bottomRight).toEqual([[100, 100], [100, 100]]);
  });

  it('detects sea-like height fields', () => {
    const sea = Array.from({ length: 4 }, () => [0, 0.5, -0.5, 0]);
    expect(gsiDemHeightsLookLikeSea(sea)).toBe(true);
    const land = [[0, 0], [0, 50]];
    expect(gsiDemHeightsLookLikeSea(land)).toBe(false);
  });

  it('resolves fetch tile coordinates consistently for high display levels', () => {
    const fetch = resolveGsiDemFetchTile(29114, 12912, 18);
    expect(fetch.fetchLevel).toBeLessThanOrEqual(15);
    expect(fetch.shift).toBeGreaterThan(0);
  });
});
