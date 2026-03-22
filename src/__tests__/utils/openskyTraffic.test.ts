import { describe, expect, it } from 'vitest';
import {
  intersectWithJapanBBox,
  JAPAN_BBOX,
  parseOpenSkyStatesJson,
  parseStateVector,
  toOpenSkyBboxParams,
} from '../../utils/openskyTraffic';

describe('openskyTraffic', () => {
  it('intersectWithJapanBBox returns intersection inside Japan', () => {
    const inner = { south: 35, west: 139, north: 36, east: 140 };
    const r = intersectWithJapanBBox(inner);
    expect(r).toEqual(inner);
  });

  it('intersectWithJapanBBox clips map bounds to Japan', () => {
    const wide = { south: 30, west: 130, north: 40, east: 145 };
    const r = intersectWithJapanBBox(wide);
    expect(r).not.toBeNull();
    expect(r!.south).toBeGreaterThanOrEqual(JAPAN_BBOX.south);
    expect(r!.north).toBeLessThanOrEqual(JAPAN_BBOX.north);
    expect(r!.west).toBeGreaterThanOrEqual(JAPAN_BBOX.west);
    expect(r!.east).toBeLessThanOrEqual(JAPAN_BBOX.east);
  });

  it('intersectWithJapanBBox returns null when view is entirely outside Japan', () => {
    const outside = { south: 10, west: 100, north: 15, east: 105 };
    expect(intersectWithJapanBBox(outside)).toBeNull();
  });

  it('toOpenSkyBboxParams maps south/west/north/east to lamin/lomin/lamax/lomax', () => {
    const box = { south: 33, west: 130, north: 34, east: 131 };
    expect(toOpenSkyBboxParams(box)).toEqual({
      lamin: 33,
      lamax: 34,
      lomin: 130,
      lomax: 131,
    });
  });

  it('parseStateVector extracts aircraft with lat lon', () => {
    const row = [
      'abc123',
      'JAL123  ',
      'Japan',
      1234567890,
      1234567891,
      139.5,
      35.5,
      10000,
      false,
      200,
      90,
      0,
      null,
      10100,
      '1234',
      false,
      0,
    ];
    const p = parseStateVector(row);
    expect(p).not.toBeNull();
    expect(p!.icao24).toBe('abc123');
    expect(p!.callsign).toBe('JAL123');
    expect(p!.latitude).toBe(35.5);
    expect(p!.longitude).toBe(139.5);
    expect(p!.baroAltitudeM).toBe(10000);
    expect(p!.velocityMs).toBe(200);
    expect(p!.trueTrackDeg).toBe(90);
  });

  it('parseOpenSkyStatesJson parses states array', () => {
    const json = {
      time: 1,
      states: [
        ['a1', null, 'JP', null, 1, 140, 36, 5000, false, 150, null, null, null, null, null, false, 0],
      ],
    };
    const r = parseOpenSkyStatesJson(json);
    expect(r.time).toBe(1);
    expect(r.states).toHaveLength(1);
    expect(r.states[0]!.icao24).toBe('a1');
  });
});
