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

function pointsToKml(name: string, points: TrackPoint[]): string {
  const coordinates = points
    .map((point) => `${point.longitude.toFixed(7)},${point.latitude.toFixed(7)},${typeof point.altitudeFt === 'number' ? feetToMeters(point.altitudeFt).toFixed(1) : '0'}`)
    .join(' ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXml(name)}</name>
    <Placemark>
      <name>${escapeXml(name)}</name>
      <LineString>
        <tessellate>1</tessellate>
        <coordinates>${coordinates}</coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>
`;
}

export function exportFlightTrackToKml(track: FlightTrack): string {
  return pointsToKml(track.name, track.points);
}

export function exportFlightPlanToKml(plan: FlightPlan, name = 'Flight Academy Route'): string {
  return pointsToKml(name, routeTrackPointsFromPlan(plan));
}
