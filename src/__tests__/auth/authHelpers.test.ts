import { describe, expect, it, afterEach } from 'vitest';
import type { User } from '@supabase/supabase-js';
import { deriveOAuthUsername } from '@/auth/deriveOAuthUsername';
import { deriveOAuthAvatarUrl, deriveOAuthDisplayName } from '@/auth/deriveOAuthProfile';
import { mapAuthErrorToMessage } from '@/auth/authErrorMessages';
import {
  PASSWORD_RECOVERY_STORAGE_KEY,
  PASSWORD_RECOVERY_TTL_MS,
  clearPasswordRecoveryPending,
  isPasswordRecoveryActive,
  isPasswordRecoveryStored,
  markPasswordRecoveryPending,
  primePasswordRecoveryFromUrl,
} from '@/auth/passwordRecovery';
import { useAuthStore } from '@/stores/authStore';

describe('deriveOAuthUsername', () => {
  it('prefers username metadata', () => {
    const user = {
      email: 'pilot@example.com',
      user_metadata: { username: '  ace  ' },
    } as unknown as User;
    expect(deriveOAuthUsername(user)).toBe('ace');
  });

  it('falls back to full_name then email prefix', () => {
    expect(
      deriveOAuthUsername({
        email: 'pilot@example.com',
        user_metadata: { full_name: 'Test Pilot' },
      } as unknown as User),
    ).toBe('Test Pilot');

    expect(
      deriveOAuthUsername({
        email: 'pilot@example.com',
        user_metadata: {},
      } as unknown as User),
    ).toBe('pilot');
  });

  it('returns Learner when no hints exist', () => {
    expect(
      deriveOAuthUsername({
        email: null,
        user_metadata: {},
      } as unknown as User),
    ).toBe('Learner');
  });
});

describe('deriveOAuthProfile', () => {
  it('deriveOAuthAvatarUrl prefers avatar_url then picture', () => {
    expect(
      deriveOAuthAvatarUrl({
        user_metadata: { avatar_url: ' https://cdn/a.jpg ' },
      } as unknown as User),
    ).toBe('https://cdn/a.jpg');

    expect(
      deriveOAuthAvatarUrl({
        user_metadata: { picture: 'https://cdn/p.jpg' },
      } as unknown as User),
    ).toBe('https://cdn/p.jpg');

    expect(
      deriveOAuthAvatarUrl({ user_metadata: {} } as unknown as User),
    ).toBeNull();
  });

  it('deriveOAuthDisplayName prefers full_name then username fallback', () => {
    expect(
      deriveOAuthDisplayName({
        email: 'pilot@example.com',
        user_metadata: { full_name: 'Test Pilot' },
      } as unknown as User),
    ).toBe('Test Pilot');

    expect(
      deriveOAuthDisplayName({
        email: 'pilot@example.com',
        user_metadata: {},
      } as unknown as User),
    ).toBe('pilot');
  });
});

describe('mapAuthErrorToMessage', () => {
  it('maps known auth error codes', () => {
    const error = { message: 'raw', code: 'invalid_credentials' } as import('@supabase/supabase-js').AuthError;
    expect(mapAuthErrorToMessage(error, 'fallback')).toContain('パスワード');
  });

  it('uses fallback when code is unknown', () => {
    expect(mapAuthErrorToMessage(new Error('x'), 'fallback')).toBe('x');
  });
});

describe('passwordRecovery helpers', () => {
  afterEach(() => {
    clearPasswordRecoveryPending();
    sessionStorage.clear();
    useAuthStore.getState().setPasswordRecoveryPending(false);
  });

  it('marks and reads recovery pending from sessionStorage', () => {
    markPasswordRecoveryPending();
    expect(isPasswordRecoveryStored()).toBe(true);
    expect(useAuthStore.getState().passwordRecoveryPending).toBe(true);
    clearPasswordRecoveryPending();
    expect(isPasswordRecoveryStored()).toBe(false);
  });

  it('detects recovery type from URL hash on boot', () => {
    window.history.replaceState({}, '', '/#access_token=test&type=recovery');
    expect(primePasswordRecoveryFromUrl()).toBe(true);
    expect(Number(sessionStorage.getItem(PASSWORD_RECOVERY_STORAGE_KEY))).toBeGreaterThan(0);
  });

  it('does not treat a non-recovery token callback as recovery', () => {
    window.history.replaceState({}, '', '/auth#access_token=test&type=magiclink');
    expect(primePasswordRecoveryFromUrl()).toBe(false);
    expect(sessionStorage.getItem(PASSWORD_RECOVERY_STORAGE_KEY)).toBeNull();
  });

  it('does not treat a bare access_token hash as recovery', () => {
    window.history.replaceState({}, '', '/auth#access_token=test&refresh_token=r');
    expect(primePasswordRecoveryFromUrl()).toBe(false);
    expect(useAuthStore.getState().passwordRecoveryPending).toBe(false);
  });

  it('expires a stale pending flag', () => {
    const staleIssuedAt = Date.now() - PASSWORD_RECOVERY_TTL_MS - 1000;
    sessionStorage.setItem(PASSWORD_RECOVERY_STORAGE_KEY, String(staleIssuedAt));
    useAuthStore.getState().setPasswordRecoveryPending(true);

    expect(isPasswordRecoveryStored()).toBe(false);
    expect(isPasswordRecoveryActive()).toBe(false);
    expect(sessionStorage.getItem(PASSWORD_RECOVERY_STORAGE_KEY)).toBeNull();
  });

  it('discards the legacy "1" flag value', () => {
    sessionStorage.setItem(PASSWORD_RECOVERY_STORAGE_KEY, '1');
    expect(isPasswordRecoveryStored()).toBe(false);
  });
});
