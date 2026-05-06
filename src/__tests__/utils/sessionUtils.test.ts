import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  generateSessionId,
  getSessionId,
  resetSessionId,
  getUserAgent,
  getAnonymousUserInfo,
  getLocalLikeState,
  setLocalLikeState,
  getLocalViewState,
  setLocalViewState,
} from '../../utils/sessionUtils';

const SESSION_KEY = 'flight_academy_session_id';

describe('sessionUtils', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('generateSessionId returns a session_* prefix and random suffix', () => {
    const id = generateSessionId();
    expect(id).toMatch(/^session_\d+_[a-z0-9]+$/);
  });

  it('getSessionId creates and persists a new id when missing', () => {
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    const a = getSessionId();
    const b = getSessionId();
    expect(a).toBe(b);
    expect(localStorage.getItem(SESSION_KEY)).toBe(a);
  });

  it('resetSessionId replaces stored session and returns new id', () => {
    const first = getSessionId();
    const second = resetSessionId();
    expect(second).not.toBe(first);
    expect(localStorage.getItem(SESSION_KEY)).toBe(second);
  });

  it('getUserAgent returns navigator.userAgent', () => {
    vi.stubGlobal('navigator', { userAgent: 'Vitest-UA/1.0' });
    expect(getUserAgent()).toBe('Vitest-UA/1.0');
  });

  it('getAnonymousUserInfo aggregates session, UA, and ISO timestamp', () => {
    vi.stubGlobal('navigator', { userAgent: 'UA' });
    const info = getAnonymousUserInfo();
    expect(info.userAgent).toBe('UA');
    expect(info.sessionId).toBeTruthy();
    expect(info.sessionId).toBe(localStorage.getItem(SESSION_KEY));
    expect(info.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('getLocalLikeState / setLocalLikeState round-trip', () => {
    expect(getLocalLikeState('c1')).toBe(false);
    setLocalLikeState('c1', true);
    expect(getLocalLikeState('c1')).toBe(true);
    setLocalLikeState('c1', false);
    expect(localStorage.getItem('like_c1')).toBeNull();
    expect(getLocalLikeState('c1')).toBe(false);
  });

  it('getLocalViewState / setLocalViewState', () => {
    expect(getLocalViewState('x')).toBe(false);
    setLocalViewState('x');
    expect(getLocalViewState('x')).toBe(true);
    expect(localStorage.getItem('viewed_x')).toBe('true');
  });
});
