import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AuthPage from '@/pages/auth/AuthPage';
import type { AuthState, Profile } from '@/stores/authStore';
import * as authStore from '@/stores/authStore';
import * as mfaAuth from '@/auth/mfaAuth';
import * as profileSetup from '@/auth/profileSetup';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/stores/authStore');
vi.mock('@/pages/auth/hooks/useAuthCallback', () => ({
  useAuthCallback: vi.fn(),
}));
vi.mock('@/auth/passwordRecovery', () => ({
  isPasswordRecoveryActive: vi.fn(() => false),
}));
vi.mock('@/components/auth/TurnstileWidget', () => ({
  TurnstileWidget: () => null,
}));

function createProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'user-1',
    username: 'owner',
    email: 'owner@example.com',
    roll: 'Student',
    created_at: null,
    updated_at: null,
    full_name: null,
    avatar_url: null,
    website: null,
    rank: null,
    xp_points: 15,
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

function createAuthState(overrides: Partial<AuthState> = {}): AuthState {
  return {
    user: { id: 'user-1' } as AuthState['user'],
    profile: createProfile({ xp_points: null }),
    session: { access_token: 'token' } as AuthState['session'],
    loading: false,
    initialized: true,
    passwordRecoveryPending: false,
    setUser: vi.fn(),
    setProfile: vi.fn(),
    setSession: vi.fn(),
    setLoading: vi.fn(),
    setInitialized: vi.fn(),
    setPasswordRecoveryPending: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signInWithGoogle: vi.fn(),
    signInWithOtp: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    updatePasswordFromRecovery: vi.fn(),
    refreshSession: vi.fn(),
    ensureProfileAfterOAuth: vi.fn(),
    updateProfile: vi.fn(),
    fetchProfile: vi.fn(),
    createProfile: vi.fn(),
    ...overrides,
  };
}

describe('AuthPage post-login welcome redirect regression', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigateMock.mockReset();
    vi.spyOn(mfaAuth, 'shouldPromptLoginMfa').mockResolvedValue({
      required: false,
      factorId: null,
      error: null,
    });
  });

  it('does not send XP holders to /welcome after profile sync (Google OAuth path)', async () => {
    const engagedProfile = createProfile({ xp_points: 15, onboarding_completed_at: null });
    vi.spyOn(profileSetup, 'syncLearnerProfileAfterSignIn').mockResolvedValue(engagedProfile);

    vi.mocked(authStore.useAuthStore).mockImplementation((selector) =>
      selector(createAuthState()),
    );

    render(
      <MemoryRouter initialEntries={['/auth']}>
        <AuthPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(profileSetup.syncLearnerProfileAfterSignIn).toHaveBeenCalledWith('user-1');
    });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
    });
    expect(navigateMock).not.toHaveBeenCalledWith('/welcome?next=%2F', { replace: true });
  });

  it('still sends brand-new learners without XP to /welcome', async () => {
    const newProfile = createProfile({ xp_points: 0, onboarding_completed_at: null });
    vi.spyOn(profileSetup, 'syncLearnerProfileAfterSignIn').mockResolvedValue(newProfile);

    vi.mocked(authStore.useAuthStore).mockImplementation((selector) =>
      selector(createAuthState({ profile: newProfile })),
    );

    render(
      <MemoryRouter initialEntries={['/auth']} initialIndex={0}>
        <AuthPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/welcome?next=%2F', { replace: true });
    });
  });
});
