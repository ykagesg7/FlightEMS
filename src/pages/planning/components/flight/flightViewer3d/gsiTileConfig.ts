import { Rectangle } from 'cesium';

/** 地理院 dem_png（標高タイル PNG）— 全球 z0 は未提供 */
export const GSI_DEM_PNG_MIN_LEVEL = 1;
export const GSI_DEM_PNG_MAX_LEVEL = 14;
export const GSI_DEM5A_MAX_LEVEL = 15;

/** 全国最新写真（シームレス）— maps.gsi.go.jp layers1.txt minZoom 2 */
export const GSI_SEAMLESS_PHOTO_URL =
  'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg';
export const GSI_SEAMLESS_PHOTO_MIN_LEVEL = 2;
export const GSI_SEAMLESS_PHOTO_MAX_LEVEL = 18;

/** 日本域おおよそ（低ズームの海外タイル要求を抑える） */
export const GSI_JAPAN_IMAGERY_RECTANGLE = Rectangle.fromDegrees(122.0, 20.0, 154.0, 46.5);

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
