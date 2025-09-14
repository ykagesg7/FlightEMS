import { describe, it, expect } from 'vitest';
import { dmsToDd, ddToDms, parseDmsInput } from '../../utils/dms';

describe('DMS (Degrees, Minutes, Seconds) Utilities', () => {
  describe('dmsToDd', () => {
    it('should convert DMS to decimal degrees correctly', () => {
      // 北緯35度39分29秒 = 35.658056
      expect(dmsToDd(35, 39, 29, 'N')).toBeCloseTo(35.658056, 5);
      
      // 東経139度44分30秒 = 139.741667
      expect(dmsToDd(139, 44, 30, 'E')).toBeCloseTo(139.741667, 5);
      
      // 南緯45度30分15秒 = -45.504167
      expect(dmsToDd(45, 30, 15, 'S')).toBeCloseTo(-45.504167, 5);
      
      // 西経120度15分45秒 = -120.2625
      expect(dmsToDd(120, 15, 45, 'W')).toBeCloseTo(-120.2625, 5);
    });

    it('should handle zero values correctly', () => {
      expect(dmsToDd(0, 0, 0, 'N')).toBe(0);
      expect(dmsToDd(0, 0, 0, 'S')).toBe(0);
    });

    it('should handle edge cases correctly', () => {
      // 180度（最大経度）
      expect(dmsToDd(180, 0, 0, 'E')).toBe(180);
      expect(dmsToDd(180, 0, 0, 'W')).toBe(-180);
      
      // 90度（最大緯度）
      expect(dmsToDd(90, 0, 0, 'N')).toBe(90);
      expect(dmsToDd(90, 0, 0, 'S')).toBe(-90);
    });
  });

  describe('ddToDms', () => {
    it('should convert decimal degrees to DMS correctly', () => {
      // 35.658056 = 35°39'29"N
      const result1 = ddToDms(35.658056, true);
      expect(result1.degrees).toBe(35);
      expect(result1.minutes).toBe(39);
      expect(result1.seconds).toBeCloseTo(29, 0);
      expect(result1.direction).toBe('N');
      
      // 139.741667 = 139°44'30"E
      const result2 = ddToDms(139.741667, false);
      expect(result2.degrees).toBe(139);
      expect(result2.minutes).toBe(44);
      expect(result2.seconds).toBeCloseTo(30, 0);
      expect(result2.direction).toBe('E');
    });

    it('should handle negative values correctly', () => {
      // -45.504167 = 45°30'15"S
      const result1 = ddToDms(-45.504167, true);
      expect(result1.degrees).toBe(45);
      expect(result1.minutes).toBe(30);
      expect(result1.seconds).toBeCloseTo(15, 0);
      expect(result1.direction).toBe('S');
      
      // -120.2625 = 120°15'45"W
      const result2 = ddToDms(-120.2625, false);
      expect(result2.degrees).toBe(120);
      expect(result2.minutes).toBe(15);
      expect(result2.seconds).toBeCloseTo(45, 0);
      expect(result2.direction).toBe('W');
    });

    it('should handle zero correctly', () => {
      const result1 = ddToDms(0, true);
      expect(result1.degrees).toBe(0);
      expect(result1.minutes).toBe(0);
      expect(result1.seconds).toBe(0);
      expect(result1.direction).toBe('N');
      
      const result2 = ddToDms(0, false);
      expect(result2.degrees).toBe(0);
      expect(result2.minutes).toBe(0);
      expect(result2.seconds).toBe(0);
      expect(result2.direction).toBe('E');
    });
  });

  describe('parseDmsInput', () => {
    it('should parse various DMS input formats correctly', () => {
      // 標準的な形式
      expect(parseDmsInput("35°39'29\"N")).toEqual({
        degrees: 35,
        minutes: 39,
        seconds: 29,
        direction: 'N'
      });
      
      // スペースを含む形式
      expect(parseDmsInput("139 44 30 E")).toEqual({
        degrees: 139,
        minutes: 44,
        seconds: 30,
        direction: 'E'
      });
      
      // 混合形式
      expect(parseDmsInput("45°30'15S")).toEqual({
        degrees: 45,
        minutes: 30,
        seconds: 15,
        direction: 'S'
      });
    });

    it('should handle decimal seconds correctly', () => {
      expect(parseDmsInput("35°39'29.5\"N")).toEqual({
        degrees: 35,
        minutes: 39,
        seconds: 29.5,
        direction: 'N'
      });
    });

    it('should return null for invalid input', () => {
      expect(parseDmsInput("invalid")).toBeNull();
      expect(parseDmsInput("")).toBeNull();
      expect(parseDmsInput("35°")).toBeNull();
      expect(parseDmsInput("35°39'")).toBeNull();
    });

    it('should handle edge cases correctly', () => {
      // 最大値
      expect(parseDmsInput("180°0'0\"E")).toEqual({
        degrees: 180,
        minutes: 0,
        seconds: 0,
        direction: 'E'
      });
      
      expect(parseDmsInput("90°0'0\"N")).toEqual({
        degrees: 90,
        minutes: 0,
        seconds: 0,
        direction: 'N'
      });
    });
  });

  describe('round-trip conversion accuracy', () => {
    it('should maintain accuracy through DMS->DD->DMS conversion', () => {
      const testCases = [
        { deg: 35, min: 39, sec: 29, dir: 'N' as const },
        { deg: 139, min: 44, sec: 30, dir: 'E' as const },
        { deg: 45, min: 30, sec: 15, dir: 'S' as const },
        { deg: 120, min: 15, sec: 45, dir: 'W' as const }
      ];

      testCases.forEach(({ deg, min, sec, dir }) => {
        // DMS -> DD -> DMS
        const dd = dmsToDd(deg, min, sec, dir);
        const isLatitude = dir === 'N' || dir === 'S';
        const backToDms = ddToDms(dd, isLatitude);

        expect(backToDms.degrees).toBe(deg);
        expect(backToDms.minutes).toBe(min);
        expect(backToDms.seconds).toBeCloseTo(sec, 0);
        expect(backToDms.direction).toBe(dir);
      });
    });
  });

  describe('aviation-specific test cases', () => {
    it('should handle Japanese airport coordinates correctly', () => {
      // 羽田空港 (RJTT) - 35°33'11"N 139°46'53"E
      const hndLat = dmsToDd(35, 33, 11, 'N');
      const hndLon = dmsToDd(139, 46, 53, 'E');
      
      expect(hndLat).toBeCloseTo(35.553056, 5);
      expect(hndLon).toBeCloseTo(139.781389, 5);
      
      // 逆変換
      const backToLat = ddToDms(hndLat, true);
      const backToLon = ddToDms(hndLon, false);
      
      expect(backToLat.degrees).toBe(35);
      expect(backToLat.minutes).toBe(33);
      expect(backToLat.seconds).toBeCloseTo(11, 0);
      expect(backToLat.direction).toBe('N');
      
      expect(backToLon.degrees).toBe(139);
      expect(backToLon.minutes).toBe(46);
      expect(backToLon.seconds).toBeCloseTo(53, 0);
      expect(backToLon.direction).toBe('E');
    });

    it('should handle navigation waypoint coordinates correctly', () => {
      // 例：KAGOSHIMA NDB - 31°36'N 130°33'E
      const kagLat = dmsToDd(31, 36, 0, 'N');
      const kagLon = dmsToDd(130, 33, 0, 'E');
      
      expect(kagLat).toBeCloseTo(31.6, 5);
      expect(kagLon).toBeCloseTo(130.55, 5);
    });
  });
}); 