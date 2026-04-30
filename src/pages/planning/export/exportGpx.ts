import type { FlightPlan } from '../../../types';
import { routeTrackPointsFromPlan } from './routePoints';
import type { FlightTrack, TrackPoint } from '../tracks/types';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function feetToMeters(value: number): number {
  return value / 3.28084;
}

function pointsToGpx(name: string, points: TrackPoint[]): string {
  const trkpts = points.map((point) => {
    const elevation = typeof point.altitudeFt === 'number' ? `<ele>${feetToMeters(point.altitudeFt).toFixed(1)}</ele>` : '';
    return `      <trkpt lat="${point.latitude.toFixed(7)}" lon="${point.longitude.toFixed(7)}">${elevation}<time>${escapeXml(point.timestamp)}</time></trkpt>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Flight Academy" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>${escapeXml(name)}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>
`;
}

export function exportFlightTrackToGpx(track: FlightTrack): string {
  return pointsToGpx(track.name, track.points);
}

export function exportFlightPlanToGpx(plan: FlightPlan, name = 'Flight Academy Route'): string {
  return pointsToGpx(name, routeTrackPointsFromPlan(plan));
}
