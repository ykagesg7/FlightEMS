import { describe, expect, it } from 'vitest';
import {
  buildLatLonGrid,
  nearestWindGridPoint,
  quantizeBoundsForWindGridCache,
} from '../../utils/windGridOpenMeteo';

describe('windGridOpenMeteo', () => {
  it('buildLatLonGrid returns n*n points', () => {
    const g = buildLatLonGrid(33, 129, 35, 131, 3);
    expect(g).toHaveLength(9);
    expect(g[0]).toEqual({ lat: 33, lon: 129 });
  });

  it('quantizeBoundsForWindGridCache snaps to step grid', () => {
    const q = quantizeBoundsForWindGridCache(33.07, 129.11, 35.02, 131.09, 0.2);
    expect(q.south).toBeCloseTo(33, 10);
    expect(q.west).toBeCloseTo(129, 10);
    expect(q.north).toBeCloseTo(35.2, 10);
    expect(q.east).toBeCloseTo(131.2, 10);
  });

  it('nearestWindGridPoint picks closest cell', () => {
    const pts = [
      { lat: 0, lon: 0, windFromDeg: 0, speedKt: 10 },
      { lat: 10, lon: 10, windFromDeg: 90, speedKt: 20 },
    ];
    const n = nearestWindGridPoint(1, 1, pts);
    expect(n?.lat).toBe(0);
    expect(n?.windFromDeg).toBe(0);
  });
});
