import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import AuthPage from '@/pages/auth/AuthPage';
import type { AuthState } from '@/stores/authStore';
import * as authStore from '@/stores/authStore';

vi.mock('@/stores/authStore');

function createAuthState(overrides: Partial<AuthState> = {}): AuthState {
  return {
    user: null,
    profile: null,
    session: null,
    loading: false,
    initialized: true,
    setUser: vi.fn(),
    setProfile: vi.fn(),
    setSession: vi.fn(),
    setLoading: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    refreshSession: vi.fn(),
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
      expect(signUp).toHaveBeenCalledWith('new@example.com', 'password123', 'newuser');
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
      expect(resetPassword).toHaveBeenCalledWith('reset@example.com');
    });
  });
});
