import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../stores/authStore';
import type { Profile } from '../../stores/authStore';

// Zustandストアのモック
vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

const mockUseAuthStore = vi.mocked(useAuthStore);

describe('useAuth', () => {
  const mockAuthState = {
    user: null,
    profile: null,
    loading: false,
    initialized: true,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signInWithGoogle: vi.fn(),
    signInWithOtp: vi.fn(),
    signOut: vi.fn(),
    refreshSession: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockImplementation((selector) => selector(mockAuthState));
  });

  it('should return authentication state and actions', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current).toEqual({
      user: null,
      profile: null,
      loading: false,
      initialized: true,
      isAuthenticated: false,
      isLoading: false,
      signIn: expect.any(Function),
      signUp: expect.any(Function),
      signInWithGoogle: expect.any(Function),
      signInWithOtp: expect.any(Function),
      signOut: expect.any(Function),
      refreshSession: expect.any(Function),
    });
  });

  it('should return isAuthenticated as true when user exists', () => {
    const authStateWithUser = {
      ...mockAuthState,
      user: { id: '123', email: 'test@example.com' },
    };

    mockUseAuthStore.mockImplementation((selector) => selector(authStateWithUser));

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({ id: '123', email: 'test@example.com' });
  });

  it('should return isLoading as true when loading or not initialized', () => {
    const loadingAuthState = {
      ...mockAuthState,
      loading: true,
      initialized: false,
    };

    mockUseAuthStore.mockImplementation((selector) => selector(loadingAuthState));

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);
  });

  it('should call signIn function correctly', async () => {
    const mockSignIn = vi.fn().mockResolvedValue(undefined);
    const authStateWithSignIn = {
      ...mockAuthState,
      signIn: mockSignIn,
    };

    mockUseAuthStore.mockImplementation((selector) => selector(authStateWithSignIn));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });

    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password');
  });

  it('should call signUp, signOut, and refreshSession', async () => {
    const mockSignUp = vi.fn().mockResolvedValue({
      error: null,
      user: { id: 'u1' },
      emailConfirmRequired: false,
    });
    const mockSignOut = vi.fn().mockResolvedValue(undefined);
    const mockRefresh = vi.fn().mockResolvedValue(undefined);
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        ...mockAuthState,
        signUp: mockSignUp,
        signOut: mockSignOut,
        refreshSession: mockRefresh,
      })
    );

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp('a@b.com', 'pw', 'user');
    });
    expect(mockSignUp).toHaveBeenCalledWith('a@b.com', 'pw', 'user');

    await act(async () => {
      await result.current.signOut();
    });
    expect(mockSignOut).toHaveBeenCalled();

    await act(async () => {
      await result.current.refreshSession();
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('should expose profile from the store', () => {
    const profile = { id: 'p1', username: 'x' } as unknown as Profile;
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        ...mockAuthState,
        profile,
      })
    );
    const { result } = renderHook(() => useAuth());
    expect(result.current.profile).toEqual(profile);
  });

  it('should set isLoading true only when uninitialized even if loading is false', () => {
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        ...mockAuthState,
        loading: false,
        initialized: false,
      })
    );
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(true);
  });

  it('should set isLoading false when initialized and not loading', () => {
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        ...mockAuthState,
        loading: false,
        initialized: true,
      })
    );
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(false);
  });
});
