import { describe, expect, it } from 'vitest';
import { parseCsvTrack } from '../../pages/planning/tracks/parseCsv';
import { parseGpxTrack } from '../../pages/planning/tracks/parseGpx';
import { parseKmlTrack } from '../../pages/planning/tracks/parseKml';
import { interpolateTrackPoint } from '../../pages/planning/tracks/interpolateTrack';
import { exportFlightTrackToGpx } from '../../pages/planning/export/exportGpx';

describe('flight track parsers', () => {
  it('parses GPX track points', () => {
    const result = parseGpxTrack(`<?xml version="1.0"?><gpx><trk><name>Test GPX</name><trkseg>
      <trkpt lat="35.0" lon="139.0"><ele>100</ele><time>2026-01-01T00:00:00Z</time></trkpt>
      <trkpt lat="35.1" lon="139.1"><ele>200</ele><time>2026-01-01T00:01:00Z</time></trkpt>
    </trkseg></trk></gpx>`);

    expect(result.track.name).toBe('Test GPX');
    expect(result.track.points).toHaveLength(2);
    expect(result.track.points[0].altitudeFt).toBeCloseTo(328.084, 2);
  });

  it('parses CSV with common column aliases', () => {
    const result = parseCsvTrack(`time,latitude,longitude,altitude_ft,ground_speed_kt,track_deg
2026-01-01T00:00:00Z,35,139,1000,120,90
2026-01-01T00:01:00Z,35.1,139.1,1100,121,91`);

    expect(result.track.points).toHaveLength(2);
    expect(result.track.points[1].groundSpeedKt).toBe(121);
  });

  it('parses KML LineString coordinates', () => {
    const result = parseKmlTrack(`<?xml version="1.0"?><kml><Document><name>Line</name><Placemark><LineString>
      <coordinates>139,35,100 139.1,35.1,200</coordinates>
    </LineString></Placemark></Document></kml>`);

    expect(result.track.name).toBe('Line');
    expect(result.track.points).toHaveLength(2);
    expect(result.warnings).toContain('LineString KMLには時刻が無いため、仮の時刻を付与しました');
  });

  it('interpolates a track point and exports GPX', () => {
    const result = parseCsvTrack(`timestamp,lat,lon
2026-01-01T00:00:00Z,35,139
2026-01-01T00:01:00Z,35.1,139.1`);
    const point = interpolateTrackPoint(result.track, new Date('2026-01-01T00:00:30Z').getTime());

    expect(point?.latitude).toBeCloseTo(35.05, 2);
    expect(exportFlightTrackToGpx(result.track)).toContain('<trkpt lat="35.0000000" lon="139.0000000">');
  });
});
