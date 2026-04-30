import type { TrackParseResult, TrackPoint } from './types';
import { buildFlightTrack } from './trackFactory';

type CsvRow = Record<string, string>;

const COLUMN_ALIASES = {
  timestamp: ['timestamp', 'time', 'datetime', 'date'],
  latitude: ['lat', 'latitude'],
  longitude: ['lon', 'lng', 'longitude'],
  altitude: ['altitude', 'alt', 'altitudeft', 'altitude_ft'],
  speed: ['speed', 'groundspeed', 'ground_speed', 'groundspeedkt', 'ground_speed_kt'],
  track: ['track', 'heading', 'course', 'trackdeg', 'track_deg'],
};

function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === ',' && !quoted) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getValue(row: CsvRow, aliases: string[]): string | undefined {
  return aliases.map(normalizeHeader).map((key) => row[key]).find((value) => value !== undefined && value !== '');
}

export function parseCsvTrack(text: string, filename = 'CSV Track', index = 0): TrackParseResult {
  const warnings: string[] = [];
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) {
    throw new Error('CSVにはヘッダー行とデータ行が必要です');
  }

  const headers = splitCsvLine(lines[0]).map(normalizeHeader);
  const rows = lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return headers.reduce<CsvRow>((row, header, columnIndex) => {
      row[header] = values[columnIndex] ?? '';
      return row;
    }, {});
  });

  const points: TrackPoint[] = rows.flatMap((row, rowIndex) => {
    const latRaw = getValue(row, COLUMN_ALIASES.latitude);
    const lonRaw = getValue(row, COLUMN_ALIASES.longitude);
    const latitude = Number(latRaw);
    const longitude = Number(lonRaw);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      warnings.push(`${rowIndex + 2}行目: 緯度/経度が不正なためスキップしました`);
      return [];
    }

    const timestampRaw = getValue(row, COLUMN_ALIASES.timestamp);
    const parsedTime = timestampRaw ? new Date(timestampRaw) : new Date(Date.now() + rowIndex * 1000);
    const safeTime = Number.isNaN(parsedTime.getTime()) ? new Date(Date.now() + rowIndex * 1000) : parsedTime;
    const altitudeFt = Number(getValue(row, COLUMN_ALIASES.altitude));
    const groundSpeedKt = Number(getValue(row, COLUMN_ALIASES.speed));
    const trackDeg = Number(getValue(row, COLUMN_ALIASES.track));

    return [{
      timestamp: safeTime.toISOString(),
      latitude,
      longitude,
      altitudeFt: Number.isFinite(altitudeFt) ? altitudeFt : undefined,
      groundSpeedKt: Number.isFinite(groundSpeedKt) ? groundSpeedKt : undefined,
      trackDeg: Number.isFinite(trackDeg) ? trackDeg : undefined,
      source: 'csv',
    }];
  });

  if (!headers.some((header) => COLUMN_ALIASES.timestamp.map(normalizeHeader).includes(header))) {
    warnings.push('timestamp列が無いため、仮の時刻を付与しました');
  }

  return {
    track: buildFlightTrack({ name: filename.replace(/\.csv$/i, ''), points, sourceFormat: 'csv', index }),
    warnings,
  };
}
