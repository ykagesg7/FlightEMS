import {
  Cartesian3,
  Cartesian4,
  Cartographic,
  Matrix3,
  Matrix4,
  Transforms,
  type Viewer,
} from 'cesium';
import { chaseCameraOffsetEnuMeters } from './flightViewer3dMath';

const scratchSubtract = new Cartesian3();
const scratchDirection = new Cartesian3();
const scratchUp = new Cartesian3();
const scratchEnu = new Matrix4();
const scratchRotation = new Matrix3();
const scratchWorldDir = new Cartesian3();
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

/** コックピット／チェイス共通: 真方位（度）から ENU 先方向（俯角は正の下向き度） */
export function trackHeadingToLocalLookDirection(
  trackHeadingDeg: number,
  depressionDeg: number,
  result = new Cartesian3(),
): Cartesian3 {
  const h = (trackHeadingDeg * Math.PI) / 180;
  const dep = (Math.max(1, Math.min(89, depressionDeg)) * Math.PI) / 180;
  result.x = Math.sin(h) * Math.cos(dep);
  result.y = Math.cos(h) * Math.cos(dep);
  result.z = -Math.sin(dep);
  return Cartesian3.normalize(result, result);
}

export function applyCameraViewAtEye(
  viewer: Viewer,
  eye: Cartesian3,
  localEnuLookDirection: Cartesian3,
): void {
  const enu = Transforms.eastNorthUpToFixedFrame(eye, undefined, scratchEnu);
  Matrix4.getMatrix3(enu, scratchRotation);
  Matrix3.multiplyByVector(scratchRotation, localEnuLookDirection, scratchWorldDir);
  Cartesian3.normalize(scratchWorldDir, scratchDirection);
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
