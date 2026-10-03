declare global {
  interface Window {
    __flightViewer3dReady?: boolean;
    __flightViewer3dError?: string;
  }
}

export {};

/** Playwright / 手動確認用（本番 UI には出さない） */
export function setFlightViewer3dReadyFlag(ready: boolean): void {
  if (typeof window === 'undefined') return;
  window.__flightViewer3dReady = ready;
  if (ready) delete window.__flightViewer3dError;
}

export function setFlightViewer3dErrorFlag(message: string): void {
  if (typeof window === 'undefined') return;
  window.__flightViewer3dReady = false;
  window.__flightViewer3dError = message;
}

export function clearFlightViewer3dDebugFlags(): void {
  if (typeof window === 'undefined') return;
  delete window.__flightViewer3dReady;
  delete window.__flightViewer3dError;
}
