import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getDevApiBase } from '../../utils/devApiBase';

describe('getDevApiBase', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_VERCEL_DEV_API_ORIGIN', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('returns empty string when env is unset or blank', () => {
    expect(getDevApiBase()).toBe('');
    vi.stubEnv('VITE_VERCEL_DEV_API_ORIGIN', '   ');
    expect(getDevApiBase()).toBe('');
  });

  it('trims trailing slash from a valid origin', () => {
    vi.stubEnv('VITE_VERCEL_DEV_API_ORIGIN', 'http://example.com:3000/');
    expect(getDevApiBase()).toBe('http://example.com:3000');
  });

  it('aligns localhost page with 127.0.0.1 API host', () => {
    vi.stubEnv('VITE_VERCEL_DEV_API_ORIGIN', 'http://127.0.0.1:3000');
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      hostname: 'localhost',
    } as Location);
    expect(getDevApiBase()).toBe('http://localhost:3000');
  });

  it('aligns 127.0.0.1 page with localhost API host', () => {
    vi.stubEnv('VITE_VERCEL_DEV_API_ORIGIN', 'http://localhost:3000');
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      hostname: '127.0.0.1',
    } as Location);
    expect(getDevApiBase()).toBe('http://127.0.0.1:3000');
  });

  it('leaves base unchanged when URL parse fails', () => {
    vi.stubEnv('VITE_VERCEL_DEV_API_ORIGIN', 'not a valid url');
    expect(getDevApiBase()).toBe('not a valid url');
  });
});
