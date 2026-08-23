import { describe, expect, it } from 'vitest';
import { calculateETA, calculateETE } from '../../utils/index';

describe('calculateETE', () => {
  it('returns minutes for distance / TAS', () => {
    expect(calculateETE(120, 240)).toBe(30);
    expect(calculateETE(0, 240)).toBe(0);
  });

  it('returns 0 when TAS is missing or zero', () => {
    expect(calculateETE(100, undefined)).toBe(0);
    expect(calculateETE(100, 0)).toBe(0);
  });
});

describe('calculateETA', () => {
  it('adds ETE within the same day', () => {
    expect(calculateETA('10:00', 90)).toBe('11:30');
  });

  it('wraps past midnight (23:00 + 120 min → 01:00)', () => {
    expect(calculateETA('23:00', 120)).toBe('01:00');
  });

  it('returns placeholder when departure or ETE is invalid', () => {
    expect(calculateETA(null, 60)).toBe('--:--');
    expect(calculateETA('10:00', 0)).toBe('--:--');
  });
});
