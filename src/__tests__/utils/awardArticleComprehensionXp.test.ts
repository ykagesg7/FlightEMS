import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sendGa4Event } from '../../lib/googleAnalytics';
import { awardArticleComprehensionXp } from '../../utils/awardArticleComprehensionXp';
import { supabase } from '../../utils/supabase';

vi.mock('../../utils/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

vi.mock('../../lib/googleAnalytics', () => ({
  sendGa4Event: vi.fn(),
}));

describe('awardArticleComprehensionXp', () => {
  beforeEach(() => {
    vi.mocked(supabase.rpc).mockReset();
    vi.mocked(sendGa4Event).mockReset();
  });

  it('awards the server-calculated reward and tracks the milestone', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: { success: true, xp_awarded: 10 },
      error: null,
    } as never);

    const result = await awardArticleComprehensionXp('PPL-1-1-1', 'session-1');

    expect(result).toEqual({ success: true, xpAwarded: 10 });
    expect(supabase.rpc).toHaveBeenCalledWith('award_article_comprehension_xp', {
      p_article_slug: 'PPL-1-1-1',
      p_session_id: 'session-1',
    });
    expect(sendGa4Event).toHaveBeenCalledWith('learning_milestone_achieved', {
      milestone_type: 'article_comprehension',
      content_id: 'PPL-1-1-1',
      xp_awarded: 10,
    });
  });

  it('does not track rejected rewards', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: { success: false, error: 'comprehension_threshold_not_met' },
      error: null,
    } as never);

    const result = await awardArticleComprehensionXp('PPL-1-1-1', 'session-1');

    expect(result).toEqual({
      success: false,
      error: 'comprehension_threshold_not_met',
    });
    expect(sendGa4Event).not.toHaveBeenCalled();
  });
});
