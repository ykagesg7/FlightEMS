import { describe, expect, it } from 'vitest';
import {
  imageDataIsAllGsiDemNoData,
  isGsiDemNoDataRgb,
} from '../../pages/planning/components/flight/flightViewer3d/gsiDemPngAnalysis';

describe('gsiDemPngAnalysis', () => {
  it('detects GSI invalid RGB', () => {
    expect(isGsiDemNoDataRgb(128, 0, 0)).toBe(true);
    expect(isGsiDemNoDataRgb(127, 0, 0)).toBe(false);
  });

  it('detects all-no-data image', () => {
    const data = new Uint8ClampedArray(256 * 256 * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 128;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }
    expect(imageDataIsAllGsiDemNoData(data, 256, 256)).toBe(true);
    data[0] = 100;
    expect(imageDataIsAllGsiDemNoData(data, 256, 256)).toBe(false);
  });
});
