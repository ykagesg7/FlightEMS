import { describe, expect, it } from 'vitest';
import { calculateTrueBearing, calculateMagneticBearing } from '../../utils/bearing';

describe('calculateTrueBearing', () => {
  it('is 0° for due north', () => {
    expect(calculateTrueBearing(0, 0, 1, 0)).toBeCloseTo(0, 1);
  });

  it('is 90° for due east', () => {
    expect(calculateTrueBearing(0, 0, 0, 1)).toBeCloseTo(90, 1);
  });
});

describe('calculateMagneticBearing', () => {
  it('adds the supplied variation', () => {
    expect(calculateMagneticBearing(0, 0, 1, 0, 8)).toBeCloseTo(8, 1);
    expect(calculateMagneticBearing(0, 0, 0, 1, 5)).toBeCloseTo(95, 1);
  });
});
