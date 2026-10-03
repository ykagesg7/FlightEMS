import { describe, expect, it } from 'vitest';
import { billboardRotationRadFromScreenDelta } from '../../pages/planning/components/flight/flightViewer3d/flightViewerAircraftBillboard';

describe('flightViewerAircraftBillboard', () => {
  it('maps screen-up track to zero rotation (nose up)', () => {
    expect(billboardRotationRadFromScreenDelta(0, -100)).toBeCloseTo(0, 5);
  });

  it('maps screen-right track to +90deg clockwise', () => {
    expect(billboardRotationRadFromScreenDelta(100, 0)).toBeCloseTo(Math.PI / 2, 5);
  });

  it('returns null for tiny or non-finite deltas', () => {
    expect(billboardRotationRadFromScreenDelta(0, 0)).toBeNull();
    expect(billboardRotationRadFromScreenDelta(Number.NaN, 1)).toBeNull();
  });
});
