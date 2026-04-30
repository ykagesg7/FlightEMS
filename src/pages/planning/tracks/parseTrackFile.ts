import { parseCsvTrack } from './parseCsv';
import { parseGpxTrack } from './parseGpx';
import { parseKmlTrack } from './parseKml';
import { extensionToTrackFormat } from './trackFactory';
import type { TrackParseResult } from './types';

export async function parseTrackFile(file: File, index = 0): Promise<TrackParseResult> {
  const text = await file.text();
  const format = extensionToTrackFormat(file.name);

  if (format === 'gpx') return parseGpxTrack(text, file.name, index);
  if (format === 'kml') return parseKmlTrack(text, file.name, index);
  if (format === 'csv') return parseCsvTrack(text, file.name, index);

  throw new Error('対応していない航跡ファイル形式です。GPX / KML / CSV を選択してください。');
}
