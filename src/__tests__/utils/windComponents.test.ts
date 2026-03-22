import { describe, expect, it } from 'vitest';
import { tailwindComponentKt } from '../../utils/windComponents';

describe('windComponents', () => {
  it('tailwindComponentKt: wind from north, track south => tailwind', () => {
    const c = tailwindComponentKt(360, 30, 180);
    expect(c).toBeCloseTo(30, 5);
  });

  it('tailwindComponentKt: wind from west, track north => crosswind ~0', () => {
    const c = tailwindComponentKt(270, 30, 360);
    expect(c).toBeCloseTo(0, 5);
  });

  it('tailwindComponentKt: wind from south, track north => tailwind (blows toward north)', () => {
    const c = tailwindComponentKt(180, 20, 360);
    expect(c).toBeCloseTo(20, 5);
  });

  it('tailwindComponentKt: wind from north, track north => headwind', () => {
    const c = tailwindComponentKt(360, 20, 360);
    expect(c).toBeCloseTo(-20, 5);
  });
});
