#!/usr/bin/env node
/**
 * CI guard: run cesium CDN/version unit tests (lockfile ↔ jsDelivr URL).
 */
import { spawnSync } from 'node:child_process';

const result = spawnSync(
  'npx',
  ['vitest', 'run', 'vite/cesiumVersion.test.ts'],
  { stdio: 'inherit', shell: true },
);

process.exit(result.status ?? 1);
