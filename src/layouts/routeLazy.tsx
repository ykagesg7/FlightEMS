import type { ComponentType } from 'react';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { importWithChunkRetry } from '../utils/lazyWithRetry';

type PageModule = { default: ComponentType };

async function loadPage(
  importer: () => Promise<PageModule>,
  retry: boolean,
): Promise<PageModule> {
  return retry ? importWithChunkRetry(importer) : importer();
}

/**
 * Data-router `lazy` loads the page module before committing the new
 * location. React.lazy during render + startTransition is what left
 * Planning on screen after HOME/LOGIN/Mission.
 */
export function lazyRoute(
  importer: () => Promise<PageModule>,
  retry = false,
) {
  return {
    lazy: async () => {
      const mod = await loadPage(importer, retry);
      return { Component: mod.default };
    },
  };
}

export function lazyProtectedRoute(
  importer: () => Promise<PageModule>,
  options?: { retry?: boolean; requireAdmin?: boolean },
) {
  const retry = options?.retry ?? false;
  const requireAdmin = options?.requireAdmin;
  return {
    lazy: async () => {
      const mod = await loadPage(importer, retry);
      const Page = mod.default;
      function GuardedPage() {
        return (
          <ProtectedRoute requireAdmin={requireAdmin}>
            <Page />
          </ProtectedRoute>
        );
      }
      return { Component: GuardedPage };
    },
  };
}
