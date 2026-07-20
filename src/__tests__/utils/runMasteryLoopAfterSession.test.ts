import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sendGa4Event } from '../../lib/googleAnalytics';
import { runMasteryLoopAfterSession } from '../../utils/runMasteryLoopAfterSession';
import { supabase } from '../../utils/supabase';

vi.mock('../../utils/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

vi.mock('../../lib/googleAnalytics', () => ({
  sendGa4Event: vi.fn(),
}));

vi.mock('../../utils/awardXpEvent', () => ({
  invalidateGamificationProfile: vi.fn(),
}));

describe('runMasteryLoopAfterSession', () => {
  beforeEach(() => {
    vi.mocked(supabase.rpc).mockReset();
    vi.mocked(sendGa4Event).mockReset();
  });

  it('runs delayed retention, SRS sync, then weakness improvement in order', async () => {
    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce({
        data: { success: true, xp_awarded: 10, milestones_awarded: 1 },
        error: null,
      } as never)
      .mockResolvedValueOnce({
        data: { success: true, cards_updated: 4 },
        error: null,
      } as never)
      .mockResolvedValueOnce({
        data: { success: true, xp_awarded: 15, subjects_awarded: 1 },
        error: null,
      } as never);

    const result = await runMasteryLoopAfterSession('session-1');

    expect(result).toEqual({
      success: true,
      delayedXp: 10,
      delayedCount: 1,
      weaknessXp: 15,
      weaknessCount: 1,
      srsCardsUpdated: 4,
    });
    expect(vi.mocked(supabase.rpc).mock.calls.map((c) => c[0])).toEqual([
      'award_delayed_retention_xp',
      'sync_srs_after_session',
      'award_weakness_improvement_xp',
    ]);
    expect(sendGa4Event).toHaveBeenCalledTimes(2);
  });

  it('skips invalid sessions', async () => {
    const result = await runMasteryLoopAfterSession('temp-session-id');
    expect(result.success).toBe(false);
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
