import { Cartesian3 } from 'cesium';
import { describe, expect, it } from 'vitest';
import { feetToMeters } from '../../pages/planning/components/flight/flightViewer3d/flightViewer3dMath';
import {
  cartographicHeight,
  chaseCameraWorldPositionFromTarget,
  expectedChaseCameraHeightGainM,
  trackHeadingToLocalLookDirection,
} from '../../pages/planning/components/flight/flightViewer3d/flightViewer3dChaseCamera';
import { chaseCameraOffsetEnuMeters, isChaseCameraOffsetBehindAndAbove } from '../../pages/planning/components/flight/flightViewer3d/flightViewer3dMath';

describe('flightViewer3dChaseCamera', () => {
  it('aligns cockpit look direction with track heading in local ENU', () => {
    const north = trackHeadingToLocalLookDirection(0, 0, new Cartesian3());
    expect(north.y).toBeGreaterThan(0.99);
    expect(Math.abs(north.z)).toBeLessThan(0.02);
    const east = trackHeadingToLocalLookDirection(90, 10, new Cartesian3());
    expect(east.x).toBeGreaterThan(0.9);
    expect(east.z).toBeLessThan(0);
  });

  it('places camera above target by range*sin(depression) for steep and mild chase', () => {
    const cases = [
      { rangeM: 3000, pitch: -75 },
      { rangeM: 650, pitch: -18 },
    ];
    for (const { rangeM, pitch } of cases) {
      const targetAltM = feetToMeters(5000);
      const target = Cartesian3.fromDegrees(130.8067, 33.6381, targetAltM);
      const camera = chaseCameraWorldPositionFromTarget(target, 55, rangeM, pitch);
      const gain = cartographicHeight(camera) - cartographicHeight(target);
      const expected = expectedChaseCameraHeightGainM(rangeM, pitch);
      expect(Math.abs(gain - expected)).toBeLessThan(2);
      const off = chaseCameraOffsetEnuMeters(55, rangeM, pitch);
      expect(isChaseCameraOffsetBehindAndAbove(55, off)).toBe(true);
    }
  });
});
