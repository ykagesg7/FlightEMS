import { describe, expect, it } from 'vitest';
import {
  computeProfileCompletion,
  resolveProfileSection,
} from '@/auth/profileCompletion';
import type { Profile } from '@/stores/authStore';

function createProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'user-1',
    username: '',
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

describe('profileCompletion', () => {
  it('returns 0 when profile is null', () => {
    const result = computeProfileCompletion({ profile: null });
    expect(result.percent).toBe(0);
    expect(result.nextAction).toBeNull();
  });

  it('computes weighted percent and next action', () => {
    const result = computeProfileCompletion({
      profile: createProfile({ username: 'pilot' }),
    });
    expect(result.percent).toBe(20);
    expect(result.completedFields).toContain('username');
    expect(result.nextAction?.id).toBe('avatar_url');
  });

  it('reaches 100 when all weighted fields complete', () => {
    const result = computeProfileCompletion({
      profile: createProfile({
        username: 'pilot',
        avatar_url: 'https://cdn/a.jpg',
        bio: 'PPL goal',
        website: 'https://example.com',
        social_links: { twitter: 'https://x.com/pilot' },
      }),
      hasNotificationSettings: true,
    });
    expect(result.percent).toBe(100);
    expect(result.nextAction).toBeNull();
  });
});

describe('resolveProfileSection', () => {
  it('maps legacy tab ids', () => {
    expect(resolveProfileSection('profile')).toBe('public');
    expect(resolveProfileSection('leaderboard')).toBe('leaderboard');
    expect(resolveProfileSection('ppl-ranks')).toBe('public');
    expect(resolveProfileSection(null)).toBe('public');
  });
});
