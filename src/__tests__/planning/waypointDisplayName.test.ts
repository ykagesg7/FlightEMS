import { describe, expect, it } from 'vitest';
import type { FlightPlan, Waypoint } from '../../types';
import {
  displayWaypointName,
  formatFallbackWaypointName,
  isInternalCustomWaypointId,
  resolveNavPointLabel,
} from '../../pages/planning/utils/waypointDisplayName';

describe('waypointDisplayName', () => {
  it('detects internal custom ids', () => {
    expect(isInternalCustomWaypointId('custom-1790987565970')).toBe(true);
    expect(isInternalCustomWaypointId('RJFA')).toBe(false);
  });

  it('formats fallback with index and short lat/lon', () => {
    expect(formatFallbackWaypointName(33.6381, 130.8067, 0)).toMatch(/^WP1 \(33\.64°N 130\.81°E\)$/);
  });

  it('prefers user display name over internal id', () => {
    const wp: Waypoint = {
      id: 'custom-1790987565970',
      name: '田川',
      type: 'custom',
      coordinates: [130.8067, 33.6381],
      latitude: 33.6381,
      longitude: 130.8067,
      nameEditable: true,
    };
    expect(displayWaypointName(wp, 0)).toBe('田川');
  });

  it('falls back when name equals internal custom id', () => {
    const wp: Waypoint = {
      id: 'custom-1790987565970',
      name: 'custom-1790987565970',
      type: 'custom',
      coordinates: [131.1881, 33.5981],
      latitude: 33.5981,
      longitude: 131.1881,
      nameEditable: true,
    };
    expect(displayWaypointName(wp, 1)).toBe(formatFallbackWaypointName(33.5981, 131.1881, 1));
  });

  it('resolveNavPointLabel uses waypoint list and TOC/TOD', () => {
    const plan = {
      departure: {
        value: 'RJFA',
        label: 'RJFA 芦屋',
        name: '芦屋',
        latitude: 33.8,
        longitude: 130.7,
        properties: { id: 'RJFA' },
      },
      arrival: {
        value: 'RJFZ',
        label: 'RJFZ 築城',
        name: '築城',
        latitude: 33.6,
        longitude: 131.0,
        properties: { id: 'RJFZ' },
      },
      waypoints: [
        {
          id: 'user-saved:abc-uuid',
          name: '中津',
          type: 'custom',
          coordinates: [131.1881, 33.5981],
          latitude: 33.5981,
          longitude: 131.1881,
          nameEditable: true,
        },
      ],
    } as Pick<FlightPlan, 'departure' | 'arrival' | 'waypoints'>;

    expect(resolveNavPointLabel(plan, 'TOC')).toBe('TOC');
    expect(resolveNavPointLabel(plan, 'RJFA')).toBe('RJFA 芦屋');
    expect(resolveNavPointLabel(plan, 'user-saved:abc-uuid')).toBe('中津');
  });
});
