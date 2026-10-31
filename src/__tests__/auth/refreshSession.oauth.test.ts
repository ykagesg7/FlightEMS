import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isAuthCallbackPending } from '@/auth/authCallbackPending';
import * as clearSession from '@/auth/clearLocalAuthSession';
import { readStoredRefreshToken } from '@/auth/readStoredRefreshToken';
import supabase from '@/utils/supabase';
import { useAuthStore } from '@/stores/authStore';

vi.mock('@/auth/authCallbackPending', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/auth/authCallbackPending')>();
  return {
    ...actual,
    isAuthCallbackPending: vi.fn(),
  };
});

vi.mock('@/utils/supabase', () => ({
  default: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/auth/clearLocalAuthSession', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/auth/clearLocalAuthSession')>();
  return {
    ...actual,
    clearLocalAuthSession: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('@/auth/readStoredRefreshToken', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/auth/readStoredRefreshToken')>();
  return {
    ...actual,
    purgeInvalidAuthStorage: vi.fn(),
    readStoredRefreshToken: vi.fn(),
  };
});

vi.mock('@/auth/profileSetup', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/auth/profileSetup')>();
  return {
    ...actual,
    syncLearnerProfileAfterSignIn: vi.fn().mockResolvedValue(null),
  };
});

describe('refreshSession OAuth race regression', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    vi.mocked(isAuthCallbackPending).mockReturnValue(false);
    vi.mocked(readStoredRefreshToken).mockReturnValue(null);
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as never);
  });

  it('does not local signOut while OAuth callback params are still in the URL', async () => {
    vi.mocked(isAuthCallbackPending).mockReturnValue(true);

    await useAuthStore.getState().refreshSession();

    expect(clearSession.clearLocalAuthSession).not.toHaveBeenCalled();
    expect(supabase.auth.getSession).not.toHaveBeenCalled();
  });
});
