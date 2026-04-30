import { describe, expect, it } from 'vitest';
import type { FlightPlan } from '../../types';
import { buildPreflightBriefing } from '../../pages/planning/briefing/buildPreflightBriefing';
import { exportFlightPlanToCsv } from '../../pages/planning/export/exportCsv';
import { exportFlightPlanToKml } from '../../pages/planning/export/exportKml';
import { analyzeTrackAgainstPlan } from '../../pages/planning/tracks/analyzePlanDeviation';
import { downsampleTrackPoints } from '../../pages/planning/tracks/downsampleTrack';
import { buildTrackStorageSummary } from '../../pages/planning/tracks/supabaseDebrief';
import type { FlightTrack, TrackPoint } from '../../pages/planning/tracks/types';

function createPlan(): FlightPlan {
  return {
    departure: {
      value: 'RJTT',
      label: 'Tokyo (RJTT)',
      name: 'Tokyo',
      type: 'civilian',
      latitude: 35,
      longitude: 139,
    },
    arrival: {
      value: 'RJAA',
      label: 'Narita (RJAA)',
      name: 'Narita',
      type: 'civilian',
      latitude: 35.8,
      longitude: 140.4,
    },
    waypoints: [],
    speed: 120,
    altitude: 4500,
    departureTime: '00:00',
    groundTempC: 15,
    groundElevationFt: 0,
    totalDistance: 80,
    ete: '00:40',
    eta: '00:40',
    tas: 120,
    mach: 0,
    routeSegments: [{
      from: 'RJTT',
      to: 'RJAA',
      speed: 120,
      bearing: 60,
      altitude: 4500,
      eta: '00:40',
      distance: 80,
      duration: '00:40',
      frequency: '118.1',
    }],
  };
}

function createTrack(points: TrackPoint[]): FlightTrack {
  return {
    id: 'track-1',
    name: 'Test Track',
    color: '#39FF14',
    points,
    importedAt: '2026-01-01T00:00:00Z',
    sourceFormat: 'csv',
    visible: true,
  };
}

describe('debrief utilities', () => {
  it('builds a preflight briefing from route and fuel data', () => {
    const briefing = buildPreflightBriefing(createPlan());

    expect(briefing.routeSummary.some((item) => item.label === '出発地' && item.value.includes('RJTT'))).toBe(true);
    expect(briefing.navLog[0].value).toContain('118.1');
  });

  it('downsamples large tracks while preserving endpoints', () => {
    const points = Array.from({ length: 5000 }, (_, index) => ({
      timestamp: new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString(),
      latitude: 35 + index * 0.0001,
      longitude: 139 + index * 0.0001,
    }));

    const downsampled = downsampleTrackPoints(points, 100);

    expect(downsampled).toHaveLength(100);
    expect(downsampled[0]).toBe(points[0]);
    expect(downsampled[downsampled.length - 1]).toBe(points[points.length - 1]);
  });

  it('analyzes plan deviation and storage altitude summary', () => {
    const track = createTrack([
      { timestamp: '2026-01-01T00:00:00Z', latitude: 35, longitude: 139, altitudeFt: 1000 },
      { timestamp: '2026-01-01T00:10:00Z', latitude: 35.4, longitude: 139.7, altitudeFt: 2000 },
      { timestamp: '2026-01-01T00:20:00Z', latitude: 35.8, longitude: 140.4, altitudeFt: 3000 },
    ]);

    const summary = analyzeTrackAgainstPlan(track, createPlan());
    const storageSummary = buildTrackStorageSummary(track);

    expect(summary.pointCount).toBe(3);
    expect(summary.averageCrossTrackNm).not.toBeNull();
    expect(storageSummary).toEqual({ minAltitudeFt: 1000, maxAltitudeFt: 3000 });
  });

  it('exports plan route as CSV and KML', () => {
    expect(exportFlightPlanToCsv(createPlan())).toContain('timestamp,lat,lon');
    expect(exportFlightPlanToKml(createPlan())).toContain('<LineString>');
  });
});
