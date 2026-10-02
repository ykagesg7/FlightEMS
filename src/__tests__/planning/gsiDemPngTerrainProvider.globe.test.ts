import { describe, expect, it } from 'vitest';
import { GsiDemPngTerrainProvider } from '../../pages/planning/components/flight/flightViewer3d/gsiDemPngTerrainProvider';
import {
  GSI_DEM_PNG_MIN_LEVEL,
  shouldFetchGsiDemNetworkTile,
} from '../../pages/planning/components/flight/flightViewer3d/gsiTileConfig';

describe('GsiDemPngTerrainProvider globe tiling', () => {
  it('reports level 0 available so Cesium can build the root tile tree', () => {
    const provider = new GsiDemPngTerrainProvider();
    expect(provider.getTileDataAvailable(0, 0, 0)).toBe(true);
    expect(provider.getTileDataAvailable(0, 1, 0)).toBe(true);
  });

  it('does not use network fetch below GSI dem_png min zoom', () => {
    expect(shouldFetchGsiDemNetworkTile(0)).toBe(false);
    expect(shouldFetchGsiDemNetworkTile(GSI_DEM_PNG_MIN_LEVEL)).toBe(true);
  });
});
