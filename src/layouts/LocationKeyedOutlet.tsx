import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ROUTE_SUSPENSE_FALLBACK } from './withRouteSuspense';

/**
 * Keying Outlet by pathname unmounts the outgoing page as soon as the URL
 * changes (Leaflet map / Helmet title). Combined with withRouteSuspense on
 * each lazy page, the visible tree matches location.
 */
export const LocationKeyedOutlet: React.FC = () => {
  const { pathname } = useLocation();
  return (
    <Suspense fallback={ROUTE_SUSPENSE_FALLBACK}>
      <Outlet key={pathname} />
    </Suspense>
  );
};
