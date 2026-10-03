import type { Planning3dViewerUiState } from './planning3dViewerUi';

export interface Waypoint3D {
  name: string;
  lat: number;
  lon: number;
  altFt: number;
  speedKts?: number;
}

export interface FlightViewer3DProps {
  waypoints: Waypoint3D[];
  initialMode?: 'gsi' | 'google';
  isProUser?: boolean;
  /** Planning ホスト／ポップアウト同期用。未指定時はコンポーネント内で状態を保持 */
  viewerUi?: Planning3dViewerUiState;
  onViewerUiChange?: (next: Planning3dViewerUiState) => void;
}

export type FlightImageryMode = 'gsi' | 'google';

export type FlightCameraMode = 'chase' | 'cockpit';

export type FlightPlaybackSpeed = 1 | 2 | 3;

/** 3D プレビューのカメラ調整（フライトプラン高度そのものは変更しない） */
export type FlightViewControls = {
  /** 3D プレビューで機体・カメラが使う高度（ft） */
  previewAltitudeFt: number;
  /** チェイスカメラの水平距離（m） */
  chaseDistanceM: number;
  /** チェイス／コックピットの俯角（度、負 = 下向き） */
  chasePitchDeg: number;
};

export const PREVIEW_ALTITUDE_STEP_FT = 500;

export function derivePlannedPreviewAltitudeFt(waypoints: Waypoint3D[]): number {
  if (waypoints.length === 0) return 3000;
  return Math.max(...waypoints.map((w) => w.altFt));
}

export function createFlightViewControls(waypoints: Waypoint3D[]): FlightViewControls {
  return {
    previewAltitudeFt: derivePlannedPreviewAltitudeFt(waypoints),
    chaseDistanceM: 650,
    chasePitchDeg: -18,
  };
}

/** @deprecated use createFlightViewControls(waypoints) */
export const DEFAULT_FLIGHT_VIEW_CONTROLS: FlightViewControls = {
  previewAltitudeFt: 3000,
  chaseDistanceM: 650,
  chasePitchDeg: -18,
};

/** コックピット視点の目線高度（機体位置からの ft） */
export const COCKPIT_EYE_OFFSET_FT = 8;

/** コックピット前方俯角（度）。チェイス用スライダーとは独立（負＝やや下向き） */
export const COCKPIT_LOOK_PITCH_DEG = -7;

/** 地形より下に目線が入らない最小クリアランス（m） */
export const COCKPIT_MIN_TERRAIN_CLEARANCE_M = 18;

/** ウェイポイント折れ点でカメラ方位を補間するシミュレーション時間（秒） */
export const COCKPIT_HEADING_BLEND_SEC = 3;
