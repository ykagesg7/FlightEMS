import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { ArticleMeta } from '../../types/articles';
import {
  awardArticleReadXp,
  computeArticleReadXp,
  isSeriesCompleteForMembers,
  resolveArticleMeta,
} from '../../utils/awardArticleReadXp';
import { supabase } from '../../utils/supabase';

vi.mock('../../utils/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

describe('awardArticleReadXp utils', () => {
  beforeEach(() => {
    vi.mocked(supabase.rpc).mockReset();
  });

  it('isSeriesCompleteForMembers returns true when all siblings are done', () => {
    const ok = isSeriesCompleteForMembers(
      'b',
      ['a', 'b', 'c'],
      {
        a: { completed: true },
        c: { scrollProgress: 96 },
      }
    );
    expect(ok).toBe(true);
  });

  it('resolveArticleMeta prefers filename index', () => {
    const meta: ArticleMeta = { title: 't', slug: '/articles/x', tags: ['PPL'] };
    expect(
      resolveArticleMeta('PPL-1-1-1_TemperatureBasics', { 'PPL-1-1-1_TemperatureBasics': meta }, {})
    ).toBe(meta);
  });

  it('computeArticleReadXp applies first-read bonus from config', () => {
    const meta: ArticleMeta = { title: 't', slug: '/articles/x', tags: ['PPL'] };
    expect(computeArticleReadXp('PPL-1-1-1_TemperatureBasics', meta, false)).toBe(10);
  });

  it('awardArticleReadXp calls Supabase RPC on success', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: { success: true, xp_awarded: 10 },
      error: null,
    } as never);

    const meta: ArticleMeta = { title: 't', slug: '/articles/x', tags: ['PPL'] };
    const result = await awardArticleReadXp('user-1', 'PPL-1-1-1_TemperatureBasics', meta, false);

    expect(result.success).toBe(true);
    expect(result.xpAwarded).toBe(10);
    expect(supabase.rpc).toHaveBeenCalledWith('award_article_xp', {
      p_user_id: 'user-1',
      p_article_slug: 'PPL-1-1-1_TemperatureBasics',
      p_xp_amount: 10,
    });
  });
});
