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

/** Suspense / タイムアウト UI 用（ms） */
export const FLIGHT_VIEWER_3D_CHUNK_TIMEOUT_MS = 25_000;
