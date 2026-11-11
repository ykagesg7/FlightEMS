import L from 'leaflet';
import {
  GSI_JAPAN_BOUNDS,
  GSI_PALE_MAP_URL,
  GSI_RASTER_MAP_MAX_LEVEL,
  GSI_RASTER_MAP_MIN_LEVEL,
  GSI_SEAMLESS_PHOTO_MAX_LEVEL,
  GSI_SEAMLESS_PHOTO_MIN_LEVEL,
  GSI_SEAMLESS_PHOTO_URL,
  GSI_TILE_ATTRIBUTION_JA,
} from '../flight/flightViewer3d/gsiTileConfig';

const GSI_JAPAN_LATLNG_BOUNDS = L.latLngBounds(
  [GSI_JAPAN_BOUNDS.south, GSI_JAPAN_BOUNDS.west],
  [GSI_JAPAN_BOUNDS.north, GSI_JAPAN_BOUNDS.east],
);

const GSI_COMMON_TILE_OPTIONS = {
  attribution: GSI_TILE_ATTRIBUTION_JA,
  /** 日本域タイルのみのため経度ラップを抑え、海外コピーへの 404 を防ぐ */
  noWrap: true,
} as const;

/** 2D 計画地図：淡色地図（ZL5–18）— 地理院タイル一覧 */
export function createGsiPaleMapTileLayer(): L.TileLayer {
  return L.tileLayer(GSI_PALE_MAP_URL, {
    ...GSI_COMMON_TILE_OPTIONS,
    minZoom: GSI_RASTER_MAP_MIN_LEVEL,
    maxZoom: GSI_RASTER_MAP_MAX_LEVEL,
    maxNativeZoom: GSI_RASTER_MAP_MAX_LEVEL,
  });
}

/** 2D 計画地図：シームレス写真（ZL2–18・jpg）— 3D と同じ URL */
export function createGsiSeamlessPhotoTileLayer(): L.TileLayer {
  return L.tileLayer(GSI_SEAMLESS_PHOTO_URL, {
    ...GSI_COMMON_TILE_OPTIONS,
    minZoom: GSI_SEAMLESS_PHOTO_MIN_LEVEL,
    maxZoom: GSI_SEAMLESS_PHOTO_MAX_LEVEL,
    maxNativeZoom: GSI_SEAMLESS_PHOTO_MAX_LEVEL,
    bounds: GSI_JAPAN_LATLNG_BOUNDS,
  });
}
