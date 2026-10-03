import {
  Cartesian3,
  Cartesian4,
  Cartographic,
  Matrix4,
  Transforms,
  type Viewer,
} from 'cesium';
import {
  COCKPIT_EYE_OFFSET_FT,
  COCKPIT_LOOK_PITCH_DEG,
  COCKPIT_MIN_TERRAIN_CLEARANCE_M,
} from './types';
import { chaseCameraOffsetEnuMeters, feetToMeters } from './flightViewer3dMath';

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

function cockpitEyeHeightMeters(
  viewer: Viewer,
  lon: number,
  lat: number,
  altMeters: number,
): number {
  const eyeM = altMeters + feetToMeters(COCKPIT_EYE_OFFSET_FT);
  const carto = Cartographic.fromDegrees(lon, lat);
  const terrainH = viewer.scene.globe.getHeight(carto);
  if (terrainH !== undefined && Number.isFinite(terrainH)) {
    return Math.max(eyeM, terrainH + COCKPIT_MIN_TERRAIN_CLEARANCE_M);
  }
  return eyeM;
}

export function setCockpitCameraView(
  viewer: Viewer,
  lon: number,
  lat: number,
  altMeters: number,
  trackHeadingDeg: number,
): void {
  const eyeAlt = cockpitEyeHeightMeters(viewer, lon, lat, altMeters);
  const eye = Cartesian3.fromDegrees(lon, lat, eyeAlt);
  const pitchDeg = Math.min(-1, Math.max(-12, COCKPIT_LOOK_PITCH_DEG));
  const headingDeg = Number.isFinite(trackHeadingDeg) ? trackHeadingDeg : 0;
  const lookEnu = cockpitLookDirectionEnu(headingDeg, pitchDeg);
  const enu = Transforms.eastNorthUpToFixedFrame(eye, undefined, scratchEnu);
  const dirLocal = new Cartesian3(lookEnu.east, lookEnu.north, lookEnu.up);
  Matrix4.multiplyByPointAsVector(enu, dirLocal, scratchDirection);
  if (Cartesian3.magnitude(scratchDirection) < 1e-6) return;
  Cartesian3.normalize(scratchDirection, scratchDirection);
  Matrix4.getColumn(enu, 2, scratchColumn);
  Cartesian3.fromCartesian4(scratchColumn, scratchUp);
  if (Cartesian3.magnitude(scratchUp) < 1e-6) return;
  Cartesian3.normalize(scratchUp, scratchUp);
  viewer.camera.lookAtTransform(Matrix4.IDENTITY);
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
  if (Cartesian3.magnitude(scratchSubtract) < 1e-4) return;
  Cartesian3.normalize(scratchSubtract, scratchDirection);
  const enu = Transforms.eastNorthUpToFixedFrame(eye, undefined, scratchEnu);
  Matrix4.getColumn(enu, 2, scratchColumn);
  Cartesian3.fromCartesian4(scratchColumn, scratchUp);
  if (Cartesian3.magnitude(scratchUp) < 1e-6) return;
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
