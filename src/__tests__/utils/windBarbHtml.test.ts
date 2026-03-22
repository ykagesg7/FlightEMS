import { describe, expect, it } from 'vitest';
import { buildWindBarbDivHtml, windToRotationCssDeg } from '../../utils/windBarbHtml';

describe('windBarbHtml', () => {
  it('windToRotationCssDeg aligns SVG +x (east) with flow direction (wind from W → arrow east)', () => {
    expect(windToRotationCssDeg(270)).toBe(0);
  });

  it('buildWindBarbDivHtml contains rotation and speed', () => {
    const h = buildWindBarbDivHtml(200, 42, 40);
    expect(h).toContain('rotate(290deg)');
    expect(h).toContain('42');
  });
});
