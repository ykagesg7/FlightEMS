import { describe, expect, it } from 'vitest';
import { calculateAirspeeds, calculateCASFromTASPrecise } from '../../utils/index';

describe('calculateAirspeeds', () => {
  it('returns TAS ≈ CAS at sea level ISA (CAS 250)', () => {
    const result = calculateAirspeeds(250, 0, 15, 0);
    expect(result).not.toBeNull();
    expect(result!.tasKt).toBeGreaterThan(240);
    expect(result!.tasKt).toBeLessThan(270);
    expect(result!.mach).toBeGreaterThan(0.3);
    expect(result!.mach).toBeLessThan(0.5);
  });

  it('returns TAS substantially higher than CAS at FL300 ISA (CAS 250)', () => {
    const result = calculateAirspeeds(250, 30_000, 15, 0);
    expect(result).not.toBeNull();
    // Density ratio at FL300 ISA is ~0.37; TAS ≈ EAS / sqrt(σ) ≈ 1.6× CAS
    expect(result!.tasKt).toBeGreaterThan(380);
    expect(result!.tasKt).toBeLessThan(450);
    expect(result!.tasKt / 250).toBeGreaterThan(1.5);
    expect(result!.mach).toBeGreaterThan(0.6);
    expect(result!.mach).toBeLessThan(0.85);
  });

  it('ISA+15 at elevation 0 raises SAT and TAS vs ISA at FL300', () => {
    const isa = calculateAirspeeds(250, 30_000, 15, 0);
    const hot = calculateAirspeeds(250, 30_000, 30, 0);
    expect(isa).not.toBeNull();
    expect(hot).not.toBeNull();
    expect(hot!.satK).toBeGreaterThan(isa!.satK);
    expect(hot!.tasKt).toBeGreaterThan(isa!.tasKt);
  });

  it('round-trips CAS → TAS → CAS at FL300', () => {
    const forward = calculateAirspeeds(250, 30_000, 15, 0);
    expect(forward).not.toBeNull();
    const back = calculateCASFromTASPrecise(forward!.tasKt, 30_000, 15, 0);
    expect(back).not.toBeNull();
    expect(back!).toBeCloseTo(250, 0);
  });
});
