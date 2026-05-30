import { describe, expect, it } from 'vitest';
import { computePanByY } from '../../pages/planning/components/map/mapSelectionPanUtils';

describe('computePanByY', () => {
  it('returns 0 when point is above visible center', () => {
    expect(computePanByY(200, 800, 300)).toBe(0);
  });

  it('returns negative pan when point is below visible center', () => {
    const pan = computePanByY(350, 800, 300);
    expect(pan).toBeLessThan(0);
    expect(pan).toBe(-100);
  });

  it('clamps pan to 50% of bottom padding', () => {
    const pan = computePanByY(700, 800, 300);
    expect(pan).toBe(-150);
  });

  it('returns 0 for invalid dimensions', () => {
    expect(computePanByY(600, 0, 300)).toBe(0);
    expect(computePanByY(600, 800, 0)).toBe(0);
  });
});
