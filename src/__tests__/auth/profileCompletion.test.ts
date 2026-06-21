import { describe, expect, it } from 'vitest';
import {
  buildProfileSearchParams,
  resolveProfileRoute,
  resolveProfileSection,
} from '@/auth/profileCompletion';

describe('profileCompletion routing', () => {
  it('resolves legacy tab deep links to new sections', () => {
    expect(resolveProfileRoute('leaderboard', null)).toEqual({ section: 'privacy' });
    expect(resolveProfileRoute('social', null)).toEqual({ section: 'profile' });
    expect(resolveProfileRoute('security', null)).toEqual({ section: 'account' });
    expect(resolveProfileRoute('cohort', null)).toEqual({ section: 'learning' });
    expect(resolveProfileRoute('notifications', null)).toEqual({ section: 'privacy' });
  });

  it('returns null section when tab is absent (mobile list mode)', () => {
    expect(resolveProfileRoute(null, null)).toEqual({ section: null });
    expect(resolveProfileSection(null)).toBeNull();
  });

  it('accepts new section ids directly', () => {
    expect(resolveProfileRoute('learning', null)).toEqual({ section: 'learning' });
    expect(resolveProfileRoute('account', null)).toEqual({ section: 'account' });
  });

  it('builds grouped search params without panel', () => {
    expect(buildProfileSearchParams('privacy')).toEqual({ tab: 'privacy' });
    expect(buildProfileSearchParams('profile')).toEqual({ tab: 'profile' });
  });
});
