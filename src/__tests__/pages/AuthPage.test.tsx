import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import AuthPage from '@/pages/auth/AuthPage';
import type { AuthState } from '@/stores/authStore';
import * as authStore from '@/stores/authStore';

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

function createAuthState(overrides: Partial<AuthState> = {}): AuthState {
  return {
    user: null,
    profile: null,
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

describe('AuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ログインフォームのバリデーションとsignIn呼び出し', async () => {
    const signIn = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(authStore.useAuthStore).mockImplementation((selector) =>
      selector(createAuthState({ signIn })),
    );
    render(
      <BrowserRouter>
        <AuthPage />
      </BrowserRouter>,
    );
    fireEvent.change(screen.getByLabelText('メールアドレス'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('Google ボタンで signInWithGoogle を呼ぶ', async () => {
    const signInWithGoogle = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(authStore.useAuthStore).mockImplementation((selector) =>
      selector(createAuthState({ signInWithGoogle })),
    );
    render(
      <BrowserRouter>
        <AuthPage />
      </BrowserRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Google で続ける' }));
    await waitFor(() => {
      expect(signInWithGoogle).toHaveBeenCalled();
    });
  });

  it('Magic Link リンクで signInWithOtp を呼ぶ', async () => {
    const signInWithOtp = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(authStore.useAuthStore).mockImplementation((selector) =>
      selector(createAuthState({ signInWithOtp })),
    );
    render(
      <BrowserRouter>
        <AuthPage />
      </BrowserRouter>,
    );
    fireEvent.click(screen.getByText('メールリンクでログイン'));
    fireEvent.change(screen.getByLabelText('メールアドレス'), { target: { value: 'magic@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'ログインリンクを送信' }));
    await waitFor(() => {
      expect(signInWithOtp).toHaveBeenCalledWith('magic@example.com', undefined);
    });
  });

  it('新規登録フォームのバリデーションとsignUp呼び出し', async () => {
    const signUp = vi.fn().mockResolvedValue({ error: null, emailConfirmRequired: false });
    vi.mocked(authStore.useAuthStore).mockImplementation((selector) =>
      selector(createAuthState({ signUp })),
    );
    render(
      <BrowserRouter>
        <AuthPage />
      </BrowserRouter>,
    );
    fireEvent.click(screen.getByText('登録'));
    fireEvent.change(screen.getByLabelText('メールアドレス'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText('ユーザー名'), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('パスワード（確認）'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('登録'));
    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith('new@example.com', 'password123', 'newuser', undefined);
    });
  });

  it('パスワードリセットフォームのバリデーションとresetPassword呼び出し', async () => {
    const resetPassword = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(authStore.useAuthStore).mockImplementation((selector) =>
      selector(createAuthState({ resetPassword })),
    );
    render(
      <BrowserRouter>
        <AuthPage />
      </BrowserRouter>,
    );
    fireEvent.click(screen.getByText('パスワードを忘れた場合'));
    fireEvent.change(screen.getByLabelText('メールアドレス'), { target: { value: 'reset@example.com' } });
    fireEvent.click(screen.getByText('リセット手順を送信'));
    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith('reset@example.com', undefined);
    });
  });
});
