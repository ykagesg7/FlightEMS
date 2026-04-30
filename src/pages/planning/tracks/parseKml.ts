import type { TrackParseResult, TrackPoint } from './types';
import { buildFlightTrack } from './trackFactory';

function textContent(parent: Element | Document, tagName: string): string | null {
  return parent.getElementsByTagName(tagName)[0]?.textContent?.trim() ?? null;
}

function metersToFeet(value: number): number {
  return value * 3.28084;
}

function parseCoordinateTuple(tuple: string): { longitude: number; latitude: number; altitudeFt?: number } | null {
  const [lonRaw, latRaw, altRaw] = tuple.trim().split(',');
  const longitude = Number(lonRaw);
  const latitude = Number(latRaw);
  const altitudeMeters = Number(altRaw);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return {
    latitude,
    longitude,
    altitudeFt: Number.isFinite(altitudeMeters) ? metersToFeet(altitudeMeters) : undefined,
  };
}

export function parseKmlTrack(text: string, filename = 'KML Track', index = 0): TrackParseResult {
  const warnings: string[] = [];
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  const parserError = doc.getElementsByTagName('parsererror')[0];
  if (parserError) {
    throw new Error('KMLのXML解析に失敗しました');
  }

  const name = textContent(doc, 'name') ?? filename.replace(/\.kml$/i, '');
  const when = Array.from(doc.getElementsByTagName('when')).map((node) => node.textContent?.trim() ?? '');
  const gxCoords = Array.from(doc.getElementsByTagName('gx:coord'));
  const points: TrackPoint[] = [];

  if (gxCoords.length > 0) {
    gxCoords.forEach((node, idx) => {
      const [lonRaw, latRaw, altRaw] = (node.textContent ?? '').trim().split(/\s+/);
      const longitude = Number(lonRaw);
      const latitude = Number(latRaw);
      const altitudeMeters = Number(altRaw);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
      points.push({
        timestamp: new Date(when[idx] || Date.now() + idx * 1000).toISOString(),
        latitude,
        longitude,
        altitudeFt: Number.isFinite(altitudeMeters) ? metersToFeet(altitudeMeters) : undefined,
        source: 'kml',
      });
    });
  } else {
    const coordinates = textContent(doc, 'coordinates');
    if (coordinates) {
      coordinates
        .split(/\s+/)
        .map(parseCoordinateTuple)
        .filter((point): point is NonNullable<typeof point> => Boolean(point))
        .forEach((point, idx) => {
          points.push({
            timestamp: new Date(Date.now() + idx * 1000).toISOString(),
            latitude: point.latitude,
            longitude: point.longitude,
            altitudeFt: point.altitudeFt,
            source: 'kml',
          });
        });
      warnings.push('LineString KMLには時刻が無いため、仮の時刻を付与しました');
    }
  }

  if (points.length === 0) {
    warnings.push('KML内に航跡座標が見つかりませんでした');
  }

  return {
    track: buildFlightTrack({ name, points, sourceFormat: 'kml', index }),
    warnings,
  };
}
