import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPreferredScrollBehavior } from '@/utils/preferredScrollBehavior';

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? matches : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

describe('getPreferredScrollBehavior', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns smooth when reduced motion is off', () => {
    mockReducedMotion(false);
    expect(getPreferredScrollBehavior()).toBe('smooth');
  });

  it('returns auto when reduced motion is on', () => {
    mockReducedMotion(true);
    expect(getPreferredScrollBehavior()).toBe('auto');
  });
});