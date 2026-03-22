import { describe, expect, it, beforeEach } from 'vitest';
import {
  buildRainViewerTileUrlTemplate,
  clearRainViewerManifestCacheForTests,
  pickLatestPastPath,
  type RainViewerManifest,
} from '../../utils/rainViewerRadar';

describe('rainViewerRadar', () => {
  beforeEach(() => {
    clearRainViewerManifestCacheForTests();
  });

  it('pickLatestPastPath returns last past frame path', () => {
    const m: RainViewerManifest = {
      host: 'https://tilecache.rainviewer.com',
      radar: {
        past: [
          { time: 1, path: '/v2/radar/a' },
          { time: 2, path: '/v2/radar/b' },
        ],
      },
    };
    expect(pickLatestPastPath(m)).toBe('/v2/radar/b');
  });

  it('pickLatestPastPath returns null when empty', () => {
    expect(pickLatestPastPath({ host: 'h' })).toBeNull();
    expect(pickLatestPastPath({ host: 'h', radar: { past: [] } })).toBeNull();
  });

  it('buildRainViewerTileUrlTemplate matches documented shape', () => {
    const u = buildRainViewerTileUrlTemplate(
      'https://tilecache.rainviewer.com',
      '/v2/radar/123',
      512,
      2,
      '1_1'
    );
    expect(u).toBe(
      'https://tilecache.rainviewer.com/v2/radar/123/512/{z}/{x}/{y}/2/1_1.png'
    );
  });
});
