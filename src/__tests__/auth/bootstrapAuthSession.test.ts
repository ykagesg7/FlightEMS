import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isAuthCallbackPending } from '@/auth/authCallbackPending';
import { bootstrapAuthSession } from '@/auth/bootstrapAuthSession';
import * as authStore from '@/stores/authStore';

vi.mock('@/stores/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(),
  },
}));

describe('isAuthCallbackPending', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, hash: '', search: '', pathname: '/auth' },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('detects PKCE code in query string', () => {
    window.location.search = '?code=abc123';
    expect(isAuthCallbackPending()).toBe(true);
  });

  it('returns false on normal /auth', () => {
    window.location.search = '';
    expect(isAuthCallbackPending()).toBe(false);
  });
});

describe('bootstrapAuthSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        hash: '',
        search: '?code=oauth-code',
        pathname: '/auth',
      },
    });
  });

  it('does not call refreshSession during OAuth callback (avoids local signOut race)', async () => {
    const refreshSession = vi.fn();
    const setInitialized = vi.fn();
    const setLoading = vi.fn();

    vi.mocked(authStore.useAuthStore.getState).mockReturnValue({
      refreshSession,
      setInitialized,
      setLoading,
    } as never);

    await bootstrapAuthSession();

    expect(refreshSession).not.toHaveBeenCalled();
    expect(setInitialized).toHaveBeenCalledWith(true);
    expect(setLoading).toHaveBeenCalledWith(false);
  });
});
