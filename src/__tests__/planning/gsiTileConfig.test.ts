import { describe, expect, it } from 'vitest';
import {
  GSI_DEM_PNG_MIN_LEVEL,
  GSI_SEAMLESS_PHOTO_MIN_LEVEL,
  gsiSeamlessPhotoImageryOptions,
  isGsiDemTerrainLevelAvailable,
} from '../../pages/planning/components/flight/flightViewer3d/gsiTileConfig';

describe('gsiTileConfig', () => {
  it('marks GSI dem level 0 unavailable (avoids global 404 tiles)', () => {
    expect(isGsiDemTerrainLevelAvailable(0)).toBe(false);
    expect(isGsiDemTerrainLevelAvailable(GSI_DEM_PNG_MIN_LEVEL)).toBe(true);
  });

  it('sets seamlessphoto minimumLevel to GSI documented min zoom', () => {
    expect(gsiSeamlessPhotoImageryOptions.minimumLevel).toBe(GSI_SEAMLESS_PHOTO_MIN_LEVEL);
    expect(gsiSeamlessPhotoImageryOptions.minimumLevel).toBeGreaterThanOrEqual(2);
    expect(gsiSeamlessPhotoImageryOptions.rectangle).toBeDefined();
  });
});
