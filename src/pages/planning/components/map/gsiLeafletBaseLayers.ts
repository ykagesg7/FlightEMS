import L from 'leaflet';
import {
  GSI_JAPAN_IMAGERY_RECTANGLE,
  GSI_PALE_MAP_URL,
  GSI_RASTER_MAP_MAX_LEVEL,
  GSI_RASTER_MAP_MIN_LEVEL,
  GSI_SEAMLESS_PHOTO_MAX_LEVEL,
  GSI_SEAMLESS_PHOTO_MIN_LEVEL,
  GSI_SEAMLESS_PHOTO_URL,
  GSI_TILE_ATTRIBUTION_JA,
} from '../flight/flightViewer3d/gsiTileConfig';

/** 2D 計画地図：淡色地図（ZL5–18） */
export function createGsiPaleMapTileLayer(): L.TileLayer {
  return L.tileLayer(GSI_PALE_MAP_URL, {
    minZoom: GSI_RASTER_MAP_MIN_LEVEL,
    maxZoom: GSI_RASTER_MAP_MAX_LEVEL,
    attribution: GSI_TILE_ATTRIBUTION_JA,
  });
}

/** 2D 計画地図：シームレス写真（ZL2–18・日本域） */
export function createGsiSeamlessPhotoTileLayer(): L.TileLayer {
  return L.tileLayer(GSI_SEAMLESS_PHOTO_URL, {
    minZoom: GSI_SEAMLESS_PHOTO_MIN_LEVEL,
    maxZoom: GSI_SEAMLESS_PHOTO_MAX_LEVEL,
    attribution: GSI_TILE_ATTRIBUTION_JA,
    bounds: L.latLngBounds(
      [GSI_JAPAN_IMAGERY_RECTANGLE.south, GSI_JAPAN_IMAGERY_RECTANGLE.west],
      [GSI_JAPAN_IMAGERY_RECTANGLE.north, GSI_JAPAN_IMAGERY_RECTANGLE.east],
    ),
  });
}
