import { describe, expect, it } from 'vitest';
import {
  GSI_DEM_PNG_MIN_LEVEL,
  GSI_SEAMLESS_PHOTO_MIN_LEVEL,
  gsiSeamlessPhotoImageryOptions,
  shouldFetchGsiDemNetworkTile,
} from '../../pages/planning/components/flight/flightViewer3d/gsiTileConfig';

describe('gsiTileConfig', () => {
  it('skips network fetch for dem level 0 but allows higher levels', () => {
    expect(shouldFetchGsiDemNetworkTile(0)).toBe(false);
    expect(shouldFetchGsiDemNetworkTile(GSI_DEM_PNG_MIN_LEVEL)).toBe(true);
  });

  it('sets seamlessphoto minimumLevel to GSI documented min zoom', () => {
    expect(gsiSeamlessPhotoImageryOptions.minimumLevel).toBe(GSI_SEAMLESS_PHOTO_MIN_LEVEL);
    expect(gsiSeamlessPhotoImageryOptions.minimumLevel).toBeGreaterThanOrEqual(2);
    expect(gsiSeamlessPhotoImageryOptions.rectangle).toBeDefined();
  });
});
