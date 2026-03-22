import { describe, expect, it } from 'vitest';
import { approxGeopotentialFeetIsaFromPressureHpa } from '../../utils/pressureAltitudeIsa';

describe('pressureAltitudeIsa', () => {
  it('returns ~31k ft for 300 hPa (ISA approx)', () => {
    const ft = approxGeopotentialFeetIsaFromPressureHpa(300);
    expect(ft).toBeGreaterThan(30_000);
    expect(ft).toBeLessThan(32_000);
  });

  it('returns 0 for invalid pressure', () => {
    expect(approxGeopotentialFeetIsaFromPressureHpa(0)).toBe(0);
    expect(approxGeopotentialFeetIsaFromPressureHpa(2000)).toBe(0);
    expect(approxGeopotentialFeetIsaFromPressureHpa(Number.NaN)).toBe(0);
  });
});
