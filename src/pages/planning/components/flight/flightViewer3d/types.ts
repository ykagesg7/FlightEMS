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
}

export type FlightImageryMode = 'gsi' | 'google';

export type FlightCameraMode = 'chase' | 'cockpit';

/** 3D プレビューのカメラ調整（フライトプラン高度そのものは変更しない） */
export type FlightViewControls = {
  /** カメラ追従高度に加算する ft（-500…2000 想定） */
  altitudeOffsetFt: number;
  /** チェイスカメラの水平距離（m） */
  chaseDistanceM: number;
  /** チェイス／コックピットの俯角（度、負 = 下向き） */
  chasePitchDeg: number;
};

export const DEFAULT_FLIGHT_VIEW_CONTROLS: FlightViewControls = {
  altitudeOffsetFt: 0,
  chaseDistanceM: 650,
  chasePitchDeg: -18,
};

/** コックピット視点の目線高度（機体位置からの ft） */
export const COCKPIT_EYE_OFFSET_FT = 8;

/** ウェイポイント折れ点でカメラ方位を補間するシミュレーション時間（秒） */
export const COCKPIT_HEADING_BLEND_SEC = 3;
