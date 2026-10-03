import { lazy, type ComponentType } from 'react';
import type { FlightViewer3DProps } from './types';

/** Cesium を含むチャンク — 初回 open 前に preload する */
export const flightViewer3DModulePromise = import('./FlightViewer3D').then((m) => ({
  default: m.FlightViewer3D,
}));

export function preloadFlightViewer3DModule(): void {
  void flightViewer3DModulePromise;
}

export const LazyFlightViewer3D: ComponentType<FlightViewer3DProps> = lazy(
  () => flightViewer3DModulePromise,
);

/** チャンク取得タイムアウト（ms）— 遅い回線向けに長め、超過時はパネル内エラー */
export const FLIGHT_VIEWER_3D_CHUNK_TIMEOUT_MS = 90_000;

const chunkLoadStartedAt =
  typeof performance !== 'undefined' ? performance.now() : 0;

flightViewer3DModulePromise.then(() => {
  if (typeof window !== 'undefined') {
    window.__flightViewer3dChunkMs = Math.round(performance.now() - chunkLoadStartedAt);
  }
});
