import {
  Cartesian3,
  Cartesian4,
  Cartographic,
  Math as CesiumMath,
  Matrix4,
  Transforms,
  type Viewer,
} from 'cesium';
import { AIRCRAFT_YAW_OFFSET_DEG } from '../../../../explore/airspace3d/aircraftIcon';
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

/** コックピット視線（target 基準 ENU 単位ベクトル）。UI 俯角は負＝下向き。 */
export function cockpitLookDirectionEnu(
  trackHeadingDeg: number,
  chasePitchDeg: number,
): { east: number; north: number; up: number } {
  const depressionRad = Math.min(
    (89 * Math.PI) / 180,
    Math.max((1 * Math.PI) / 180, (Math.abs(chasePitchDeg) * Math.PI) / 180),
  );
  const h = (trackHeadingDeg * Math.PI) / 180;
  const cosP = Math.cos(depressionRad);
  const sinP = Math.sin(depressionRad);
  return {
    east: Math.sin(h) * cosP,
    north: Math.cos(h) * cosP,
    up: -sinP,
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
  const destination = Cartesian3.fromDegrees(lon, lat, altMeters);
  const depressionDeg = Math.min(89, Math.max(1, Math.abs(chasePitchDeg)));
  viewer.camera.lookAtTransform(Matrix4.IDENTITY);
  viewer.camera.setView({
    destination,
    orientation: {
      heading: CesiumMath.toRadians(trackHeadingDeg + AIRCRAFT_YAW_OFFSET_DEG),
      pitch: CesiumMath.toRadians(-depressionDeg),
      roll: 0,
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
  if (Cartesian3.magnitude(scratchSubtract) < 1e-4) return;
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
