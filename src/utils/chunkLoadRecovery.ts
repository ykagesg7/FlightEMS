import { sendGa4Event } from '../lib/googleAnalytics';

export const CHUNK_RELOAD_SESSION_KEY = 'fa_chunk_reload';

declare global {
  interface Window {
    __fa_app_booted__?: boolean;
  }
}

function chunkFailureMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return '';
}

export function isChunkLoadFailure(error: unknown): boolean {
  const msg = chunkFailureMessage(error).toLowerCase();
  if (!msg) return false;
  return (
    msg.includes('failed to fetch dynamically imported module') ||
    msg.includes('importing a module script failed') ||
    msg.includes('loading chunk') ||
    msg.includes('dynamically imported module') ||
    msg.includes('is not a valid javascript mime type') ||
    msg.includes('failed to load module script') ||
    msg.includes('disallowed mime type')
  );
}

/** Reload once per session when a stale JS chunk is detected after deploy. */
export function reloadOnceForStaleChunk(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  if (sessionStorage.getItem(CHUNK_RELOAD_SESSION_KEY)) return false;
  sessionStorage.setItem(CHUNK_RELOAD_SESSION_KEY, '1');
  sendGa4Event('chunk_recovery_reload', {
    page_path: typeof window !== 'undefined' ? window.location.pathname : '',
  });
  window.location.reload();
  return true;
}

export function clearChunkReloadFlag(): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(CHUNK_RELOAD_SESSION_KEY);
  }
}

/** Called from main after React mounts so index.html bootstrap does not false-reload. */
export function markAppBooted(): void {
  if (typeof window !== 'undefined') {
    window.__fa_app_booted__ = true;
  }
}

/**
 * Vite dispatches `vite:preloadError` when a dependency preload fails (e.g. stale hashed chunk).
 * Reload once per session; preventDefault avoids surfacing an unhandled rejection loop.
 */
export function registerVitePreloadErrorHandler(): void {
  if (typeof window === 'undefined') return;
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    reloadOnceForStaleChunk();
  });
}
