import { describe, expect, it } from 'vitest';
import { getJstDateString, isArticleReleased } from '../../utils/articlePublishGate';

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
});
