import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { isChunkLoadFailure, reloadOnceForStaleChunk } from './chunkLoadRecovery';

type LazyModule<T extends ComponentType> = { default: T };

/**
 * Lazy import with retries. On chunk mismatch after deploy, reload once per session.
 */
export function lazyWithRetry<T extends ComponentType>(
  importer: () => Promise<LazyModule<T>>,
  retries = 2,
): LazyExoticComponent<T> {
  return lazy(async () => {
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        return await importer();
      } catch (error) {
        lastError = error;
        if (!isChunkLoadFailure(error)) throw error;
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
          continue;
        }
        reloadOnceForStaleChunk();
        throw error;
      }
    }
    throw lastError;
  });
}

export { isChunkLoadFailure } from './chunkLoadRecovery';
