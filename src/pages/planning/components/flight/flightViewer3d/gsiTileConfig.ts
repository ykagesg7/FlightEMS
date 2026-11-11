import { Rectangle } from 'cesium';

/** 地理院 dem_png（標高タイル PNG）— 全球 z0 は未提供 */
export const GSI_DEM_PNG_MIN_LEVEL = 1;
export const GSI_DEM_PNG_MAX_LEVEL = 14;
export const GSI_DEM5A_MAX_LEVEL = 15;

/** 教育用 3D プレビュー — dem5a z15 まで取りに行かず z14 で十分 */
export const GSI_PREVIEW_MAX_FETCH_LEVEL = GSI_DEM_PNG_MAX_LEVEL;

/**
 * 淡色地図（2D ベース）— 地理院タイル一覧（標準／淡色 ZL5〜18）
 * @see https://maps.gsi.go.jp/development/ichiran.html
 */
export const GSI_PALE_MAP_URL = 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png';
export const GSI_RASTER_MAP_MIN_LEVEL = 5;
export const GSI_RASTER_MAP_MAX_LEVEL = 18;

/** 全国最新写真（シームレス）— maps.gsi.go.jp layers1.txt minZoom 2 */
export const GSI_SEAMLESS_PHOTO_URL =
  'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg';
export const GSI_SEAMLESS_PHOTO_MIN_LEVEL = 2;
export const GSI_SEAMLESS_PHOTO_MAX_LEVEL = 18;

/** Leaflet／Cesium 共通の出典表記（地理院コンテンツ利用規約） */
export const GSI_TILE_ATTRIBUTION_JA = '出典：国土地理院';

/** 日本域おおよそ（低ズームの海外タイル要求を抑える） */
export const GSI_JAPAN_IMAGERY_RECTANGLE = Rectangle.fromDegrees(122.0, 20.0, 154.0, 46.5);

/** Leaflet 用（Cesium Rectangle に依存しない） */
export const GSI_JAPAN_BOUNDS = {
  south: 20.0,
  west: 122.0,
  north: 46.5,
  east: 154.0,
} as const;

export function shouldFetchGsiDemNetworkTile(level: number): boolean {
  return level >= GSI_DEM_PNG_MIN_LEVEL && level <= GSI_DEM5A_MAX_LEVEL;
}

/** @deprecated use shouldFetchGsiDemNetworkTile — kept for tests/docs migration */
export function isGsiDemTerrainLevelAvailable(level: number): boolean {
  return shouldFetchGsiDemNetworkTile(level);
}

export const gsiSeamlessPhotoImageryOptions = {
  url: GSI_SEAMLESS_PHOTO_URL,
  credit: '国土地理院',
  minimumLevel: GSI_SEAMLESS_PHOTO_MIN_LEVEL,
  maximumLevel: GSI_SEAMLESS_PHOTO_MAX_LEVEL,
  rectangle: GSI_JAPAN_IMAGERY_RECTANGLE,
} as const;
