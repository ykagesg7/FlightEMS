import { describe, expect, it } from 'vitest';
import {
  countSimulatedDemNetworkAttempts,
  estimateRjttRouteDem404BeforeAfter,
  expandBarrenTileSubtree,
  OBSERVED_RJTT_PRODUCTION_DEM_404,
  RJTT_ROUTE_BARREN_DEM_SEEDS,
} from '../../pages/planning/components/flight/flightViewer3d/gsiDemFetchSimulation';

describe('gsiDemFetchSimulation', () => {
  it('documents RJTT before/after 404 estimates', () => {
    const est = estimateRjttRouteDem404BeforeAfter(15);
    expect(est.observedProductionBefore).toBe(OBSERVED_RJTT_PRODUCTION_DEM_404);
    expect(est.modeledAfterAttempts).toBeLessThanOrEqual(4);
    expect(est.modeledAfterWorstCaseSeeds).toBe(12);
    expect(est.theoreticalOldRefineUpperBound).toBeGreaterThan(est.observedProductionBefore);
  });

  it('stops refining after barren tile when configured', () => {
    const barrenKeys = expandBarrenTileSubtree(['5/29/12'], 8);
    const withRefine = countSimulatedDemNetworkAttempts({
      barrenKeys,
      maxLevel: 8,
      rootKeys: ['5/29/12'],
      refineAfterBarren: true,
      inheritParentBarren: false,
      dedupeFetches: true,
    });
    const withoutRefine = countSimulatedDemNetworkAttempts({
      barrenKeys,
      maxLevel: 8,
      rootKeys: ['5/29/12'],
      refineAfterBarren: false,
      inheritParentBarren: true,
      dedupeFetches: true,
    });
    expect(withRefine).toBeGreaterThan(withoutRefine);
    expect(withoutRefine).toBe(1);
  });

  it('covers production-reported seed keys', () => {
    expect(RJTT_ROUTE_BARREN_DEM_SEEDS).toContain('14/14557/6456');
    expect(RJTT_ROUTE_BARREN_DEM_SEEDS).toContain('15/29112/12917');
  });
});
