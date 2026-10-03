import { Cartesian3 } from 'cesium';
import { describe, expect, it } from 'vitest';
import { feetToMeters } from '../../pages/planning/components/flight/flightViewer3d/flightViewer3dMath';
import {
  cartographicHeight,
  chaseCameraWorldPositionFromTarget,
  expectedChaseCameraHeightGainM,
  cockpitCameraOrientation,
} from '../../pages/planning/components/flight/flightViewer3d/flightViewer3dChaseCamera';
import { chaseCameraOffsetEnuMeters, isChaseCameraOffsetBehindAndAbove } from '../../pages/planning/components/flight/flightViewer3d/flightViewer3dMath';

describe('flightViewer3dChaseCamera', () => {
  it('maps cockpit UI depression to negative Cesium setView pitch', () => {
    const o = cockpitCameraOrientation(120, -18);
    expect(o.pitch).toBeCloseTo((-18 * Math.PI) / 180, 5);
    expect(o.heading).toBeCloseTo((120 * Math.PI) / 180, 5);
    expect(o.roll).toBe(0);
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
