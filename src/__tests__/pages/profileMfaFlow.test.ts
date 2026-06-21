import { beforeEach, describe, expect, it, vi } from 'vitest';
import { unenrollVerifiedMfaFactor } from '@/auth/mfaAuth';

const challengeMock = vi.fn();
const verifyMock = vi.fn();
const unenrollMock = vi.fn();
const refreshSessionMock = vi.fn();

vi.mock('@/utils/supabase', () => ({
  default: {
    auth: {
      mfa: {
        challenge: (...args: unknown[]) => challengeMock(...args),
        verify: (...args: unknown[]) => verifyMock(...args),
        unenroll: (...args: unknown[]) => unenrollMock(...args),
      },
      refreshSession: () => refreshSessionMock(),
    },
  },
}));

describe('profileMfaFlow', () => {
  beforeEach(() => {
    challengeMock.mockReset();
    verifyMock.mockReset();
    unenrollMock.mockReset();
    refreshSessionMock.mockReset();
  });

  it('unenrolls after verifying TOTP and refreshes session', async () => {
    challengeMock.mockResolvedValue({ data: { id: 'challenge-1' }, error: null });
    verifyMock.mockResolvedValue({ data: {}, error: null });
    unenrollMock.mockResolvedValue({ data: {}, error: null });
    refreshSessionMock.mockResolvedValue({ data: {}, error: null });

    const result = await unenrollVerifiedMfaFactor('factor-1', '123456');

    expect(result.error).toBeNull();
    expect(challengeMock).toHaveBeenCalledWith({ factorId: 'factor-1' });
    expect(verifyMock).toHaveBeenCalledWith({
      factorId: 'factor-1',
      challengeId: 'challenge-1',
      code: '123456',
    });
    expect(unenrollMock).toHaveBeenCalledWith({ factorId: 'factor-1' });
    expect(refreshSessionMock).toHaveBeenCalled();
  });
});
