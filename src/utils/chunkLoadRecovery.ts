const CHUNK_RELOAD_KEY = 'fa_chunk_reload';

export function isChunkLoadFailure(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes('failed to fetch dynamically imported module') ||
    msg.includes('importing a module script failed') ||
    msg.includes('loading chunk') ||
    msg.includes('dynamically imported module')
  );
}

/** Reload once per session when a stale JS chunk is detected after deploy. */
export function reloadOnceForStaleChunk(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) return false;
  sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
  window.location.reload();
  return true;
}

export function clearChunkReloadFlag(): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  }
}
