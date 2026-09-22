/**
 * Vercel Ignored Build Step helper.
 * Exit 0 = skip the deployment. Exit 1 = run the build.
 *
 * Skip only when every changed path is docs-only (or similar). Always build
 * when src/, api/, vercel.json, public/ (except public/docs), index.html,
 * package files, or article MDX change — drip and SPA depend on those.
 */
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @typedef {{ gitFailed?: boolean, missingPrevious?: boolean }} IgnoreBuildContext */

const SKIP_PREFIXES = [
  'docs/',
  'public/docs/',
  '.cursor/',
  '.github/',
  'artifacts/',
  'e2e/',
  'scripts/telemetry/',
];

const SKIP_EXACT = new Set(['AGENTS.md', 'DESIGN.md', 'README.md']);

/**
 * @param {string} rawPath
 * @returns {string}
 */
export function normalizeDeployPath(rawPath) {
  return rawPath.replaceAll('\\', '/').replace(/^\.\//, '');
}

/**
 * @param {string} rawPath
 * @returns {boolean}
 */
export function isSkippableDeployPath(rawPath) {
  const path = normalizeDeployPath(rawPath);
  if (path.length === 0) return false;
  if (SKIP_EXACT.has(path)) return true;
  return SKIP_PREFIXES.some((prefix) => path === prefix.slice(0, -1) || path.startsWith(prefix));
}

/**
 * @param {string[]} changedFiles
 * @param {IgnoreBuildContext} [context]
 * @returns {boolean} true when Vercel should skip the build
 */
export function shouldIgnoreBuild(changedFiles, context = {}) {
  if (context.missingPrevious || context.gitFailed) return false;
  if (changedFiles.length === 0) return true;
  return changedFiles.every(isSkippableDeployPath);
}

/**
 * @param {string} fromSha
 * @param {string} toSha
 * @returns {{ files: string[], gitFailed: boolean }}
 */
export function listChangedFiles(fromSha, toSha) {
  const result = spawnSync('git', ['diff', '--name-only', '-z', fromSha, toSha], {
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    return { files: [], gitFailed: true };
  }
  const files = (result.stdout ?? '')
    .split('\0')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
  return { files, gitFailed: false };
}

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {number}
 */
export function ignoredBuildExitCode(env = process.env) {
  const previous = (env.VERCEL_GIT_PREVIOUS_SHA ?? '').trim();
  const current = (env.VERCEL_GIT_COMMIT_SHA ?? '').trim() || 'HEAD';
  if (!previous) {
    console.log('vercel-ignore-build: no previous SHA; building');
    return 1;
  }
  const { files, gitFailed } = listChangedFiles(previous, current);
  const skip = shouldIgnoreBuild(files, { gitFailed, missingPrevious: false });
  if (gitFailed) {
    console.log('vercel-ignore-build: git diff failed; building');
    return 1;
  }
  console.log(
    skip
      ? `vercel-ignore-build: skip (${files.length} docs-only path(s))`
      : `vercel-ignore-build: build (${files.filter((path) => !isSkippableDeployPath(path)).join(', ') || files.join(', ')})`,
  );
  return skip ? 0 : 1;
}

const invoked = process.argv[1] ? resolve(process.argv[1]) : '';
const self = fileURLToPath(import.meta.url);
if (invoked === self) {
  process.exit(ignoredBuildExitCode());
}
