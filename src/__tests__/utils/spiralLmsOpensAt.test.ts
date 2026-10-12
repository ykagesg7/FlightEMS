import { describe, it, expect } from 'vitest';
import { isSpiralNodeOpensAtLocked } from '../../utils/spiralLmsOpensAt';

describe('isSpiralNodeOpensAtLocked', () => {
  const now = new Date('2026-10-12T12:00:00.000Z');

  it('returns false when opens_at is null', () => {
    expect(isSpiralNodeOpensAtLocked(null, now)).toBe(false);
  });

  it('returns true when opens_at is in the future', () => {
    expect(isSpiralNodeOpensAtLocked('2026-10-13T00:00:00.000Z', now)).toBe(true);
  });

  it('returns false when opens_at is in the past', () => {
    expect(isSpiralNodeOpensAtLocked('2026-10-11T00:00:00.000Z', now)).toBe(false);
  });

  it('returns false for invalid opens_at strings', () => {
    expect(isSpiralNodeOpensAtLocked('not-a-date', now)).toBe(false);
  });
});
