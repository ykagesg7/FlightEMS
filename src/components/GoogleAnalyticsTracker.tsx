import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getGa4MeasurementId, sendGa4PageView } from '../lib/googleAnalytics';

const measurementId = getGa4MeasurementId();

/**
 * RouterProvider 配下でマウントすること。ルート（pathname + search）が変わるたびに GA4 に page_view を送る。
 */
export function GoogleAnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (!measurementId) return;
    const path = `${location.pathname}${location.search}`;
    sendGa4PageView(measurementId, path);
  }, [location.pathname, location.search]);

  return null;
}
