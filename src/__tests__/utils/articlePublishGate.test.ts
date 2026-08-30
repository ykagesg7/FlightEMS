import { describe, expect, it, vi } from 'vitest';
import {
  getJstDateString,
  isArticleReadable,
  isArticleReleased,
} from '../../utils/articlePublishGate';

describe('articlePublishGate', () => {
  it('compares JST calendar dates', () => {
    // 2026-08-02 15:00 UTC = 2026-08-03 00:00 JST
    const justAfterJstMidnight = new Date('2026-08-02T15:00:00.000Z');
    expect(getJstDateString(justAfterJstMidnight)).toBe('2026-08-03');
    expect(isArticleReleased('2026-08-03', justAfterJstMidnight)).toBe(true);
    expect(isArticleReleased('2026-08-04', justAfterJstMidnight)).toBe(false);
    expect(isArticleReleased('2026-08-02', justAfterJstMidnight)).toBe(true);
  });

  it('rejects missing or invalid publishedAt', () => {
    expect(isArticleReleased(undefined)).toBe(false);
    expect(isArticleReleased('not-a-date')).toBe(false);
  });

  it('allows preview ids when VITE_ARTICLE_PREVIEW_IDS is set in dev', () => {
    vi.stubEnv('VITE_ARTICLE_PREVIEW_IDS', 'CP-2-4_Unload,CP-2-5_TrimFailure');
    expect(isArticleReadable('2099-01-01', 'CP-2-4_Unload')).toBe(true);
    expect(isArticleReadable('2099-01-01', 'CP-2-1_DeepStall')).toBe(false);
    vi.unstubAllEnvs();
  });
});
