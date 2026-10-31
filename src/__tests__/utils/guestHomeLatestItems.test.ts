import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { AUTH_STORAGE_KEY } from '../../auth/clearLocalAuthSession';
import {
  purgeInvalidAuthStorage,
  readStoredRefreshToken,
} from '../../auth/readStoredRefreshToken';

describe('readStoredRefreshToken', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('returns null when storage is empty', () => {
    expect(readStoredRefreshToken()).toBeNull();
  });

  it('reads refresh_token from top-level session JSON', () => {
    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ refresh_token: 'abc', access_token: 'x' }),
    );
    expect(readStoredRefreshToken()).toBe('abc');
  });

  it('reads refresh_token from currentSession wrapper', () => {
    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ currentSession: { refresh_token: 'nested' } }),
    );
    expect(readStoredRefreshToken()).toBe('nested');
  });

  it('purgeInvalidAuthStorage removes corrupt entries', () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, '{not-json');
    purgeInvalidAuthStorage();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it('purgeInvalidAuthStorage removes session without refresh_token', () => {
    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ access_token: 'only-access' }),
    );
    purgeInvalidAuthStorage();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });
});

describe('getGuestHomeLatestItems', () => {
  it('returns published lessons sorted by publishedAt desc', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-31T12:00:00+09:00'));

    const { getGuestHomeLatestItems } = await import('../../utils/guestHomeLatestItems');
    const items = await getGuestHomeLatestItems(5);

    expect(items.length).toBeGreaterThan(1);
    expect(items.length).toBeLessThanOrEqual(5);
    for (const item of items) {
      expect(item.href.startsWith('/articles/')).toBe(true);
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.date.slice(0, 10) <= '2026-10-31').toBe(true);
    }

    vi.useRealTimers();
  });
});
