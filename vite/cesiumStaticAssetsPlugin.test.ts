import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveCesiumAssetPath } from './cesiumStaticAssetsPlugin';

const root = resolve('/tmp/cesium-build-root');

describe('resolveCesiumAssetPath', () => {
  it('maps a worker URL under the Cesium build root', () => {
    const resolved = resolveCesiumAssetPath(root, '/cesium/Workers/transferTypedArrayTest.js');
    expect(resolved).toBe(resolve(root, 'Workers/transferTypedArrayTest.js'));
  });

  it('rejects path traversal', () => {
    expect(resolveCesiumAssetPath(root, '/cesium/../secret.wasm')).toBeNull();
    expect(resolveCesiumAssetPath(root, '/cesium/%2e%2e/secret.wasm')).toBeNull();
  });

  it('ignores non-cesium URLs', () => {
    expect(resolveCesiumAssetPath(root, '/assets/index.js')).toBeNull();
  });
});
