import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applyGa4CanonicalPageContext } from '../lib/ga4CanonicalBootstrap';
import { getGa4MeasurementId, sendGa4PageView } from '../lib/googleAnalytics';
import { canonicalizeAnalyticsPagePath } from '../utils/articleRouteResolve';

const measurementId = getGa4MeasurementId();

/**
 * RouterProvider 配下でマウントすること。ルート（pathname + search）が変わるたびに GA4 に page_view を送る。
 */
export function GoogleAnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (!measurementId) return;
    const raw = `${location.pathname}${location.search}`;
    const canonical = canonicalizeAnalyticsPagePath(raw);
    applyGa4CanonicalPageContext(canonical);
    if (raw !== canonical) return;
    sendGa4PageView(measurementId, canonical);
  }, [location.pathname, location.search]);

  return null;
}
