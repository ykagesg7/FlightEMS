import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  profileRequiresLoginMfa,
  shouldPromptLoginMfa,
  unenrollVerifiedMfaFactor,
  verifyMfaForSensitiveAction,
} from '@/auth/mfaAuth';
import type { Profile } from '@/stores/authStore';

const listFactorsMock = vi.fn();
const getAalMock = vi.fn();
const challengeMock = vi.fn();
const verifyMock = vi.fn();
const unenrollMock = vi.fn();
const refreshSessionMock = vi.fn();

vi.mock('@/utils/supabase', () => ({
  default: {
    auth: {
      mfa: {
        listFactors: (...args: unknown[]) => listFactorsMock(...args),
        getAuthenticatorAssuranceLevel: (...args: unknown[]) => getAalMock(...args),
        challenge: (...args: unknown[]) => challengeMock(...args),
        verify: (...args: unknown[]) => verifyMock(...args),
        unenroll: (...args: unknown[]) => unenrollMock(...args),
      },
      refreshSession: () => refreshSessionMock(),
    },
  },
}));

const baseProfile = {
  id: 'user-1',
  mfa_required_at_login: true,
} as Profile;

describe('mfaAuth', () => {
  beforeEach(() => {
    listFactorsMock.mockReset();
    getAalMock.mockReset();
    challengeMock.mockReset();
    verifyMock.mockReset();
    unenrollMock.mockReset();
    refreshSessionMock.mockReset();
  });

  describe('profileRequiresLoginMfa', () => {
    it('defaults to required when profile is null', () => {
      expect(profileRequiresLoginMfa(null)).toBe(false);
    });

    it('requires login MFA when flag is true', () => {
      expect(profileRequiresLoginMfa({ ...baseProfile, mfa_required_at_login: true })).toBe(true);
    });

    it('skips login MFA when flag is false', () => {
      expect(profileRequiresLoginMfa({ ...baseProfile, mfa_required_at_login: false })).toBe(false);
    });
  });

  describe('shouldPromptLoginMfa', () => {
    it('returns false when login MFA is disabled in profile', async () => {
      const result = await shouldPromptLoginMfa({ ...baseProfile, mfa_required_at_login: false });
      expect(result).toEqual({ required: false, factorId: null, error: null });
      expect(getAalMock).not.toHaveBeenCalled();
    });

    it('returns false when session is already AAL2', async () => {
      getAalMock.mockResolvedValue({
        data: { currentLevel: 'aal2', nextLevel: 'aal2' },
        error: null,
      });

      const result = await shouldPromptLoginMfa(baseProfile);
      expect(result).toEqual({ required: false, factorId: null, error: null });
    });

    it('requires MFA when AAL1 with verified TOTP and login MFA enabled', async () => {
      getAalMock.mockResolvedValue({
        data: { currentLevel: 'aal1', nextLevel: 'aal2' },
        error: null,
      });
      listFactorsMock.mockResolvedValue({
        data: {
          all: [{ id: 'factor-1', factor_type: 'totp', status: 'verified' }],
          totp: [],
        },
        error: null,
      });

      const result = await shouldPromptLoginMfa(baseProfile);
      expect(result).toEqual({ required: true, factorId: 'factor-1', error: null });
    });
  });

  it('verifyMfaForSensitiveAction refreshes session after verify', async () => {
    challengeMock.mockResolvedValue({ data: { id: 'challenge-1' }, error: null });
    verifyMock.mockResolvedValue({ data: {}, error: null });
    refreshSessionMock.mockResolvedValue({ data: {}, error: null });

    const result = await verifyMfaForSensitiveAction('factor-1', '123456');
    expect(result.error).toBeNull();
    expect(refreshSessionMock).toHaveBeenCalled();
  });

  it('unenrolls after verifying TOTP and refreshes session', async () => {
    challengeMock.mockResolvedValue({ data: { id: 'challenge-1' }, error: null });
    verifyMock.mockResolvedValue({ data: {}, error: null });
    unenrollMock.mockResolvedValue({ data: {}, error: null });
    refreshSessionMock.mockResolvedValue({ data: {}, error: null });

    const result = await unenrollVerifiedMfaFactor('factor-1', '123456');

    expect(result.error).toBeNull();
    expect(unenrollMock).toHaveBeenCalledWith({ factorId: 'factor-1' });
    expect(refreshSessionMock).toHaveBeenCalled();
  });
});
