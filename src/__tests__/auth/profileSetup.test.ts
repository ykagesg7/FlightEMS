import { describe, expect, it } from 'vitest';
import {
  getPostAuthPath,
  getWelcomeRedirectTarget,
  needsWelcomeSetup,
} from '@/auth/profileSetup';
import type { Profile } from '@/stores/authStore';

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

    it('sends completed users to original destination', () => {
      expect(getPostAuthPath(createProfile({ onboarding_completed_at: '2026-01-01T00:00:00Z' }), '/mission')).toBe(
        '/mission',
      );
    });
  });
});
