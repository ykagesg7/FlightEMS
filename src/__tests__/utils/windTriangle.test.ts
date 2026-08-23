import { describe, expect, it } from 'vitest';
import { crosswindComponentKt, solveWindTriangle } from '../../utils/windTriangle';

describe('solveWindTriangle', () => {
  it('pure tailwind: GS = TAS + wind, WCA = 0', () => {
    const s = solveWindTriangle(250, 180, 0, 40);
    expect(s.unsolvable).toBe(false);
    expect(s.windCorrectionAngleDeg).toBeCloseTo(0, 5);
    expect(s.groundSpeedKt).toBeCloseTo(290, 5);
    expect(s.trueHeadingDeg).toBeCloseTo(180, 5);
  });

  it('pure headwind: GS = TAS - wind', () => {
    const s = solveWindTriangle(250, 0, 0, 40);
    expect(s.unsolvable).toBe(false);
    expect(s.groundSpeedKt).toBeCloseTo(210, 5);
    expect(s.windCorrectionAngleDeg).toBeCloseTo(0, 5);
  });

  it('right crosswind requires right crab and reduces GS', () => {
    const s = solveWindTriangle(250, 0, 90, 60);
    expect(s.unsolvable).toBe(false);
    expect(s.windCorrectionAngleDeg).toBeCloseTo((Math.asin(60 / 250) * 180) / Math.PI, 5);
    expect(s.trueHeadingDeg).toBeCloseTo(s.windCorrectionAngleDeg, 5);
    const expectedGs = 250 * Math.cos(Math.asin(60 / 250));
    expect(s.groundSpeedKt).toBeCloseTo(expectedGs, 5);
    expect(s.groundSpeedKt).toBeLessThan(250);
  });

  it('marks unsolvable when |crosswind| >= TAS', () => {
    const s = solveWindTriangle(100, 0, 90, 100);
    expect(s.unsolvable).toBe(true);
    expect(s.groundSpeedKt).toBeGreaterThanOrEqual(20);
  });
});

describe('crosswindComponentKt', () => {
  it('wind from 90°, track 0° is from the right (positive)', () => {
    expect(crosswindComponentKt(90, 30, 0)).toBeCloseTo(30, 5);
  });
});
