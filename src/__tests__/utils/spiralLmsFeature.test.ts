import { describe, it, expect, vi, afterEach } from 'vitest';
import { isSpiralLmsFeatureEnabled } from '../../utils/spiralLmsFeature';

describe('isSpiralLmsFeatureEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is false when flag unset in dev', () => {
    vi.stubEnv('MODE', 'development');
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_SPIRAL_LMS_ENABLED', '');
    expect(isSpiralLmsFeatureEnabled()).toBe(false);
  });

  it('is true in dev when VITE_SPIRAL_LMS_ENABLED=true', () => {
    vi.stubEnv('MODE', 'development');
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_SPIRAL_LMS_ENABLED', 'true');
    expect(isSpiralLmsFeatureEnabled()).toBe(true);
  });

  it('is false in production even when env is set', () => {
    vi.stubEnv('MODE', 'production');
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_SPIRAL_LMS_ENABLED', 'true');
    expect(isSpiralLmsFeatureEnabled()).toBe(false);
  });
});
