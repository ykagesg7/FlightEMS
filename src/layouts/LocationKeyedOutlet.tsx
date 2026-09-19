import React, { Suspense } from 'react';
import { Outlet, useLocation, useNavigation } from 'react-router-dom';
import { ROUTE_SUSPENSE_FALLBACK } from './withRouteSuspense';

/**
 * Data-router navigations update the URL bar before the committed location
 * swaps. While a destination is loading, unmount Outlet so Leaflet / HUD
 * (Planning) cannot remain on top of HOME / LOGIN / Mission.
 */
export const LocationKeyedOutlet: React.FC = () => {
  const { pathname, key } = useLocation();
  const navigation = useNavigation();
  const pendingPath = navigation.location?.pathname;
  const leaving =
    navigation.state !== 'idle' &&
    pendingPath != null &&
    pendingPath !== pathname;

  if (leaving) {
    return ROUTE_SUSPENSE_FALLBACK;
  }

  return (
    <Suspense key={key} fallback={ROUTE_SUSPENSE_FALLBACK}>
      <Outlet />
    </Suspense>
  );
};
