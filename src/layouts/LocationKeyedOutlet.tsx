import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { useUrgentRouterView } from './useUrgentRouterView';
import { ROUTE_SUSPENSE_FALLBACK } from './withRouteSuspense';

/**
 * Data-router navigations update the URL bar before React commits the new
 * location (RouterProvider wraps updates in startTransition). While the
 * destination is pending or still uncommitted, drop Outlet so Leaflet / HUD
 * (Planning) cannot remain on top of HOME / LOGIN / Mission.
 */
export const LocationKeyedOutlet: React.FC = () => {
  const { leaving, locationKey } = useUrgentRouterView();

  if (leaving) {
    return ROUTE_SUSPENSE_FALLBACK;
  }

  return (
    <Suspense key={locationKey} fallback={ROUTE_SUSPENSE_FALLBACK}>
      <Outlet />
    </Suspense>
  );
};
