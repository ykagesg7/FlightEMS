import { describe, it, expect } from 'vitest';
import { pairToLngLat, extractGeometryFromDigitalNotamXml } from '../../../api/_lib/swimNotamGeometry';

describe('swimNotamGeometry.pairToLngLat', () => {
  it('interprets AIXM-style lat lon for Japan when only lat-lon order fits', () => {
    /** ~Tokyo-ish lat lon */
    expect(pairToLngLat(35.5, 139.7)).toEqual([139.7, 35.5]);
  });

  it('interprets lon lat when only that order fits', () => {
    expect(pairToLngLat(139.7, 35.5)).toEqual([139.7, 35.5]);
  });

  it('returns null for non-finite or out-of-domain pairs', () => {
    expect(pairToLngLat(NaN, 139)).toBeNull();
    expect(pairToLngLat(0, 0)).toBeNull();
  });
});

describe('swimNotamGeometry.extractGeometryFromDigitalNotamXml', () => {
  it('extracts Point from single pos in Japan', () => {
    const xml = '<ns:pos>35.5 139.7</ns:pos>';
    const g = extractGeometryFromDigitalNotamXml(xml);
    expect(g?.type).toBe('Point');
    if (g?.type === 'Point') {
      expect(g.coordinates).toEqual([139.7, 35.5]);
    }
  });

  it('returns undefined when no usable geometry', () => {
    expect(extractGeometryFromDigitalNotamXml('<root/>')).toBeUndefined();
  });
});
