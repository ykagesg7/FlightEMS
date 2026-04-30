import type { FlightTrack, TrackPoint, TrackSourceFormat } from './types';

const TRACK_COLORS = ['#39FF14', '#38bdf8', '#f97316', '#e879f9', '#facc15', '#fb7185'];

export function createTrackId(prefix = 'track'): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function colorForTrackIndex(index: number): string {
  return TRACK_COLORS[index % TRACK_COLORS.length];
}

export function normalizeTrackPoints(points: TrackPoint[]): TrackPoint[] {
  return points
    .filter((point) =>
      Number.isFinite(point.latitude) &&
      Number.isFinite(point.longitude) &&
      Math.abs(point.latitude) <= 90 &&
      Math.abs(point.longitude) <= 180
    )
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function buildFlightTrack(args: {
  name: string;
  points: TrackPoint[];
  sourceFormat: TrackSourceFormat;
  color?: string;
  index?: number;
}): FlightTrack {
  const importedAt = new Date().toISOString();
  return {
    id: createTrackId(args.sourceFormat),
    name: args.name.trim() || `Track ${importedAt}`,
    color: args.color ?? colorForTrackIndex(args.index ?? 0),
    points: normalizeTrackPoints(args.points),
    importedAt,
    sourceFormat: args.sourceFormat,
    visible: true,
  };
}

export function extensionToTrackFormat(filename: string): TrackSourceFormat | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.gpx')) return 'gpx';
  if (lower.endsWith('.kml')) return 'kml';
  if (lower.endsWith('.csv')) return 'csv';
  if (lower.endsWith('.json')) return 'json';
  return null;
}
