import { describe, expect, it } from 'vitest';
import {
  isTokenValid,
  parseTokenResponse,
  tokenExpiresAtMs,
  TOKEN_REFRESH_MARGIN_SEC,
} from '../../../api/_lib/openskyOAuthToken';

describe('openskyOAuthToken', () => {
  it('parseTokenResponse returns cache entry with expiry', () => {
    const now = 1_000_000;
    const cache = parseTokenResponse({ access_token: 'abc', expires_in: 1800 }, now);
    expect(cache).toEqual({
      accessToken: 'abc',
      expiresAtMs: now + 1800 * 1000,
    });
  });

  it('parseTokenResponse returns null for invalid payload', () => {
    expect(parseTokenResponse(null, 0)).toBeNull();
    expect(parseTokenResponse({ expires_in: 100 }, 0)).toBeNull();
  });

  it('isTokenValid respects refresh margin', () => {
    const now = 10_000;
    const expiresAt = now + TOKEN_REFRESH_MARGIN_SEC * 1000 + 5000;
    expect(isTokenValid({ accessToken: 't', expiresAtMs: expiresAt }, now)).toBe(true);
    expect(
      isTokenValid(
        { accessToken: 't', expiresAtMs: now + TOKEN_REFRESH_MARGIN_SEC * 1000 - 1 },
        now
      )
    ).toBe(false);
  });

  it('tokenExpiresAtMs defaults to 1800s', () => {
    expect(tokenExpiresAtMs(100, undefined)).toBe(100 + 1800 * 1000);
  });
});
