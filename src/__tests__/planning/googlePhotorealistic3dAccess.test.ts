import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  canUseGooglePhotorealistic3D,
  shouldShowGooglePhotorealistic3dProUpsell,
} from '../../pages/planning/components/flight/flightViewer3d/googlePhotorealistic3dAccess';

describe('googlePhotorealistic3dAccess', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('allows Pro users in production', () => {
    vi.stubEnv('DEV', false);
    expect(canUseGooglePhotorealistic3D(true)).toBe(true);
    expect(shouldShowGooglePhotorealistic3dProUpsell(true)).toBe(false);
  });

  it('blocks non-Pro users in production', () => {
    vi.stubEnv('DEV', false);
    expect(canUseGooglePhotorealistic3D(false)).toBe(false);
    expect(shouldShowGooglePhotorealistic3dProUpsell(false)).toBe(true);
  });

  it('allows non-Pro users in Vite dev', () => {
    vi.stubEnv('DEV', true);
    expect(canUseGooglePhotorealistic3D(false)).toBe(true);
    expect(shouldShowGooglePhotorealistic3dProUpsell(false)).toBe(false);
  });
});
