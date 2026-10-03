import { Cartesian2, Cartesian3, SceneTransforms, type Scene } from 'cesium';

/** Cesium が worldToWindow 内で normalize 失敗するのを避ける最小カメラ距離（m） */
export const MIN_CAMERA_WORLD_DISTANCE_M = 1;

export function isFiniteCartesian3(c: Cartesian3 | undefined | null): boolean {
  if (!c) return false;
  return Number.isFinite(c.x) && Number.isFinite(c.y) && Number.isFinite(c.z);
}

export function sceneCameraReadyForProject(scene: Scene): boolean {
  const canvas = scene.canvas;
  if (!canvas || canvas.clientWidth < 1 || canvas.clientHeight < 1) return false;
  const camera = scene.camera;
  if (!isFiniteCartesian3(camera.positionWC)) return false;
  if (!isFiniteCartesian3(camera.directionWC)) return false;
  const frameState = (scene as Scene & { frameState?: unknown }).frameState;
  if (!frameState) return false;
  return true;
}

export function distanceFromCameraMeters(scene: Scene, worldPosition: Cartesian3): number | null {
  if (!isFiniteCartesian3(worldPosition)) return null;
  const cam = scene.camera.positionWC;
  if (!isFiniteCartesian3(cam)) return null;
  const d = Cartesian3.distance(worldPosition, cam);
  return Number.isFinite(d) ? d : null;
}

/**
 * SceneTransforms.worldToWindowCoordinates は内部で normalize し、
 * カメラと同一点・未初期化 frustum 等で DeveloperError を投げる。
 */
export function tryWorldToWindowCoordinates(
  scene: Scene,
  worldPosition: Cartesian3,
  result?: Cartesian2,
): Cartesian2 | undefined {
  if (!sceneCameraReadyForProject(scene)) return undefined;
  if (!isFiniteCartesian3(worldPosition)) return undefined;
  const dist = distanceFromCameraMeters(scene, worldPosition);
  if (dist === null || dist < MIN_CAMERA_WORLD_DISTANCE_M) return undefined;
  try {
    const out = SceneTransforms.worldToWindowCoordinates(scene, worldPosition, result);
    if (out && Number.isFinite(out.x) && Number.isFinite(out.y)) return out;
    return undefined;
  } catch {
    return undefined;
  }
}
