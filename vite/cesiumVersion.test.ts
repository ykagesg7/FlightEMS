import { describe, expect, it } from 'vitest';
import {
  cesiumJsDelivrBaseUrl,
  resolveCesiumBaseUrl,
  shouldUseCesiumCdn,
} from './cesiumVersion';

describe('cesiumVersion', () => {
  it('pins jsDelivr URL to the lockfile version', () => {
    const { version, baseUrl } = resolveCesiumBaseUrl({}, process.cwd());
    expect(baseUrl).toBe('/cesium/');
    expect(cesiumJsDelivrBaseUrl(version)).toBe(
      `https://cdn.jsdelivr.net/npm/cesium@${version}/Build/Cesium/`,
    );
  });

  it('uses CDN only on Vercel Preview or CESIUM_CDN=1', () => {
    expect(shouldUseCesiumCdn({})).toBe(false);
    expect(shouldUseCesiumCdn({ vercel: '1', vercelEnv: 'production' })).toBe(false);
    expect(shouldUseCesiumCdn({ vercel: '1', vercelEnv: 'preview' })).toBe(true);
    expect(shouldUseCesiumCdn({ cesiumCdn: '1' })).toBe(true);
  });

  it('matches lockfile version in Preview CDN URL', () => {
    const { baseUrl, useCdn, version } = resolveCesiumBaseUrl(
      { vercel: '1', vercelEnv: 'preview' },
      process.cwd(),
    );
    expect(useCdn).toBe(true);
    expect(baseUrl).toBe(cesiumJsDelivrBaseUrl(version));
  });
});
