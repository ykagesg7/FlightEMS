import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { sendGa4PageView } from '../lib/googleAnalytics';

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() ?? '';

/**
 * BrowserRouter 配下でマウントすること。ルート（pathname + search）が変わるたびに GA4 に page_view を送る。
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
