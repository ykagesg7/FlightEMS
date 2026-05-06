import { describe, it, expect } from 'vitest';
import { MAGNETIC_DECLINATION } from '../../utils/constants';

describe('constants', () => {
  it('exports Japan average magnetic declination in degrees', () => {
    expect(MAGNETIC_DECLINATION).toBe(8);
  });
});
