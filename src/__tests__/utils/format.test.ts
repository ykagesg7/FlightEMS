import { describe, expect, it } from 'vitest';
import { formatBearing, formatDistance } from '../../utils/format';
import { formatTime } from '../../utils/index';

describe('Format Utils', () => {
  describe('formatTime', () => {
    it('formats minutes to HH:MM format', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(60)).toBe('01:00');
      expect(formatTime(90)).toBe('01:30');
      expect(formatTime(120)).toBe('02:00');
      expect(formatTime(1440)).toBe('24:00');
    });

    it('handles negative values', () => {
      expect(formatTime(-30)).toBe('-1:-30');
    });

    it('handles large values', () => {
      expect(formatTime(2880)).toBe('48:00');
    });
  });

  describe('formatDistance', () => {
    it('formats distance values', () => {
      expect(formatDistance(0)).toBe('0');
      expect(formatDistance(1)).toBe('1');
      expect(formatDistance(10.5)).toBe('11');
      expect(formatDistance(100)).toBe('100');
    });

    it('handles negative values', () => {
      expect(formatDistance(-5)).toBe('-5');
    });
  });

  describe('formatBearing', () => {
    it('formats bearing values', () => {
      expect(formatBearing(0)).toBe('000');
      expect(formatBearing(90)).toBe('090');
      expect(formatBearing(180)).toBe('180');
      expect(formatBearing(270)).toBe('270');
      expect(formatBearing(360)).toBe('360');
    });

    it('handles decimal values', () => {
      expect(formatBearing(45.5)).toBe('046');
      expect(formatBearing(90.7)).toBe('091');
    });

    it('handles negative values', () => {
      expect(formatBearing(-45)).toBe('-45');
      expect(formatBearing(-90)).toBe('-90');
    });

    it('handles values over 360', () => {
      expect(formatBearing(450)).toBe('450');
      expect(formatBearing(720)).toBe('720');
    });
  });
});
