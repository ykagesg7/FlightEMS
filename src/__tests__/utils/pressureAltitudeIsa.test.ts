import { describe, expect, it } from 'vitest';
import { approxGeopotentialFeetIsaFromPressureHpa } from '../../utils/pressureAltitudeIsa';

describe('pressureAltitudeIsa', () => {
  it('returns ~31k ft for 300 hPa (ISA approx)', () => {
    const ft = approxGeopotentialFeetIsaFromPressureHpa(300);
    expect(ft).toBeGreaterThan(30_000);
    expect(ft).toBeLessThan(32_000);
  });

  it('returns 0 when pressure at or above sea-level standard (no climb envelope)', () => {
    expect(approxGeopotentialFeetIsaFromPressureHpa(1013.25)).toBe(0);
    expect(approxGeopotentialFeetIsaFromPressureHpa(1020)).toBe(0);
  });

  it('returns ~1770 ft for 950 hPa (ISA approx, sanity below MSL standard)', () => {
    const ft = approxGeopotentialFeetIsaFromPressureHpa(950);
    expect(ft).toBeGreaterThan(1700);
    expect(ft).toBeLessThan(1850);
  });

  it('returns 0 for invalid pressure', () => {
    expect(approxGeopotentialFeetIsaFromPressureHpa(0)).toBe(0);
    expect(approxGeopotentialFeetIsaFromPressureHpa(2000)).toBe(0);
    expect(approxGeopotentialFeetIsaFromPressureHpa(Number.NaN)).toBe(0);
  });
});
