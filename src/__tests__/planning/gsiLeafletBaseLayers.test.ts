import { describe, expect, it } from 'vitest';
import {
  GSI_PALE_MAP_URL,
  GSI_RASTER_MAP_MAX_LEVEL,
  GSI_RASTER_MAP_MIN_LEVEL,
  GSI_SEAMLESS_PHOTO_MAX_LEVEL,
  GSI_SEAMLESS_PHOTO_MIN_LEVEL,
  GSI_SEAMLESS_PHOTO_URL,
  GSI_TILE_ATTRIBUTION_JA,
} from '../../pages/planning/components/flight/flightViewer3d/gsiTileConfig';

describe('gsiLeafletBaseLayers (config)', () => {
  it('uses GSI pale map URL and documented zoom range', () => {
    expect(GSI_PALE_MAP_URL).toBe(
      'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
    );
    expect(GSI_RASTER_MAP_MIN_LEVEL).toBe(5);
    expect(GSI_RASTER_MAP_MAX_LEVEL).toBe(18);
    expect(GSI_TILE_ATTRIBUTION_JA).toBe('出典：国土地理院');
  });

  it('uses GSI seamlessphoto for satellite base', () => {
    expect(GSI_SEAMLESS_PHOTO_URL).toMatch(/seamlessphoto\/\{z\}\/\{x\}\/\{y\}\.jpg$/);
    expect(GSI_SEAMLESS_PHOTO_MIN_LEVEL).toBe(2);
    expect(GSI_SEAMLESS_PHOTO_MAX_LEVEL).toBe(18);
  });
});

