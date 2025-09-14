import { describe, it, expect } from 'vitest';
import { calculateMagneticBearing } from '../../utils/bearing';

describe('Bearing Utils', () => {
  describe('calculateMagneticBearing', () => {
    it('calculates bearing between two points', () => {
      // 東京から大阪への方位（概算）
      const tokyoLat = 35.6762;
      const tokyoLng = 139.6503;
      const osakaLat = 34.6937;
      const osakaLng = 135.5023;

      const bearing = calculateMagneticBearing(tokyoLat, tokyoLng, osakaLat, osakaLng);
      expect(bearing).toBeGreaterThan(0);
      expect(bearing).toBeLessThan(360);
    });

    it('calculates bearing for north direction', () => {
      const bearing = calculateMagneticBearing(0, 0, 1, 0);
      expect(bearing).toBeCloseTo(8, 1); // 磁気偏差8度を考慮
    });

    it('calculates bearing for east direction', () => {
      const bearing = calculateMagneticBearing(0, 0, 0, 1);
      expect(bearing).toBeCloseTo(98, 1); // 90 + 8度
    });

    it('calculates bearing for south direction', () => {
      const bearing = calculateMagneticBearing(0, 0, -1, 0);
      expect(bearing).toBeCloseTo(188, 1); // 180 + 8度
    });

    it('calculates bearing for west direction', () => {
      const bearing = calculateMagneticBearing(0, 0, 0, -1);
      expect(bearing).toBeCloseTo(278, 1); // 270 + 8度
    });

    it('handles same coordinates', () => {
      const bearing = calculateMagneticBearing(35.6762, 139.6503, 35.6762, 139.6503);
      expect(bearing).toBe(8); // 磁気偏差8度
    });

    it('handles antipodal points', () => {
      const bearing = calculateMagneticBearing(0, 0, 0, 180);
      // 対蹠点の場合、方位は定義されないが、関数は値を返す
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
