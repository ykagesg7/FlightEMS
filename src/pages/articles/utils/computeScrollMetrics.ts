/** Viewport scroll share that marks an article as read. */
export const ARTICLE_READ_COMPLETE_PERCENT = 95;

/**
 * Mobile URL bars and sticky chrome often leave a few pixels of
 * unscrollable remainder. Treat that as the end of the document.
 */
export const ARTICLE_READ_BOTTOM_SLACK_PX = 64;

export interface ScrollViewport {
  scrollY: number;
  scrollHeight: number;
  clientHeight: number;
}

export interface ScrollMetrics {
  scrollY: number;
  scrollProgress: number;
}

/** Viewport scroll from 0–100. Invalid numbers return null. */
export function computeScrollMetricsFromViewport(
  viewport: ScrollViewport,
): ScrollMetrics | null {
  const scrollY = Math.max(0, viewport.scrollY);
  const totalScrollable = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
  let scrollProgress: number;
  if (totalScrollable <= 0) {
    scrollProgress = 100;
  } else {
    const remaining = totalScrollable - scrollY;
    if (remaining <= ARTICLE_READ_BOTTOM_SLACK_PX) {
      scrollProgress = 100;
    } else {
      const raw = (scrollY / totalScrollable) * 100;
      if (!Number.isFinite(raw)) {
        return null;
      }
      scrollProgress = Math.min(100, Math.max(0, Math.round(raw)));
    }
  }
  return { scrollY: Math.floor(scrollY), scrollProgress };
}

export function computeWindowScrollMetrics(): ScrollMetrics | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }
  return computeScrollMetricsFromViewport({
    scrollY: window.scrollY,
    scrollHeight: document.documentElement.scrollHeight,
    clientHeight: window.innerHeight,
  });
}
