/**
 * Must load before `import 'cesium'`. ESM Cesium reads this for Workers/Assets.
 * Set here instead of injecting Cesium.js on every HTML shell.
 */
const g = globalThis as typeof globalThis & { CESIUM_BASE_URL?: string };
g.CESIUM_BASE_URL = '/cesium/';
