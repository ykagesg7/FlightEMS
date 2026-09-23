import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Resolved cesium version from package-lock (not the semver range in package.json). */
export function readCesiumLockfileVersion(cwd = process.cwd()): string {
  const lockPath = resolve(cwd, 'package-lock.json');
  const lock = JSON.parse(readFileSync(lockPath, 'utf8')) as {
    packages?: Record<string, { version?: string }>;
  };
  const version = lock.packages?.['node_modules/cesium']?.version;
  if (!version) {
    throw new Error('[cesium] package-lock.json is missing node_modules/cesium version');
  }
  return version;
}

/** jsDelivr base URL for Cesium static assets, version-pinned. Trailing slash included. */
export function cesiumJsDelivrBaseUrl(version: string): string {
  return `https://cdn.jsdelivr.net/npm/cesium@${version}/Build/Cesium/`;
}

export type CesiumDeployEnv = {
  vercel?: string;
  vercelEnv?: string;
  cesiumCdn?: string;
};

/** True when Preview should load Workers/Assets from jsDelivr instead of /cesium/. */
export function shouldUseCesiumCdn(env: CesiumDeployEnv = {}): boolean {
  if (env.cesiumCdn === '1') return true;
  return env.vercel === '1' && env.vercelEnv === 'preview';
}

/** Build-time CESIUM_BASE_URL for the SPA (local path or jsDelivr). */
export function resolveCesiumBaseUrl(
  env: CesiumDeployEnv = {},
  cwd = process.cwd(),
): { baseUrl: string; useCdn: boolean; version: string } {
  const version = readCesiumLockfileVersion(cwd);
  const useCdn = shouldUseCesiumCdn(env);
  const baseUrl = useCdn ? cesiumJsDelivrBaseUrl(version) : '/cesium/';
  return { baseUrl, useCdn, version };
}
