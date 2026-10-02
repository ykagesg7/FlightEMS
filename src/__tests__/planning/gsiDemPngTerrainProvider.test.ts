import { describe, expect, it } from 'vitest';
import { buildGsiDemTileUrl } from '../../pages/planning/components/flight/flightViewer3d/gsiDemPngTerrainProvider';
import { isGsiDemTerrainLevelAvailable } from '../../pages/planning/components/flight/flightViewer3d/gsiTileConfig';

describe('buildGsiDemTileUrl', () => {
  it('still builds URLs for level 0 when explicitly requested (network avoided via availability)', () => {
    expect(buildGsiDemTileUrl(0, 0, 0)).toBe(
      'https://cyberjapandata.gsi.go.jp/xyz/dem_png/0/0/0.png',
    );
    expect(isGsiDemTerrainLevelAvailable(0)).toBe(false);
  });

  it('uses dem_png for levels below 15', () => {
    expect(buildGsiDemTileUrl(14, 14500, 6450)).toBe(
      'https://cyberjapandata.gsi.go.jp/xyz/dem_png/14/14500/6450.png',
    );
  });

  it('uses dem5a_png (not dem_png5a) at level 15', () => {
    const url = buildGsiDemTileUrl(15, 28253, 13134);
    expect(url).toBe(
      'https://cyberjapandata.gsi.go.jp/xyz/dem5a_png/15/28253/13134.png',
    );
    expect(url).not.toContain('dem_png5a');
  });

  it('rewrites custom dem_png base to dem5a_png at level 15', () => {
    expect(
      buildGsiDemTileUrl(15, 1, 2, 'https://example.test/xyz/dem_png'),
    ).toBe('https://example.test/xyz/dem5a_png/15/1/2.png');
  });
});
