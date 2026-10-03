import { Cartesian3 } from 'cesium';
import { describe, expect, it } from 'vitest';
import { feetToMeters } from '../../pages/planning/components/flight/flightViewer3d/flightViewer3dMath';
import {
  cartographicHeight,
  chaseCameraWorldPositionFromTarget,
  expectedChaseCameraHeightGainM,
  cockpitLookDirectionEnu,
} from '../../pages/planning/components/flight/flightViewer3d/flightViewer3dChaseCamera';
import { chaseCameraOffsetEnuMeters, isChaseCameraOffsetBehindAndAbove } from '../../pages/planning/components/flight/flightViewer3d/flightViewer3dMath';

describe('flightViewer3dChaseCamera', () => {
  it('aims cockpit look vector along track with depression below horizon', () => {
    const north = cockpitLookDirectionEnu(0, -18);
    expect(north.north).toBeCloseTo(Math.cos((18 * Math.PI) / 180), 3);
    expect(north.up).toBeCloseTo(-Math.sin((18 * Math.PI) / 180), 3);
    expect(north.east).toBeCloseTo(0, 3);
    const east = cockpitLookDirectionEnu(90, -18);
    expect(east.east).toBeGreaterThan(0.9);
    expect(east.north).toBeCloseTo(0, 2);
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
