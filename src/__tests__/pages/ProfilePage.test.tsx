import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import ProfilePage from '@/pages/profile/ProfilePage';
import type { AuthState } from '@/stores/authStore';
import * as authStore from '@/stores/authStore';

vi.mock('@/stores/authStore');
vi.mock('@/hooks/useCohortProfile', () => ({
  useCohortProfile: () => ({
    profile: null,
    invalidate: vi.fn(),
    isLoading: false,
    fetchError: null,
  }),
}));
vi.mock('@/utils/cohortApi', () => ({
  fetchLearningJourney: vi.fn().mockResolvedValue({
    journey: {
      license_target: 'CPL',
      stage: 'preparation',
      stage_order: 1,
      cohort_phase: 'active',
      target_test_date: null,
      article_comprehension_count: 0,
      delayed_retention_count: 0,
      srs_due_count: 0,
      mastered_subject_count: 0,
    },
    error: null,
  }),
}));

function renderProfilePage(initialEntry: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <ProfilePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
vi.mock('@/utils/supabase', () => ({
  default: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn(() => ({
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      })),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { identities: [] } }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      mfa: {
        listFactors: vi.fn().mockResolvedValue({ data: { totp: [], all: [] }, error: null }),
      },
    },
  },
}));

function createAuthState(overrides: Partial<AuthState> = {}): AuthState {
  return {
    user: { id: 'user-1', email: 'pilot@example.com' } as AuthState['user'],
    profile: {
      id: 'user-1',
      username: 'pilot',
      email: 'pilot@example.com',
      roll: 'Student',
      onboarding_completed_at: '2026-01-01',
      leaderboard_opt_in: true,
      leaderboard_display_name: null,
      created_at: null,
      updated_at: null,
      full_name: null,
      avatar_url: null,
      website: null,
      rank: null,
      xp_points: 100,
      social_links: null,
      bio: null,
      password_updated_at: null,
    },
    session: null,
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

describe('ProfilePage', () => {
  it('renders mobile section list on /profile without tab', () => {
    vi.mocked(authStore.useAuthStore).mockImplementation((selector) =>
      selector(createAuthState()),
    );

    renderProfilePage('/profile');

    expect(screen.getByRole('heading', { name: 'プロフィール', level: 1 })).toBeInTheDocument();
    expect(screen.getByTestId('profile-primary-focus')).toBeInTheDocument();
    expect(screen.getByTestId('profile-hub-section-list')).toBeInTheDocument();
    expect(screen.getByTestId('profile-hub-section-list')).toHaveTextContent('学習・受験');
    expect(screen.getByTestId('profile-hub-section-list')).toHaveTextContent('設定と履歴');
  });

  it('renders privacy leaderboard via legacy deep link', () => {
    vi.mocked(authStore.useAuthStore).mockImplementation((selector) =>
      selector(createAuthState()),
    );

    renderProfilePage('/profile?tab=leaderboard');

    expect(screen.getByText('学習者ランキング（任意参加）')).toBeInTheDocument();
    expect(screen.getByTestId('profile-hub-back')).toBeInTheDocument();
  });
});
