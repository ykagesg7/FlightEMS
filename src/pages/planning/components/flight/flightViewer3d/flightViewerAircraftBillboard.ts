import {
  Cartesian2,
  Cartesian3,
  JulianDate,
  Math as CesiumMath,
  Matrix4,
  SceneTransforms,
  Transforms,
  type SampledPositionProperty,
  type Viewer,
} from 'cesium';
const scratchEnu = new Matrix4();
const scratchAhead = new Cartesian3();
const scratchWin0 = new Cartesian2();
const scratchWin1 = new Cartesian2();

const TRACK_AHEAD_METERS = 120;

/** 機首（テクスチャ上向き）が画面内の (dx,dy) 方向を向く Cesium billboard rotation（時計回り rad） */
export function billboardRotationRadFromScreenDelta(dx: number, dy: number): number {
  if (dx * dx + dy * dy < 4) return 0;
  return Math.atan2(dx, -dy);
}

export function worldPositionAheadOf(
  position: Cartesian3,
  trackHeadingDeg: number,
  aheadM = TRACK_AHEAD_METERS,
): Cartesian3 {
  const h = CesiumMath.toRadians(trackHeadingDeg);
  const enu = Transforms.eastNorthUpToFixedFrame(position, undefined, scratchEnu);
  const local = new Cartesian3(Math.sin(h) * aheadM, Math.cos(h) * aheadM, 0);
  return Matrix4.multiplyByPoint(enu, local, scratchAhead);
}

export function computeChaseScreenBillboardRotationRad(
  viewer: Viewer,
  position: SampledPositionProperty,
  when: JulianDate,
): number {
  if (viewer.isDestroyed()) return 0;
  const pos = position.getValue(when);
  if (!pos) return 0;
  const wAc = SceneTransforms.worldToWindowCoordinates(viewer.scene, pos, scratchWin0);
  const wCam = SceneTransforms.worldToWindowCoordinates(
    viewer.scene,
    viewer.camera.position,
    scratchWin1,
  );
  if (!wAc || !wCam) return 0;
  const rad = billboardRotationRadFromScreenDelta(wAc.x - wCam.x, wAc.y - wCam.y);
  return Number.isFinite(rad) ? rad : 0;
}
