import { describe, expect, it } from 'vitest';
import {
  applyPreviewAltitudeOffset,
  buildPlaybackPointsFromWaypoints,
  chaseCameraHeadingPitchRange,
  feetToMeters,
  interpolatePathByFraction,
  interpolatePlaybackAtTime,
} from '../../pages/planning/components/flight/flightViewer3d/flightViewer3dMath';

describe('flightViewer3dMath', () => {
  it('converts feet to meters', () => {
    expect(feetToMeters(1000)).toBeCloseTo(304.8, 4);
    expect(feetToMeters(0)).toBe(0);
  });

  it('applies preview altitude offset without mutating plan altitude semantics', () => {
    expect(applyPreviewAltitudeOffset(3000, 0)).toBe(3000);
    expect(applyPreviewAltitudeOffset(3000, 500)).toBe(3500);
    expect(applyPreviewAltitudeOffset(1000, -200)).toBe(800);
  });

  it('builds playback with monotonic time', () => {
    const { points, totalSec } = buildPlaybackPointsFromWaypoints([
      { name: 'A', lat: 33, lon: 130, altFt: 1000 },
      { name: 'B', lat: 33.5, lon: 130.5, altFt: 2000 },
    ]);
    expect(points.length).toBeGreaterThan(2);
    expect(totalSec).toBeGreaterThan(0);
    for (let i = 1; i < points.length; i++) {
      expect(points[i]!.tSec).toBeGreaterThanOrEqual(points[i - 1]!.tSec);
    }
  });

  it('maps chase UI depression to positive Cesium lookAt pitch', () => {
    const steep = chaseCameraHeadingPitchRange(90, -75);
    expect(steep.pitchRad).toBeCloseTo((75 * Math.PI) / 180, 5);
    expect(steep.pitchRad).toBeGreaterThan(0);
    expect(steep.headingRad).toBeCloseTo((270 * Math.PI) / 180, 5);

    const mild = chaseCameraHeadingPitchRange(0, -18);
    expect(mild.pitchRad).toBeCloseTo((18 * Math.PI) / 180, 5);
    expect(mild.headingRad).toBeCloseTo(Math.PI, 5);
  });

  it('interpolates path fraction at endpoints', () => {
    const { points, totalSec } = buildPlaybackPointsFromWaypoints([
      { name: 'A', lat: 0, lon: 0, altFt: 0 },
      { name: 'B', lat: 1, lon: 1, altFt: 1000 },
    ]);
    const start = interpolatePlaybackAtTime(points, 0);
    const end = interpolatePlaybackAtTime(points, totalSec);
    expect(start.lat).toBeCloseTo(0, 5);
    expect(end.lat).toBeCloseTo(1, 5);
    const mid = interpolatePathByFraction(points, 0.5);
    expect(mid.altFt).toBeGreaterThan(0);
    expect(mid.altFt).toBeLessThan(1000);
  });
});
