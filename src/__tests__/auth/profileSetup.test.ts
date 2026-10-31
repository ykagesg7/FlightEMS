import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getPostAuthPath,
  getWelcomeRedirectTarget,
  needsWelcomeSetup,
  profileHasPriorEngagement,
  syncLearnerProfileAfterSignIn,
} from '@/auth/profileSetup';
import type { Profile } from '@/stores/authStore';
import * as authStore from '@/stores/authStore';

vi.mock('@/stores/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(),
  },
}));

vi.mock('@/utils/supabase', () => ({
  default: {
    from: vi.fn(),
  },
}));

function createProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'user-1',
    username: 'testuser',
    email: 'test@example.com',
    roll: 'Student',
    created_at: null,
    updated_at: null,
    full_name: null,
    avatar_url: null,
    website: null,
    rank: null,
    xp_points: null,
    social_links: null,
    bio: null,
    password_updated_at: null,
    leaderboard_opt_in: false,
    leaderboard_display_name: null,
    mfa_required_at_login: false,
    onboarding_completed_at: null,
    ...overrides,
  };
}

describe('profileSetup', () => {
  describe('needsWelcomeSetup', () => {
    it('returns false when profile is null', () => {
      expect(needsWelcomeSetup(null)).toBe(false);
    });

    it('returns true when onboarding_completed_at is null', () => {
      expect(needsWelcomeSetup(createProfile({ onboarding_completed_at: null }))).toBe(true);
    });

    it('returns false when onboarding_completed_at is set', () => {
      expect(needsWelcomeSetup(createProfile({ onboarding_completed_at: '2026-01-01T00:00:00Z' }))).toBe(false);
    });

    it('returns false when user already has XP (skipped welcome)', () => {
      expect(
        needsWelcomeSetup(createProfile({ onboarding_completed_at: null, xp_points: 160 })),
      ).toBe(false);
    });
  });

  describe('profileHasPriorEngagement', () => {
    it('returns true when xp_points is positive', () => {
      expect(profileHasPriorEngagement(createProfile({ xp_points: 1 }))).toBe(true);
    });

    it('returns false when xp_points is null or zero', () => {
      expect(profileHasPriorEngagement(createProfile({ xp_points: null }))).toBe(false);
      expect(profileHasPriorEngagement(createProfile({ xp_points: 0 }))).toBe(false);
    });
  });

  describe('getWelcomeRedirectTarget', () => {
    it('defaults to /', () => {
      expect(getWelcomeRedirectTarget(new URLSearchParams())).toBe('/');
    });

    it('uses next query when safe relative path', () => {
      expect(getWelcomeRedirectTarget(new URLSearchParams('next=/mission'))).toBe('/mission');
    });

    it('rejects protocol-relative paths', () => {
      expect(getWelcomeRedirectTarget(new URLSearchParams('next=//evil.com'))).toBe('/');
    });
  });

  describe('getPostAuthPath', () => {
    it('redirects new users to /welcome with next param', () => {
      expect(getPostAuthPath(createProfile({ onboarding_completed_at: null }), '/mission')).toBe(
        '/welcome?next=%2Fmission',
      );
    });

    it('keeps engaged users without onboarding timestamp on requested path', () => {
      expect(
        getPostAuthPath(
          createProfile({ onboarding_completed_at: null, xp_points: 15 }),
          '/',
        ),
      ).toBe('/');
    });

    it('sends completed users to original destination', () => {
      expect(getPostAuthPath(createProfile({ onboarding_completed_at: '2026-01-01T00:00:00Z' }), '/mission')).toBe(
        '/mission',
      );
    });
  });

  describe('syncLearnerProfileAfterSignIn', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('always refetches profile from the server before navigation decisions', async () => {
      const fetchProfile = vi.fn().mockResolvedValue(undefined);
      const engaged = createProfile({ xp_points: 15, onboarding_completed_at: null });
      const updateEq = vi.fn().mockResolvedValue({ error: null });
      const update = vi.fn().mockReturnValue({ eq: updateEq });
      const supabase = await import('@/utils/supabase');
      vi.mocked(supabase.default.from).mockReturnValue({ update } as never);

      vi.mocked(authStore.useAuthStore.getState).mockReturnValue({
        fetchProfile,
        profile: engaged,
      });

      const result = await syncLearnerProfileAfterSignIn('user-1');

      expect(fetchProfile).toHaveBeenCalledWith('user-1');
      expect(result?.xp_points).toBe(15);
    });
  });
});
