import { readFileSync } from 'node:fs';
import type { Plugin } from 'vite';

const GRID_FILE = 'gsiGeomag2020DeclinationWest.u16';

/** Vite/Vitest: `.u16?arraybuffer` を ArrayBuffer として import 可能にする。 */
export function gsiGridAssetPlugin(): Plugin {
  return {
    name: 'gsi-grid-u16-arraybuffer',
    load(id) {
      if (!id.includes(GRID_FILE) || !id.includes('arraybuffer')) {
        return null;
      }
      const filePath = id.split('?')[0];
      const base64 = readFileSync(filePath).toString('base64');
      return `const _b = atob(${JSON.stringify(base64)});
const _a = new Uint8Array(_b.length);
for (let i = 0; i < _b.length; i++) _a[i] = _b.charCodeAt(i);
export default _a.buffer;`;
    },
  };
}
