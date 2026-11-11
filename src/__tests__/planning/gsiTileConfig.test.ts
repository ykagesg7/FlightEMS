import { describe, expect, it } from 'vitest';
import {
  GSI_DEM_PNG_MIN_LEVEL,
  GSI_RASTER_MAP_MIN_LEVEL,
  GSI_RASTER_MAP_MAX_LEVEL,
  GSI_PALE_MAP_URL,
  GSI_SEAMLESS_PHOTO_MIN_LEVEL,
  gsiSeamlessPhotoImageryOptions,
  shouldFetchGsiDemNetworkTile,
} from '../../pages/planning/components/flight/flightViewer3d/gsiTileConfig';

describe('gsiTileConfig', () => {
  it('skips network fetch for dem level 0 but allows higher levels', () => {
    expect(shouldFetchGsiDemNetworkTile(0)).toBe(false);
    expect(shouldFetchGsiDemNetworkTile(GSI_DEM_PNG_MIN_LEVEL)).toBe(true);
  });

  it('documents 2D pale map zoom 5–18 per GSI tile list', () => {
    expect(GSI_PALE_MAP_URL).toContain('/xyz/pale/');
    expect(GSI_RASTER_MAP_MIN_LEVEL).toBe(5);
    expect(GSI_RASTER_MAP_MAX_LEVEL).toBe(18);
  });

  it('sets seamlessphoto minimumLevel to GSI documented min zoom', () => {
    expect(gsiSeamlessPhotoImageryOptions.minimumLevel).toBe(GSI_SEAMLESS_PHOTO_MIN_LEVEL);
    expect(gsiSeamlessPhotoImageryOptions.minimumLevel).toBeGreaterThanOrEqual(2);
    expect(gsiSeamlessPhotoImageryOptions.rectangle).toBeDefined();
  });
});
