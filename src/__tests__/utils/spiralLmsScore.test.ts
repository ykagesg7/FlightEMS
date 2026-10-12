import { describe, it, expect } from 'vitest';
import { assertValidSpiralLmsScore, isValidSpiralLmsScore } from '../../utils/spiralLmsScore';
import { SpiralLmsRecordAttemptError } from '../../utils/spiralLmsRecordAttemptError';

describe('spiralLmsScore', () => {
  it('accepts finite scores from 0 to 100', () => {
    expect(isValidSpiralLmsScore(0)).toBe(true);
    expect(isValidSpiralLmsScore(100)).toBe(true);
    expect(isValidSpiralLmsScore(42.5)).toBe(true);
  });

  it('rejects non-finite and out-of-range scores', () => {
    expect(isValidSpiralLmsScore(Number.NaN)).toBe(false);
    expect(isValidSpiralLmsScore(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isValidSpiralLmsScore(-1)).toBe(false);
    expect(isValidSpiralLmsScore(100.0001)).toBe(false);
  });

  it('assertValidSpiralLmsScore throws invalid_score', () => {
    expect(() => assertValidSpiralLmsScore(200)).toThrow(SpiralLmsRecordAttemptError);
    try {
      assertValidSpiralLmsScore(200);
    } catch (error) {
      expect(error).toMatchObject({ kind: 'invalid_score' });
    }
  });
});
