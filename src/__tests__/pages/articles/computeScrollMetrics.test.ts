import { describe, expect, it } from 'vitest';
import {
  ARTICLE_READ_COMPLETE_PERCENT,
  computeScrollMetricsFromViewport,
} from '../../../pages/articles/utils/computeScrollMetrics';

describe('computeScrollMetricsFromViewport', () => {
  it('returns 100 when the document does not scroll', () => {
    expect(
      computeScrollMetricsFromViewport({
        scrollY: 0,
        scrollHeight: 800,
        clientHeight: 800,
      }),
    ).toEqual({ scrollY: 0, scrollProgress: 100 });
  });

  it('returns 100 when remaining scroll is within the slack', () => {
    expect(
      computeScrollMetricsFromViewport({
        scrollY: 1940,
        scrollHeight: 2800,
        clientHeight: 800,
      })?.scrollProgress,
    ).toBe(100);
  });

  it('rounds mid-document progress', () => {
    const metrics = computeScrollMetricsFromViewport({
      scrollY: 500,
      scrollHeight: 2800,
      clientHeight: 800,
    });
    expect(metrics?.scrollProgress).toBe(25);
    expect(metrics?.scrollProgress).toBeLessThan(ARTICLE_READ_COMPLETE_PERCENT);
  });

  it('returns null for non-finite ratios', () => {
    expect(
      computeScrollMetricsFromViewport({
        scrollY: Number.NaN,
        scrollHeight: Number.POSITIVE_INFINITY,
        clientHeight: 800,
      }),
    ).toBeNull();
  });
});
