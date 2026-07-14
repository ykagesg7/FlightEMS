import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import {
  clearChunkReloadFlag,
  isChunkLoadFailure,
  reloadOnceForStaleChunk,
} from './chunkLoadRecovery';

type LazyModule<T extends ComponentType> = { default: T };

/**
 * Retry a dynamic import. On persistent chunk failure, reload once per session
 * and return a never-resolving promise (do not rethrow while unloading).
 */
export async function importWithChunkRetry<T extends ComponentType>(
  importer: () => Promise<LazyModule<T>>,
  retries = 2,
): Promise<LazyModule<T>> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const mod = await importer();
      clearChunkReloadFlag();
      return mod;
    } catch (error) {
      lastError = error;
      if (!isChunkLoadFailure(error)) throw error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
        continue;
      }
      if (reloadOnceForStaleChunk()) {
        return new Promise<LazyModule<T>>(() => {});
      }
      throw error;
    }
  }
  throw lastError;
}

/**
 * Lazy import with retries. On chunk mismatch after deploy, reload once per session.
 */
export function lazyWithRetry<T extends ComponentType>(
  importer: () => Promise<LazyModule<T>>,
  retries = 2,
): LazyExoticComponent<T> {
  return lazy(() => importWithChunkRetry(importer, retries));
}

export { isChunkLoadFailure } from './chunkLoadRecovery';
