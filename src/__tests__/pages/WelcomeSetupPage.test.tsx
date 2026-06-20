import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import * as profileSetup from '@/auth/profileSetup';
import WelcomeSetupPage from '@/pages/welcome/WelcomeSetupPage';
import type { AuthState } from '@/stores/authStore';
import * as authStore from '@/stores/authStore';

vi.mock('@/stores/authStore');
vi.mock('@/auth/profileSetup', async (importOriginal) => {
  const actual = await importOriginal<typeof profileSetup>();
  return {
    ...actual,
    completeWelcomeSetup: vi.fn().mockResolvedValue({ error: null }),
  };
});
vi.mock('@/pages/profile/hooks/useNotificationSettings', () => ({
  useNotificationSettings: () => ({
    settings: {
      learning_reminder_enabled: true,
      new_content_enabled: true,
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

  it('ランキング参加はデフォルトで ON', () => {
    vi.mocked(authStore.useAuthStore).mockImplementation((selector) =>
      selector(createAuthState()),
    );

    renderWelcomeSetupPage();

    fireEvent.click(screen.getByRole('button', { name: 'スキップ' }));
    expect(screen.getByRole('checkbox', { name: 'ランキングに参加する' })).toBeChecked();
  });

  it('あとで設定するで completeWelcomeSetup を呼ぶ', async () => {
    vi.mocked(authStore.useAuthStore).mockImplementation((selector) =>
      selector(createAuthState()),
    );

    renderWelcomeSetupPage();

    fireEvent.click(screen.getByRole('button', { name: 'スキップ' }));

    await waitFor(() => {
      expect(profileSetup.completeWelcomeSetup).not.toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText('あとで設定する（ホームへ）'));

    await waitFor(() => {
      expect(profileSetup.completeWelcomeSetup).toHaveBeenCalledWith('user-1');
    });
  });
});
