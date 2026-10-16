import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  isWebGlAvailable,
  prefersReducedMotion,
  shouldUseSpiralLms3dFallback,
} from '../../utils/spiralLms3dCapability';

describe('spiralLms3dCapability', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('prefersReducedMotion follows matchMedia', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    expect(prefersReducedMotion()).toBe(true);
  });

  it('shouldUseSpiralLms3dFallback when reduced motion', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    expect(shouldUseSpiralLms3dFallback()).toBe(true);
  });

  it('isWebGlAvailable is false when getContext returns null', () => {
    const canvas = {
      getContext: vi.fn().mockReturnValue(null),
    };
    vi.spyOn(document, 'createElement').mockReturnValue(canvas as HTMLCanvasElement);
    expect(isWebGlAvailable()).toBe(false);
    expect(shouldUseSpiralLms3dFallback()).toBe(true);
  });
});
