import { describe, expect, it } from 'vitest';
import {
  NAVAID_RADIAL_MAX_NM,
  buildRadialPolyline,
  dmeLabelBearings,
  formatRadialLabel,
  listDmeRingNm,
  listRadialBearings,
  radialEndpoint,
  radialLabelDistancesNm,
} from '../../pages/planning/components/map/navaidRadialGridUtils';

describe('navaidRadialGridUtils', () => {
  it('lists 36 radials at 10° step', () => {
    const bearings = listRadialBearings(10);
    expect(bearings).toHaveLength(36);
    expect(bearings[0]).toBe(0);
    expect(bearings[35]).toBe(350);
  });

  it('lists DME rings to 100 nm', () => {
    expect(listDmeRingNm(10, 100)).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
  });

  it('builds radial polyline from origin to max nm', () => {
    const origin = { lat: 33.8872, lon: 130.6497 }; // AHT
    const line = buildRadialPolyline(origin, 0, NAVAID_RADIAL_MAX_NM, 10);
    expect(line[0]).toEqual([origin.lat, origin.lon]);
    expect(line).toHaveLength(1 + NAVAID_RADIAL_MAX_NM / 10);
    const end = line[line.length - 1]!;
    expect(end[0]).not.toBeCloseTo(origin.lat, 2);
  });

  it('formats radial labels as 3 digits', () => {
    expect(formatRadialLabel(0)).toBe('000');
    expect(formatRadialLabel(10)).toBe('010');
    expect(formatRadialLabel(350)).toBe('350');
  });

  it('radialEndpoint matches last polyline sample', () => {
    const origin = { lat: 33.8872, lon: 130.6497 };
    const line = buildRadialPolyline(origin, 90, 80, 10);
    const end = radialEndpoint(origin, 90, 80);
    const last = line[line.length - 1]!;
    expect(end.lat).toBeCloseTo(last[0]!, 8);
    expect(end.lon).toBeCloseTo(last[1]!, 8);
  });

  it('radialLabelDistancesNm: major vs minor vs dme-label bearings', () => {
    expect(radialLabelDistancesNm(0)).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
    expect(radialLabelDistancesNm(90)).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
    expect(radialLabelDistancesNm(20)).toEqual([50, 100]);
    expect(radialLabelDistancesNm(350)).toEqual([50, 100]);
    // DME ラベル用ラジアルには方位数字を置かない
    expect(radialLabelDistancesNm(10)).toEqual([]);
    expect(radialLabelDistancesNm(100)).toEqual([]);
    expect(radialLabelDistancesNm(190)).toEqual([]);
    expect(radialLabelDistancesNm(280)).toEqual([]);
  });

  it('dmeLabelBearings are offset from cardinals', () => {
    expect(dmeLabelBearings()).toEqual([10, 100, 190, 280]);
  });
});
