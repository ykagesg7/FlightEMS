import { createReadStream, existsSync, statSync } from 'node:fs';
import { cp } from 'node:fs/promises';
import { extname, join, normalize, relative, resolve, sep } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin, ResolvedConfig } from 'vite';

const CESIUM_URL_PREFIX = '/cesium/';

/** CesiumJS Quickstart: only these four dirs are required at runtime. */
export const CESIUM_RUNTIME_DIRS = ['Workers', 'ThirdParty', 'Assets', 'Widgets'] as const;

const MIME_BY_EXT: Record<string, string> = {
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.wasm': 'application/wasm',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
};

export function resolveCesiumBuildRoot(cwd = process.cwd()): string {
  return resolve(cwd, 'node_modules/cesium/Build/Cesium');
}

/** Resolve a /cesium/... URL to a file under the Cesium build root, or null if unsafe/missing. */
export function resolveCesiumAssetPath(cesiumRoot: string, requestUrl: string): string | null {
  const rawPath = requestUrl.split('?')[0] ?? '';
  if (!rawPath.startsWith(CESIUM_URL_PREFIX)) return null;
  const relUrl = rawPath.slice(CESIUM_URL_PREFIX.length);
  if (!relUrl || relUrl.endsWith('/')) return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(relUrl);
  } catch {
    return null;
  }
  const candidate = normalize(join(cesiumRoot, decoded));
  const rel = relative(cesiumRoot, candidate);
  if (!rel || rel.startsWith('..') || rel.startsWith(`..${sep}`)) return null;
  return candidate;
}

function contentTypeFor(filePath: string): string {
  return MIME_BY_EXT[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
}

/**
 * Copy Cesium Workers/Assets for the 3D page only.
 * Does NOT inject Cesium.js into index.html (vite-plugin-cesium did, which
 * initialized WASM on every SPA hub including Articles/Quiz).
 */
export type CesiumStaticAssetsOptions = {
  /** When true, skip copying to dist (Preview CDN spike). */
  skipCopy?: boolean;
};

export function cesiumStaticAssetsPlugin(options: CesiumStaticAssetsOptions = {}): Plugin {
  let outDir = 'dist';
  const cesiumRoot = resolveCesiumBuildRoot();
  const skipCopy = options.skipCopy ?? false;

  return {
    name: 'cesium-static-assets',
    configResolved(config: ResolvedConfig) {
      outDir = config.build.outDir;
    },
    configureServer(server) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = req.url ?? '';
        if (!url.startsWith(CESIUM_URL_PREFIX)) {
          next();
          return;
        }
        if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
          next();
          return;
        }
        const filePath = resolveCesiumAssetPath(cesiumRoot, url);
        if (!filePath || !existsSync(filePath)) {
          next();
          return;
        }
        const st = statSync(filePath);
        if (!st.isFile()) {
          next();
          return;
        }
        res.setHeader('Content-Type', contentTypeFor(filePath));
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        if (req.method === 'HEAD') {
          res.statusCode = 200;
          res.end();
          return;
        }
        createReadStream(filePath).pipe(res);
      });
    },
    async closeBundle() {
      if (skipCopy) {
        console.log('[cesium-static-assets] skip copy: CESIUM_BASE_URL points at CDN');
        return;
      }
      if (!existsSync(cesiumRoot)) {
        console.warn(
          `[cesium-static-assets] skip copy: missing ${cesiumRoot}. 3D airspace workers will 404.`,
        );
        return;
      }
      const dest = resolve(process.cwd(), outDir, 'cesium');
      for (const dir of CESIUM_RUNTIME_DIRS) {
        const src = join(cesiumRoot, dir);
        if (!existsSync(src)) {
          console.warn(`[cesium-static-assets] skip copy: missing ${src}`);
          continue;
        }
        await cp(src, join(dest, dir), { recursive: true });
      }
    },
  };
}
