import {
  Cartesian3,
  Cartesian4,
  Cartographic,
  Matrix4,
  Transforms,
  type Viewer,
} from 'cesium';
import { chaseCameraOffsetEnuMeters } from './flightViewer3dMath';

const scratchSubtract = new Cartesian3();
const scratchDirection = new Cartesian3();
const scratchUp = new Cartesian3();
const scratchEnu = new Matrix4();
const scratchColumn = new Cartesian4();

export function chaseCameraWorldPositionFromTarget(
  target: Cartesian3,
  trackHeadingDeg: number,
  rangeM: number,
  chasePitchDeg: number,
  result = new Cartesian3(),
): Cartesian3 {
  const off = chaseCameraOffsetEnuMeters(trackHeadingDeg, rangeM, chasePitchDeg);
  const enu = Transforms.eastNorthUpToFixedFrame(target, undefined, scratchEnu);
  return Matrix4.multiplyByPoint(enu, new Cartesian3(off.east, off.north, off.up), result);
}

export function expectedChaseCameraHeightGainM(rangeM: number, chasePitchDeg: number): number {
  const depressionRad = Math.min(
    (89 * Math.PI) / 180,
    Math.max((1 * Math.PI) / 180, (Math.abs(chasePitchDeg) * Math.PI) / 180),
  );
  return rangeM * Math.sin(depressionRad);
}

/** コックピット setView 用（俯角 UI は負値、Cesium pitch も負＝地平線より下） */
export function cockpitCameraOrientation(
  trackHeadingDeg: number,
  chasePitchDeg: number,
): { heading: number; pitch: number; roll: number } {
  const depressionDeg = Math.min(89, Math.max(1, Math.abs(chasePitchDeg)));
  const degToRad = (d: number) => (d * Math.PI) / 180;
  return {
    heading: degToRad(trackHeadingDeg),
    pitch: degToRad(-depressionDeg),
    roll: 0,
  };
}

export function setCockpitCameraView(
  viewer: Viewer,
  lon: number,
  lat: number,
  altMeters: number,
  trackHeadingDeg: number,
  chasePitchDeg: number,
): void {
  const orient = cockpitCameraOrientation(trackHeadingDeg, chasePitchDeg);
  viewer.camera.setView({
    destination: Cartesian3.fromDegrees(lon, lat, altMeters),
    orientation: orient,
  });
}

export function setChaseCameraFollowingTarget(
  viewer: Viewer,
  target: Cartesian3,
  trackHeadingDeg: number,
  rangeM: number,
  chasePitchDeg: number,
): void {
  const eye = chaseCameraWorldPositionFromTarget(
    target,
    trackHeadingDeg,
    rangeM,
    chasePitchDeg,
    new Cartesian3(),
  );
  Cartesian3.subtract(target, eye, scratchSubtract);
  Cartesian3.normalize(scratchSubtract, scratchDirection);
  const enu = Transforms.eastNorthUpToFixedFrame(eye, undefined, scratchEnu);
  Matrix4.getColumn(enu, 2, scratchColumn);
  Cartesian3.fromCartesian4(scratchColumn, scratchUp);
  Cartesian3.normalize(scratchUp, scratchUp);
  viewer.camera.setView({
    destination: eye,
    orientation: {
      direction: scratchDirection,
      up: scratchUp,
    },
  });
}

export function cartographicHeight(cartesian: Cartesian3): number {
  return Cartographic.fromCartesian(cartesian).height;
}
