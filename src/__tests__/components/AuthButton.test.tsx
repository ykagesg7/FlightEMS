import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthButton } from '@/pages/auth/components/AuthButton';
import type { AuthState } from '@/stores/authStore';
import * as authStore from '@/stores/authStore';

vi.mock('@/stores/authStore');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

describe('AuthButton', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('ログイン状態で「ログアウト」ボタンが表示され、クリックでsignOutが呼ばれる', async () => {
    const mockSignOut = vi.fn();
    vi.mocked(authStore.useAuthStore).mockImplementation((selector) =>
      selector(
        createAuthState({
          user: { id: '1', email: 'test@example.com' } as AuthState['user'],
          profile: { id: '1', username: 'test', email: 'test@example.com' } as AuthState['profile'],
          session: { user: { id: '1' } } as AuthState['session'],
          signOut: mockSignOut,
        }),
      ),
    );
    render(
      <BrowserRouter>
        <AuthButton />
      </BrowserRouter>,
    );
    expect(screen.getByText('ログアウト')).toBeInTheDocument();
    fireEvent.click(screen.getByText('ログアウト'));
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('未ログイン状態で「ログイン」ボタンが表示され、クリックでnavigateが呼ばれる', () => {
    vi.mocked(authStore.useAuthStore).mockImplementation((selector) =>
      selector(
        createAuthState({
          user: null,
          profile: null,
          session: null,
          signOut: vi.fn(),
        }),
      ),
    );
    render(
      <BrowserRouter>
        <AuthButton />
      </BrowserRouter>,
    );
    expect(screen.getByText('ログイン')).toBeInTheDocument();
    fireEvent.click(screen.getByText('ログイン'));
    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });
});
