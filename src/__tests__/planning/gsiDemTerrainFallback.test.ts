import { describe, expect, it } from 'vitest';
import {
  gsiDemParentFallbackFetch,
  gsiDemSeaLevelAllowsChildRefinement,
  gsiDemUpsampleShiftFromParent,
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
});
