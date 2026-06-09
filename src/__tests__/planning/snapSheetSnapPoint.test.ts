import { describe, expect, it } from 'vitest';
import {
  computeSnapHeights,
  cycleSnap,
  getInitialSnap,
  resolveNearestSnap,
} from '../../pages/planning/components/map/snapSheetUtils';

describe('snapSheetUtils', () => {
  describe('getInitialSnap', () => {
    it('returns peek for single hit', () => {
      expect(getInitialSnap(1)).toBe('half');
    });

    it('returns peek for multiple hits', () => {
      expect(getInitialSnap(2)).toBe('peek');
      expect(getInitialSnap(5)).toBe('peek');
    });
  });

  describe('resolveNearestSnap', () => {
    const heights = computeSnapHeights(800, false);

    it('snaps to peek when closest to peek height', () => {
      expect(resolveNearestSnap(heights.peek + 5, heights)).toBe('peek');
    });

    it('snaps to half when closest to half height', () => {
      expect(resolveNearestSnap(heights.half, heights)).toBe('half');
    });

    it('snaps to full when closest to full height', () => {
      expect(resolveNearestSnap(heights.full - 10, heights)).toBe('full');
    });
  });

  describe('cycleSnap', () => {
    it('cycles up through snap points', () => {
      expect(cycleSnap('peek', 'up')).toBe('half');
      expect(cycleSnap('half', 'up')).toBe('full');
      expect(cycleSnap('full', 'up')).toBe('full');
    });

    it('cycles down through snap points', () => {
      expect(cycleSnap('full', 'down')).toBe('half');
      expect(cycleSnap('half', 'down')).toBe('peek');
      expect(cycleSnap('peek', 'down')).toBe('peek');
    });
  });

  describe('computeSnapHeights', () => {
    it('uses smaller half ratio on desktop', () => {
      const mobile = computeSnapHeights(1000, false);
      const desktop = computeSnapHeights(1000, true);

      expect(mobile.peek).toBe(108);
      expect(desktop.peek).toBe(56);
      expect(mobile.half).toBe(380);
      expect(desktop.half).toBe(320);
      expect(mobile.full).toBe(520);
    });
  });
});
