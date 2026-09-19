import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import { lazyWithRetry } from '../utils/lazyWithRetry';

export const ROUTE_SUSPENSE_FALLBACK = (
  <div className="text-center py-12">Loading...</div>
);

/**
 * Route elements must not suspend. React Router 7 navigations run inside
 * startTransition, so a suspending destination keeps the previous page
 * committed (URL changes, Planning stays). Wrap each lazy page so Outlet
 * can swap immediately and show this fallback instead.
 */
export function withRouteSuspense(
  LazyComponent: LazyExoticComponent<ComponentType>,
): ComponentType {
  function SuspendedRoute() {
    return (
      <Suspense fallback={ROUTE_SUSPENSE_FALLBACK}>
        <LazyComponent />
      </Suspense>
    );
  }
  return SuspendedRoute;
}

export function lazyPage(
  importer: () => Promise<{ default: ComponentType }>,
): ComponentType {
  return withRouteSuspense(lazy(importer));
}

export function lazyPageWithRetry(
  importer: () => Promise<{ default: ComponentType }>,
): ComponentType {
  return withRouteSuspense(lazyWithRetry(importer));
}
