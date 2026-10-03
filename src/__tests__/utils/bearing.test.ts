import { describe, it, expect } from 'vitest';
import { calculateMagneticBearing } from '../../utils/bearing';

describe('Bearing Utils', () => {
  describe('calculateMagneticBearing', () => {
    it('calculates bearing between two points', () => {
      const tokyoLat = 35.6762;
      const tokyoLng = 139.6503;
      const osakaLat = 34.6937;
      const osakaLng = 135.5023;

      const bearing = calculateMagneticBearing(tokyoLat, tokyoLng, osakaLat, osakaLng);
      expect(bearing).toBeGreaterThan(0);
      expect(bearing).toBeLessThan(360);
    });

    it('calculates bearing for north direction with explicit variation', () => {
      const bearing = calculateMagneticBearing(0, 0, 1, 0, 8);
      expect(bearing).toBeCloseTo(8, 1);
    });

    it('calculates bearing for east direction with explicit variation', () => {
      const bearing = calculateMagneticBearing(0, 0, 0, 1, 8);
      expect(bearing).toBeCloseTo(98, 1);
    });

    it('calculates bearing for south direction with explicit variation', () => {
      const bearing = calculateMagneticBearing(0, 0, -1, 0, 8);
      expect(bearing).toBeCloseTo(188, 1);
    });

    it('calculates bearing for west direction with explicit variation', () => {
      const bearing = calculateMagneticBearing(0, 0, 0, -1, 8);
      expect(bearing).toBeCloseTo(278, 1);
    });

    it('handles same coordinates (true bearing 0 + leg variation)', () => {
      const bearing = calculateMagneticBearing(35.6762, 139.6503, 35.6762, 139.6503);
      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThan(360);
    });

    it('handles antipodal points', () => {
      const bearing = calculateMagneticBearing(0, 0, 0, 180);
      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThanOrEqual(360);
    });

    it('calculates bearing across international date line', () => {
      const bearing = calculateMagneticBearing(0, 179, 0, -179);
      expect(bearing).toBeGreaterThan(0);
      expect(bearing).toBeLessThan(360);
    });
  });
});
