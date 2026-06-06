import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import PasswordRecoveryPage from '@/pages/auth/PasswordRecoveryPage';
import type { AuthState } from '@/stores/authStore';
import * as authStore from '@/stores/authStore';

vi.mock('@/stores/authStore');
vi.mock('@/pages/auth/hooks/useAuthCallback', () => ({
  useAuthCallback: vi.fn(),
}));
vi.mock('@/auth/passwordRecovery', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/auth/passwordRecovery')>();
  return {
    ...actual,
    isPasswordRecoveryActive: vi.fn(() => true),
    clearPasswordRecoveryPending: vi.fn(),
  };
});

function createAuthState(overrides: Partial<AuthState> = {}): AuthState {
  return {
    user: null,
    profile: null,
    session: null,
    loading: false,
    initialized: true,
    passwordRecoveryPending: true,
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

describe('PasswordRecoveryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('新パスワードフォームから updatePasswordFromRecovery を呼ぶ', async () => {
    const updatePasswordFromRecovery = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(authStore.useAuthStore).mockImplementation((selector) =>
      selector(createAuthState({
        session: { user: { id: 'u1' } } as AuthState['session'],
        updatePasswordFromRecovery,
      })),
    );
    render(
      <BrowserRouter>
        <PasswordRecoveryPage />
      </BrowserRouter>,
    );
    expect(screen.getByText('新しいパスワードを設定')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('新しいパスワード'), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByLabelText('新しいパスワード（確認）'), { target: { value: 'newpass123' } });
    fireEvent.click(screen.getByRole('button', { name: 'パスワードを保存' }));
    await waitFor(() => {
      expect(updatePasswordFromRecovery).toHaveBeenCalledWith('newpass123');
    });
  });
});
