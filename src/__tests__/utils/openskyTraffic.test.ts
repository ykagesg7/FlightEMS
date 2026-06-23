import { describe, expect, it } from 'vitest';
import {
  bboxToPointRadiusNm,
  buildAirplanesLiveUrl,
  filterAircraftToBBox,
  intersectWithJapanBBox,
  JAPAN_BBOX,
  MAX_TRAFFIC_RADIUS_NM,
  parseAirplanesLiveAircraft,
  parseAirplanesLiveJson,
  parseOpenSkyStatesJson,
  parseStateVector,
  quantizeBoundsForTrafficCache,
  toOpenSkyBboxParams,
} from '../../utils/openskyTraffic';

describe('openskyTraffic', () => {
  it('quantizeBoundsForTrafficCache rounds outward', () => {
    const box = { south: 35.12, west: 139.08, north: 36.22, east: 140.31 };
    expect(quantizeBoundsForTrafficCache(box)).toEqual({
      south: 35,
      west: 139,
      north: 36.5,
      east: 140.5,
    });
  });

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

describe('airplanes.live mapping', () => {
  it('bboxToPointRadiusNm returns center and clamped radius', () => {
    const box = { south: 35, west: 139, north: 36, east: 140 };
    const r = bboxToPointRadiusNm(box);
    expect(r.lat).toBeCloseTo(35.5, 5);
    expect(r.lon).toBeCloseTo(139.5, 5);
    expect(r.radiusNm).toBeGreaterThan(0);
    expect(r.radiusNm).toBeLessThanOrEqual(MAX_TRAFFIC_RADIUS_NM);
  });

  it('bboxToPointRadiusNm clamps very wide bbox to API max', () => {
    const r = bboxToPointRadiusNm(JAPAN_BBOX);
    expect(r.radiusNm).toBe(MAX_TRAFFIC_RADIUS_NM);
  });

  it('buildAirplanesLiveUrl builds point/lat/lon/radius path', () => {
    const url = buildAirplanesLiveUrl({ south: 35, west: 139, north: 36, east: 140 });
    expect(url).toMatch(/\/v2\/point\/35\.5000\/139\.5000\/\d+$/);
  });

  it('parseAirplanesLiveAircraft maps fields and converts units', () => {
    const raw = {
      hex: '~89ABCD',
      flight: 'ANA123  ',
      lat: 35.5,
      lon: 139.5,
      alt_baro: 10000,
      alt_geom: 10500,
      gs: 250,
      track: 90,
      seen_pos: 5,
    };
    const p = parseAirplanesLiveAircraft(raw, 1000);
    expect(p).not.toBeNull();
    expect(p!.icao24).toBe('89abcd');
    expect(p!.callsign).toBe('ANA123');
    expect(p!.onGround).toBe(false);
    expect(p!.baroAltitudeM).toBeCloseTo(10000 * 0.3048, 3);
    expect(p!.velocityMs).toBeCloseTo(250 * 0.514444, 3);
    expect(p!.trueTrackDeg).toBe(90);
    expect(p!.lastContact).toBe(995);
  });

  it('parseAirplanesLiveAircraft treats ground and uses true_heading fallback', () => {
    const p = parseAirplanesLiveAircraft(
      { hex: 'abc123', alt_baro: 'ground', true_heading: 149, lat: 35, lon: 139 },
      1000
    );
    expect(p!.onGround).toBe(true);
    expect(p!.baroAltitudeM).toBeNull();
    expect(p!.trueTrackDeg).toBe(149);
  });

  it('parseAirplanesLiveJson normalizes ms now and parses ac array', () => {
    const r = parseAirplanesLiveJson({
      now: 1700000000000,
      ac: [{ hex: 'a1', lat: 36, lon: 140, alt_baro: 5000, gs: 100, track: 10 }],
    });
    expect(r.time).toBe(1700000000);
    expect(r.states).toHaveLength(1);
    expect(r.states[0]!.icao24).toBe('a1');
  });

  it('filterAircraftToBBox keeps only aircraft inside the box', () => {
    const box = { south: 35, west: 139, north: 36, east: 140 };
    const inside = parseAirplanesLiveAircraft({ hex: 'in', lat: 35.5, lon: 139.5 }, 1)!;
    const outside = parseAirplanesLiveAircraft({ hex: 'out', lat: 40, lon: 145 }, 1)!;
    const r = filterAircraftToBBox([inside, outside], box);
    expect(r).toHaveLength(1);
    expect(r[0]!.icao24).toBe('in');
  });
});
