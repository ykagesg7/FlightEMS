import { glob } from 'glob';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';

/** Glob passed to Sentry `sourcemaps.filesToDeleteAfterUpload` and local cleanup. */
export const DIST_SOURCEMAP_GLOB = './dist/**/*.map';

/** Collect absolute paths to `.map` files under a build output directory. */
export async function listDistSourcemapFiles(outDir: string): Promise<string[]> {
  return glob('**/*.map', { cwd: outDir, absolute: true });
}

/** Remove all `.map` files under the Vite build output directory. */
export async function deleteDistSourcemapFiles(outDir: string): Promise<number> {
  const mapFiles = await listDistSourcemapFiles(outDir);
  await Promise.all(mapFiles.map((file) => unlink(file)));
  return mapFiles.length;
}

/**
 * Deletes dist .map files after the production bundle is written.
 * Used when Sentry upload is skipped (no auth token) so deploy artifacts stay map-free.
 */
export function deleteDistSourcemapsPlugin(): Plugin {
  let outDir = 'dist';

  return {
    name: 'delete-dist-sourcemaps',
    apply: 'build',
    enforce: 'post',
    configResolved(config: ResolvedConfig) {
      outDir = config.build.outDir;
    },
    async closeBundle() {
      const removed = await deleteDistSourcemapFiles(outDir);
      if (removed > 0) {
        console.log(`[delete-dist-sourcemaps] removed ${removed} .map file(s) from ${join(outDir)}`);
      }
    },
  };
}
