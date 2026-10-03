import { Cartesian3, Cartographic, Matrix4, Transforms } from 'cesium';
import { describe, expect, it } from 'vitest';
import {
  applyPreviewAltitudeOffset,
  buildPlaybackPointsFromWaypoints,
  chaseCameraOffsetEnuMeters,
  feetToMeters,
  headingShortestDeltaDeg,
  interpolatePathByFraction,
  interpolatePlaybackAtTime,
  isChaseCameraOffsetBehindAndAbove,
  lerpHeadingDeg,
  smoothedPlaybackHeadingDeg,
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

  it('computes shortest heading delta across 359→0 wrap', () => {
    expect(headingShortestDeltaDeg(359, 1)).toBeCloseTo(2, 5);
    expect(headingShortestDeltaDeg(1, 359)).toBeCloseTo(-2, 5);
    expect(lerpHeadingDeg(359, 1, 0.5)).toBeCloseTo(0, 5);
  });

  it('smooths heading over blend window at leg turns', () => {
    const points = [
      { lon: 0, lat: 0, altFt: 5000, tSec: 0 },
      { lon: 0, lat: 1, altFt: 5000, tSec: 10 },
      { lon: 1, lat: 1, altFt: 5000, tSec: 20 },
    ];
    const beforeTurn = smoothedPlaybackHeadingDeg(points, 9.5, 3);
    expect(beforeTurn).toBeCloseTo(0, 1);
    const midTurn = smoothedPlaybackHeadingDeg(points, 10.5, 3);
    expect(midTurn).toBeGreaterThan(0);
    expect(midTurn).toBeLessThan(90);
    const afterTurn = smoothedPlaybackHeadingDeg(points, 20, 3);
    expect(afterTurn).toBeCloseTo(90, 1);
  });

  it('places chase offset behind and above for steep and mild UI pitch', () => {
    const steep = chaseCameraOffsetEnuMeters(90, 3000, -75);
    expect(isChaseCameraOffsetBehindAndAbove(90, steep)).toBe(true);
    expect(steep.up).toBeGreaterThan(2500);

    const mild = chaseCameraOffsetEnuMeters(0, 650, -18);
    expect(isChaseCameraOffsetBehindAndAbove(0, mild)).toBe(true);
    expect(mild.up).toBeGreaterThan(150);
    expect(mild.north).toBeLessThan(0);
  });

  it('chase world position is higher than target on the ellipsoid', () => {
    const targetAltM = feetToMeters(5000);
    const lon = 130.8067;
    const lat = 33.6381;
    const heading = 55;
    const offset = chaseCameraOffsetEnuMeters(heading, 3000, -75);
    const target = Cartesian3.fromDegrees(lon, lat, targetAltM);
    const enu = Transforms.eastNorthUpToFixedFrame(target);
    const camera = Matrix4.multiplyByPoint(
      enu,
      new Cartesian3(offset.east, offset.north, offset.up),
      new Cartesian3(),
    );
    const targetH = Cartographic.fromCartesian(target).height;
    const cameraH = Cartographic.fromCartesian(camera).height;
    expect(cameraH).toBeGreaterThan(targetH);
    expect(isChaseCameraOffsetBehindAndAbove(heading, offset)).toBe(true);
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
