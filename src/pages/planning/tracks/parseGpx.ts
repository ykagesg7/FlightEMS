import type { TrackParseResult, TrackPoint } from './types';
import { buildFlightTrack } from './trackFactory';

function textContent(parent: Element, tagName: string): string | null {
  return parent.getElementsByTagName(tagName)[0]?.textContent?.trim() ?? null;
}

function metersToFeet(value: number): number {
  return value * 3.28084;
}

export function parseGpxTrack(text: string, filename = 'GPX Track', index = 0): TrackParseResult {
  const warnings: string[] = [];
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  const parserError = doc.getElementsByTagName('parsererror')[0];
  if (parserError) {
    throw new Error('GPXのXML解析に失敗しました');
  }

  const name = textContent(doc.documentElement, 'name') ?? filename.replace(/\.gpx$/i, '');
  const points: TrackPoint[] = Array.from(doc.getElementsByTagName('trkpt')).map((node) => {
    const latitude = Number(node.getAttribute('lat'));
    const longitude = Number(node.getAttribute('lon'));
    const time = textContent(node, 'time') ?? new Date().toISOString();
    const elevationMeters = Number(textContent(node, 'ele'));
    return {
      timestamp: new Date(time).toISOString(),
      latitude,
      longitude,
      altitudeFt: Number.isFinite(elevationMeters) ? metersToFeet(elevationMeters) : undefined,
      source: 'gpx',
    };
  });

  if (points.length === 0) {
    warnings.push('GPX内にtrkptが見つかりませんでした');
  }

  return {
    track: buildFlightTrack({ name, points, sourceFormat: 'gpx', index }),
    warnings,
  };
}
