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
const MIN_SCREEN_DELTA_PX_SQ = 16;

/** 機首（テクスチャ上向き）が画面内の (dx,dy) 方向を向く Cesium billboard rotation（時計回り rad） */
export function billboardRotationRadFromScreenDelta(dx: number, dy: number): number | null {
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return null;
  if (dx * dx + dy * dy < MIN_SCREEN_DELTA_PX_SQ) return null;
  const rad = Math.atan2(dx, -dy);
  return Number.isFinite(rad) ? rad : null;
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

function isWindowCoordValid(c: Cartesian2 | undefined): boolean {
  return c !== undefined && Number.isFinite(c.x) && Number.isFinite(c.y);
}

function sceneReadyForScreenBillboard(viewer: Viewer): boolean {
  if (viewer.isDestroyed()) return false;
  const canvas = viewer.scene?.canvas;
  if (!canvas || canvas.clientWidth < 1 || canvas.clientHeight < 1) return false;
  return true;
}

/** 無効時は null（前回の rotation を維持する） */
export function computeChaseScreenBillboardRotationRad(
  viewer: Viewer,
  position: SampledPositionProperty,
  when: JulianDate,
): number | null {
  if (!sceneReadyForScreenBillboard(viewer)) return null;
  const pos = position.getValue(when);
  if (!pos || !Number.isFinite(pos.x)) return null;
  const wAc = SceneTransforms.worldToWindowCoordinates(viewer.scene, pos, scratchWin0);
  const wCam = SceneTransforms.worldToWindowCoordinates(
    viewer.scene,
    viewer.camera.position,
    scratchWin1,
  );
  if (!isWindowCoordValid(wAc) || !isWindowCoordValid(wCam)) return null;
  const ac = wAc as Cartesian2;
  const cam = wCam as Cartesian2;
  return billboardRotationRadFromScreenDelta(ac.x - cam.x, ac.y - cam.y);
}
