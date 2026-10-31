import { describe, expect, it } from 'vitest';
import { MARKETING_NAV, MARKETING_NAV_ITEMS } from '../../constants/marketingNavLabels';

describe('marketingNavLabels', () => {
  it('keeps desktop and mobile nav items on Japanese labels', () => {
    expect(MARKETING_NAV_ITEMS.map((item) => item.label)).toEqual([
      MARKETING_NAV.home,
      MARKETING_NAV.articles,
      MARKETING_NAV.planning,
      MARKETING_NAV.quiz,
      MARKETING_NAV.admin,
    ]);
    expect(MARKETING_NAV_ITEMS.every((item) => !/^[A-Z\s]+$/.test(item.label))).toBe(true);
  });
});
