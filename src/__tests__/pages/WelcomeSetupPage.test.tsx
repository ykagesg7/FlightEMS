import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import * as profileSetup from '@/auth/profileSetup';
import WelcomeSetupPage from '@/pages/welcome/WelcomeSetupPage';
import type { AuthState } from '@/stores/authStore';
import * as authStore from '@/stores/authStore';
import * as cohortApi from '@/utils/cohortApi';

vi.mock('@/stores/authStore');
vi.mock('@/auth/profileSetup', async (importOriginal) => {
  const actual = await importOriginal<typeof profileSetup>();
  return {
    ...actual,
    completeWelcomeSetup: vi.fn().mockResolvedValue({ error: null }),
  };
});
vi.mock('@/utils/cohortApi', () => ({
  upsertUserCohort: vi.fn().mockResolvedValue({
    data: { cohort_key: 'CPL-2026-12' },
    error: null,
  }),
}));
vi.mock('@/utils/pushNotifications', () => ({
  registerPushSubscriptionIfAllowed: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/pages/profile/hooks/useNotificationSettings', () => ({
  useNotificationSettings: () => ({
    settings: {
      learning_reminder_enabled: true,
      new_content_enabled: true,
      mission_update_enabled: true,
      email_notifications_enabled: false,
      notification_time: '09:00:00',
    },
    isLoading: false,
    saveSettings: vi.fn().mockResolvedValue({ error: null }),
    toggleSetting: vi.fn(),
    updateSetting: vi.fn(),
  }),
}));
vi.mock('@/utils/importOAuthAvatar', () => ({
  importOAuthAvatarIfAvailable: vi.fn().mockResolvedValue({ avatarUrl: null, error: null }),
}));

function createAuthState(overrides: Partial<AuthState> = {}): AuthState {
  return {
    user: { id: 'user-1' } as AuthState['user'],
    profile: {
      id: 'user-1',
      username: 'pilot',
      email: 'pilot@example.com',
      roll: 'Student',
      onboarding_completed_at: null,
      leaderboard_opt_in: false,
      leaderboard_display_name: null,
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
    updateProfile: vi.fn().mockResolvedValue({ error: null }),
    fetchProfile: vi.fn(),
    createProfile: vi.fn(),
    ...overrides,
  };
}

function renderWelcomeSetupPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/welcome?next=/']}>
        <WelcomeSetupPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('WelcomeSetupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ランキング参加はデフォルトで ON', async () => {
    vi.mocked(authStore.useAuthStore).mockImplementation((selector) =>
      selector(createAuthState()),
    );
    vi.mocked(cohortApi.upsertUserCohort).mockResolvedValue({
      data: { cohort_key: 'CPL-UNDECIDED' },
      error: null,
    });

    renderWelcomeSetupPage();

    fireEvent.click(screen.getByRole('button', { name: 'スキップ' }));
    fireEvent.click(screen.getByLabelText('受験日未定'));
    fireEvent.click(screen.getByRole('button', { name: '次へ' }));

    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'ランキング・バッジを公開する' })).toBeChecked();
    });
  });

  it('デフォルトの試験年月で cohort を保存できる', async () => {
    vi.mocked(authStore.useAuthStore).mockImplementation((selector) =>
      selector(createAuthState()),
    );
    vi.mocked(cohortApi.upsertUserCohort).mockResolvedValue({
      data: { cohort_key: 'CPL-2026-06' },
      error: null,
    });

    renderWelcomeSetupPage();
    fireEvent.click(screen.getByRole('button', { name: 'スキップ' }));
    fireEvent.click(screen.getByRole('button', { name: '次へ' }));

    await waitFor(() => {
      expect(cohortApi.upsertUserCohort).toHaveBeenCalledWith(
        expect.objectContaining({
          license: 'CPL',
          undecided: false,
          examYm: expect.stringMatching(/^\d{4}-\d{2}$/),
        }),
      );
    });
  });

  it('受験日未定で cohort を保存できる', async () => {
    vi.mocked(authStore.useAuthStore).mockImplementation((selector) =>
      selector(createAuthState()),
    );
    vi.mocked(cohortApi.upsertUserCohort).mockResolvedValue({
      data: { cohort_key: 'CPL-UNDECIDED' },
      error: null,
    });

    renderWelcomeSetupPage();
    fireEvent.click(screen.getByRole('button', { name: 'スキップ' }));
    fireEvent.click(screen.getByLabelText('受験日未定'));
    fireEvent.click(screen.getByRole('button', { name: '次へ' }));

    await waitFor(() => {
      expect(cohortApi.upsertUserCohort).toHaveBeenCalledWith({
        license: 'CPL',
        examYm: null,
        undecided: true,
      });
    });
  });

  it('あとで設定するで completeWelcomeSetup を呼ぶ', async () => {
    vi.mocked(authStore.useAuthStore).mockImplementation((selector) =>
      selector(createAuthState()),
    );
    vi.mocked(cohortApi.upsertUserCohort).mockResolvedValue({
      data: { cohort_key: 'CPL-UNDECIDED' },
      error: null,
    });

    renderWelcomeSetupPage();

    fireEvent.click(screen.getByRole('button', { name: 'スキップ' }));
    fireEvent.click(screen.getByLabelText('受験日未定'));
    fireEvent.click(screen.getByRole('button', { name: '次へ' }));

    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'ランキング・バッジを公開する' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'スキップ' }));
    fireEvent.click(screen.getByRole('button', { name: 'スキップ' }));

    await waitFor(() => {
      expect(profileSetup.completeWelcomeSetup).toHaveBeenCalledWith('user-1');
    });
  });
});
