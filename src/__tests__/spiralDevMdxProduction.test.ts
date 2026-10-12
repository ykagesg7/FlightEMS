import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadDevMdxModule } from '../utils/spiralDevMdx';

describe('spiral dev MDX (production safety)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does not expose dev MDX loaders when DEV is false', () => {
    vi.stubEnv('DEV', false);
    expect(loadDevMdxModule('SPIRAL-DEV-MiniQuizSample')).toBeUndefined();
  });
});
