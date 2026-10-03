import { Cartesian3 } from 'cesium';
import { describe, expect, it } from 'vitest';
import {
  isFiniteCartesian3,
  MIN_CAMERA_WORLD_DISTANCE_M,
} from '../../pages/planning/components/flight/flightViewer3d/safeSceneWindowCoordinates';

describe('safeSceneWindowCoordinates', () => {
  it('rejects non-finite cartesian', () => {
    expect(isFiniteCartesian3(Cartesian3.fromDegrees(130, 33, 1000))).toBe(true);
    expect(isFiniteCartesian3(new Cartesian3(Number.NaN, 0, 0))).toBe(false);
    expect(isFiniteCartesian3(null)).toBe(false);
  });

  it('documents minimum camera distance constant', () => {
    expect(MIN_CAMERA_WORLD_DISTANCE_M).toBeGreaterThanOrEqual(1);
  });
});
