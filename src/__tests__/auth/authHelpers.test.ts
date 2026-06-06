import { describe, expect, it } from 'vitest';
import type { User } from '@supabase/supabase-js';
import { deriveOAuthUsername } from '@/auth/deriveOAuthUsername';
import { mapAuthErrorToMessage } from '@/auth/authErrorMessages';

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

describe('mapAuthErrorToMessage', () => {
  it('maps known auth error codes', () => {
    const error = { message: 'raw', code: 'invalid_credentials' } as import('@supabase/supabase-js').AuthError;
    expect(mapAuthErrorToMessage(error, 'fallback')).toContain('パスワード');
  });

  it('uses fallback when code is unknown', () => {
    expect(mapAuthErrorToMessage(new Error('x'), 'fallback')).toBe('x');
  });
});
