import { describe, expect, it } from 'vitest';
import type { Waypoint } from '../../types/index';
import {
  formatWaypointDegreeCoords,
  formatWaypointsGeoJsonCoordinates,
} from '../../utils/waypointCoords';

function makeWaypoint(lon: number, lat: number): Waypoint {
  return {
    id: 'test',
    name: 'Test',
    coordinates: [lon, lat],
    longitude: lon,
    latitude: lat,
  };
}

describe('waypointCoords', () => {
  describe('formatWaypointsGeoJsonCoordinates', () => {
    it('formats multiple waypoints as GeoJSON coordinate array', () => {
      const waypoints = [makeWaypoint(138.4617, 39.8861), makeWaypoint(137.2469, 39.5028)];
      expect(formatWaypointsGeoJsonCoordinates(waypoints)).toBe(
        `[
  [138.4617, 39.8861],
  [137.2469, 39.5028]
]`,
      );
    });

    it('returns empty array string for no waypoints', () => {
      expect(formatWaypointsGeoJsonCoordinates([])).toBe('[]');
    });
  });

  describe('formatWaypointDegreeCoords', () => {
    it('returns lon, lat with 4 decimals', () => {
      expect(formatWaypointDegreeCoords(makeWaypoint(138.4617, 39.8861))).toBe('138.4617, 39.8861');
    });
  });
});
