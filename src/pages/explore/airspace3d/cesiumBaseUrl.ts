/**
 * Must load before `import 'cesium'`. ESM Cesium reads this for Workers/Assets.
 * Set here instead of injecting Cesium.js on every HTML shell.
 */
const g = globalThis as typeof globalThis & { CESIUM_BASE_URL?: string };
const configured = import.meta.env.VITE_CESIUM_BASE_URL?.trim();
g.CESIUM_BASE_URL = configured && configured.length > 0 ? configured : '/cesium/';
