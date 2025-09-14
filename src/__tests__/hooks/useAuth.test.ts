import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth, useRequireAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../stores/authStore';

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
});

describe('useRequireAuth', () => {
  const mockAuthState = {
    user: null,
    profile: null,
    loading: false,
    initialized: true,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    refreshSession: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return requiresAuth as true when not initialized', () => {
    const notInitializedState = {
      ...mockAuthState,
      initialized: false,
    };
    
    mockUseAuthStore.mockImplementation((selector) => selector(notInitializedState));

    const { result } = renderHook(() => useRequireAuth());

    expect(result.current.requiresAuth).toBe(true);
  });

  it('should return requiresAuth as true when not authenticated', () => {
    const notAuthenticatedState = {
      ...mockAuthState,
      user: null,
      initialized: true,
    };
    
    mockUseAuthStore.mockImplementation((selector) => selector(notAuthenticatedState));

    const { result } = renderHook(() => useRequireAuth());

    expect(result.current.requiresAuth).toBe(true);
  });

  it('should return requiresAuth as false when authenticated', () => {
    const authenticatedState = {
      ...mockAuthState,
      user: { id: '123', email: 'test@example.com' },
      initialized: true,
    };
    
    mockUseAuthStore.mockImplementation((selector) => selector(authenticatedState));

    const { result } = renderHook(() => useRequireAuth());

    expect(result.current.requiresAuth).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
  });
}); 