import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
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

function renderProtected(initialPath: string, requireAdmin = false) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/mission"
          element={
            <ProtectedRoute requireAdmin={requireAdmin}>
              <div>protected-content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<div>auth-page</div>} />
        <Route path="/" element={<div>home-page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated users to /auth', () => {
    vi.mocked(authStore.useAuthStore).mockImplementation((selector) =>
      selector(createAuthState()),
    );
    renderProtected('/mission');
    expect(screen.getByText('auth-page')).toBeInTheDocument();
  });

  it('renders children for authenticated users', () => {
    vi.mocked(authStore.useAuthStore).mockImplementation((selector) =>
      selector(
        createAuthState({
          user: { id: 'u1' } as AuthState['user'],
          profile: { roll: 'Student' } as AuthState['profile'],
        }),
      ),
    );
    renderProtected('/mission');
    expect(screen.getByText('protected-content')).toBeInTheDocument();
  });

  it('redirects non-admin users when requireAdmin is true', () => {
    vi.mocked(authStore.useAuthStore).mockImplementation((selector) =>
      selector(
        createAuthState({
          user: { id: 'u1' } as AuthState['user'],
          profile: { roll: 'Student' } as AuthState['profile'],
        }),
      ),
    );
    renderProtected('/mission', true);
    expect(screen.getByText('home-page')).toBeInTheDocument();
  });
});
