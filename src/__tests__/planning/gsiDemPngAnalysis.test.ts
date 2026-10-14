import { describe, expect, it } from 'vitest';
import {
  gsiDemHeightGridIsOpenOceanWithoutNodata,
  isGsiDemNoDataRgb,
  normalizeGsiDemHeightMeters,
  sampleGsiDemHeightForTerrain,
} from '../../pages/planning/components/flight/flightViewer3d/gsiDemPngAnalysis';

describe('gsiDemPngAnalysis', () => {
  it('detects GSI nodata RGB', () => {
    expect(isGsiDemNoDataRgb(128, 0, 0)).toBe(true);
    expect(isGsiDemNoDataRgb(0, 0, 0)).toBe(false);
  });

  it('normalizes sea and nodata to 0m', () => {
    expect(normalizeGsiDemHeightMeters(0, true)).toBe(0);
    expect(normalizeGsiDemHeightMeters(-12, false)).toBe(0);
    expect(normalizeGsiDemHeightMeters(42, false)).toBe(42);
  });

  it('clamps low sea samples on mixed nodata tiles', () => {
    expect(sampleGsiDemHeightForTerrain(8, 0.5, 30, 40)).toBe(0);
    expect(sampleGsiDemHeightForTerrain(8, 0.1, 30, 28)).toBe(8);
    expect(sampleGsiDemHeightForTerrain(12.3, 0, 12.3, 42)).toBe(0);
    expect(sampleGsiDemHeightForTerrain(22, 0, 12.3, 42)).toBe(0);
    expect(sampleGsiDemHeightForTerrain(30, 0, 12.3, 42)).toBe(30);
    expect(sampleGsiDemHeightForTerrain(Number.NaN, 0.5, 0, 10)).toBe(0);
  });

  it('detects open-ocean tiles without nodata pixels', () => {
    const ocean = Array.from({ length: 8 }, () => [4.5, 12, 26]);
    expect(gsiDemHeightGridIsOpenOceanWithoutNodata(ocean)).toBe(true);
    const coastal = [[12, 43], [15, 40]];
    expect(gsiDemHeightGridIsOpenOceanWithoutNodata(coastal)).toBe(false);
  });
});
