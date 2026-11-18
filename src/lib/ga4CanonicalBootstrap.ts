import { getGa4MeasurementId } from './googleAnalytics';
import { canonicalizeAnalyticsPagePath } from '../utils/articleRouteResolve';

let lastCanonicalPagePath = '/';

export function getLastGa4CanonicalPagePath(): string {
  return lastCanonicalPagePath;
}

function buildGa4PageLocation(pagePath: string): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}${pagePath.startsWith('/') ? pagePath : `/${pagePath}`}`;
}

/** GA4 の計測コンテキスト（拡張計測の scroll 含む）を正本 URL に揃える。 */
export function applyGa4CanonicalPageContext(pagePathWithSearch: string): void {
  lastCanonicalPagePath = pagePathWithSearch;
  const id = getGa4MeasurementId();
  if (!id || typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }
  window.gtag('config', id, {
    page_path: pagePathWithSearch,
    page_location: buildGa4PageLocation(pagePathWithSearch),
  });
}

function patchGtagEventPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const canonical = lastCanonicalPagePath;
  if (!canonical) return payload;
  return {
    ...payload,
    page_path: canonical,
    page_location: buildGa4PageLocation(canonical),
  };
}

type DataLayer = unknown[] & { push: (...args: unknown[]) => number };

function installDataLayerCanonicalGuard(): void {
  if (typeof window === 'undefined') return;
  const dl = window.dataLayer as DataLayer | undefined;
  if (!dl || (dl as DataLayer & { __faCanonicalGuard?: boolean }).__faCanonicalGuard) {
    return;
  }

  const originalPush = dl.push.bind(dl);
  dl.push = (...args: unknown[]) => {
    const normalized = args.map((arg) => {
      if (!Array.isArray(arg) || arg.length < 2) return arg;
      const command = arg[0];
      if (command !== 'event') return arg;
      const eventName = arg[1];
      const params = arg[2];
      if (typeof eventName !== 'string' || !params || typeof params !== 'object') {
        return arg;
      }
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const paramsRecord = params as Record<string, unknown>;
      const pagePath = typeof paramsRecord.page_path === 'string' ? paramsRecord.page_path : '';
      const pageLocation = typeof paramsRecord.page_location === 'string' ? paramsRecord.page_location : '';
      const canonicalPathOnly = lastCanonicalPagePath.split('?')[0] ?? '';
      const needsPatch =
        currentPath.startsWith('/learning/') ||
        pagePath.startsWith('/learning/') ||
        pageLocation.includes('/learning/') ||
        (canonicalPathOnly.length > 1 &&
          currentPath !== canonicalPathOnly &&
          (pageLocation === '' || pageLocation.includes(currentPath)));

      if (!needsPatch) return arg;

      return [command, eventName, patchGtagEventPayload(paramsRecord)];
    });
    return originalPush(...normalized);
  };

  Object.defineProperty(dl, '__faCanonicalGuard', { value: true });
}

/**
 * アプリ起動直後（React より前）に URL と GA4 コンテキストを正本へ揃える。
 */
export function syncBrowserUrlToCanonicalArticlePath(): void {
  if (typeof window === 'undefined') return;
  installDataLayerCanonicalGuard();

  const current = `${window.location.pathname}${window.location.search}`;
  const canonical = canonicalizeAnalyticsPagePath(current);
  lastCanonicalPagePath = canonical;

  if (current !== canonical) {
    window.history.replaceState(window.history.state, '', canonical);
  }

  applyGa4CanonicalPageContext(canonical);
}