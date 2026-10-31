import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MarketingLayout } from '@/layouts/MarketingLayout';
import { MARKETING_NAV } from '@/constants/marketingNavLabels';

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('@/utils/isAdminUser', () => ({
  isAdminUser: () => false,
}));

import { useAuthStore } from '@/stores/authStore';
import type { AuthState } from '@/stores/authStore';

const mockUseAuthStore = vi.mocked(useAuthStore);

function createGuestAuthState(): AuthState {
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
  };
}

function mockAuthStore(state: AuthState) {
  mockUseAuthStore.mockImplementation(((selector?: (s: AuthState) => unknown) => {
    if (typeof selector === 'function') {
      return selector(state);
    }
    return state;
  }) as typeof useAuthStore);
}

function renderMarketingLayout() {
  const router = createMemoryRouter(
    [
      {
        element: <MarketingLayout />,
        children: [{ index: true, element: <div>Home body</div> }],
      },
    ],
    { initialEntries: ['/'] },
  );
  return render(<RouterProvider router={router} />);
}

describe('MarketingLayout header nav', () => {
  beforeEach(() => {
    mockAuthStore(createGuestAuthState());
  });

  it('uses Japanese labels in the mobile hamburger menu', async () => {
    const user = userEvent.setup();
    renderMarketingLayout();

    await user.click(screen.getByRole('button', { name: 'メニューを開く' }));

    const mobileNav = screen.getByRole('navigation', { name: 'Mobile main' });
    expect(mobileNav).toHaveTextContent(MARKETING_NAV.home);
    expect(mobileNav).toHaveTextContent(MARKETING_NAV.articles);
    expect(mobileNav).toHaveTextContent(MARKETING_NAV.planning);
    expect(mobileNav).toHaveTextContent(MARKETING_NAV.quiz);
    expect(mobileNav).not.toHaveTextContent('HOME');
    expect(mobileNav).not.toHaveTextContent('ARTICLES');
    expect(mobileNav).not.toHaveTextContent('PLANNING');
    expect(mobileNav).not.toHaveTextContent('QUIZ');
  });
});
