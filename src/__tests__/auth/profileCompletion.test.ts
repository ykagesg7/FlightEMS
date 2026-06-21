import { describe, expect, it } from 'vitest';
import { buildProfileSearchParams, resolveProfileRoute } from '@/auth/profileCompletion';

describe('profileCompletion routing', () => {
  it('resolves legacy tab deep links', () => {
    expect(resolveProfileRoute('leaderboard', null)).toEqual({
      section: 'preferences',
      panel: 'leaderboard',
    });
    expect(resolveProfileRoute('social', null)).toEqual({
      section: 'public',
      panel: 'social',
    });
    expect(resolveProfileRoute('security', null)).toEqual({
      section: 'account',
      panel: 'security',
    });
  });

  it('builds grouped search params', () => {
    expect(buildProfileSearchParams('preferences', 'leaderboard')).toEqual({
      tab: 'preferences',
      panel: 'leaderboard',
    });
    expect(buildProfileSearchParams('cohort')).toEqual({ tab: 'cohort' });
  });
});
