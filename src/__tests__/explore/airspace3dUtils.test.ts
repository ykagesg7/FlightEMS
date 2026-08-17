import { describe, expect, it } from 'vitest';
import { createAircraftGltfDataUri, headingDegToBillboardRotation, playbackHeadingToModelHeadingDeg } from '../../pages/explore/airspace3d/aircraftIcon';
import { collectionToRuntimes } from '../../pages/explore/airspace3d/airspaceVolumes';
import { buildPlanPlaybackPoints } from '../../pages/explore/airspace3d/buildPlanPlayback';
import { findOccupancy } from '../../pages/explore/airspace3d/findOccupancy';
import { parseAltitudeBandFt, parseFloorCeilingFt } from '../../pages/explore/airspace3d/parseAltitudeBand';
import { interpolatePlayback, ringIntersectsBBox } from '../../pages/explore/airspace3d/playbackTrack';
import { pointInAltitudeBand, pointInPolygonRing } from '../../pages/explore/airspace3d/pointInPolygon';
import { createInitialFlightPlan } from '../../pages/planning/createInitialFlightPlan';
import type { Airport } from '../../types';

describe('parseAltitudeBandFt', () => {
  it('parses SFC-FL350', () => {
    expect(parseAltitudeBandFt('SFC-FL350')).toEqual({ minFt: 0, maxFt: 35000 });
  });

  it('parses SFC-UNL with educational ceiling', () => {
    expect(parseAltitudeBandFt('SFC-UNL')).toEqual({ minFt: 0, maxFt: 60000 });
  });

  it('parses FL240-FL800', () => {
    expect(parseAltitudeBandFt('FL240-FL800')).toEqual({ minFt: 24000, maxFt: 80000 });
  });
});

describe('parseFloorCeilingFt', () => {
  it('returns null when both empty', () => {
    expect(parseFloorCeilingFt('', '')).toBeNull();
    expect(parseFloorCeilingFt(undefined, undefined)).toBeNull();
  });

  it('parses RAPCON 6,000ft–FL150', () => {
    expect(parseFloorCeilingFt('6,000ft', 'FL150')).toEqual({ minFt: 6000, maxFt: 15000 });
  });
});

describe('pointInPolygonRing', () => {
  const square: [number, number][] = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
    [0, 0],
  ];

  it('detects inside / outside', () => {
    expect(pointInPolygonRing({ lon: 0.5, lat: 0.5 }, square)).toBe(true);
    expect(pointInPolygonRing({ lon: 2, lat: 2 }, square)).toBe(false);
  });

  it('altitude band', () => {
    expect(pointInAltitudeBand(5000, 0, 10000)).toBe(true);
    expect(pointInAltitudeBand(15000, 0, 10000)).toBe(false);
  });
});

describe('interpolatePlayback', () => {
  it('heads east along a constant-latitude leg', () => {
    const pose = interpolatePlayback(
      [
        { lon: 130, lat: 34, altFt: 3000, tSec: 0 },
        { lon: 131, lat: 34, altFt: 5000, tSec: 100 },
      ],
      50,
    );
    expect(pose.lon).toBeCloseTo(130.5);
    expect(pose.altFt).toBeCloseTo(4000);
    expect(pose.headingDeg).toBeGreaterThan(80);
    expect(pose.headingDeg).toBeLessThan(100);
  });
});

describe('headingDegToBillboardRotation', () => {
  it('maps north to 0 and east to -90deg', () => {
    expect(headingDegToBillboardRotation(0)).toBeCloseTo(0);
    expect(headingDegToBillboardRotation(90)).toBeCloseTo(-Math.PI / 2);
  });
});

describe('playbackHeadingToModelHeadingDeg', () => {
  it('yaws -90deg so northbound +X is not east', () => {
    expect(playbackHeadingToModelHeadingDeg(0)).toBe(270);
    expect(playbackHeadingToModelHeadingDeg(90)).toBe(0);
  });
});

describe('createAircraftGltfDataUri', () => {
  it('returns a glTF data URI with Y-up wings', () => {
    const uri = createAircraftGltfDataUri();
    expect(uri.startsWith('data:model/gltf+json')).toBe(true);
    const json = decodeURIComponent(uri.replace('data:model/gltf+json;charset=utf-8,', ''));
    expect(json).toContain('-5.5');
    expect(json).toContain('"max":[8,2.4,5.5]');
  });
});

describe('buildPlanPlaybackPoints', () => {
  it('returns null without a route', () => {
    expect(buildPlanPlaybackPoints(createInitialFlightPlan())).toBeNull();
  });

  it('builds timed samples from segment speed and altitude', () => {
    const airport = (id: string, lat: number, lon: number): Airport => ({
      value: id,
      label: id,
      name: id,
      type: 'civilian',
      latitude: lat,
      longitude: lon,
    });
    const plan = {
      ...createInitialFlightPlan(),
      departure: airport('AAAA', 34, 130),
      arrival: airport('BBBB', 34, 131),
      routeSegments: [
        {
          from: 'AAAA',
          to: 'BBBB',
          speed: 360,
          bearing: 90,
          altitude: 9000,
          eta: '',
          distance: 60,
          groundSpeedKt: 360,
        },
      ],
    };
    const pts = buildPlanPlaybackPoints(plan);
    expect(pts).not.toBeNull();
    expect(pts!.length).toBeGreaterThan(2);
    expect(pts![0]!.altFt).toBe(0);
    expect(pts![pts!.length - 1]!.altFt).toBe(9000);
    expect(pts![pts!.length - 1]!.tSec).toBeCloseTo(600, 0);
  });
});

describe('findOccupancy', () => {
  const box = {
    id: 'rapcon:x',
    kind: 'rapcon' as const,
    label: 'RAPCON: 試験',
    ring: [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [0, 0],
    ] as [number, number][],
    minFt: 6000,
    maxFt: 15000,
    altitudeKnown: true,
  };

  it('requires both lateral and altitude', () => {
    expect(findOccupancy([box], 0.5, 0.5, 8000)).toEqual(['RAPCON: 試験']);
    expect(findOccupancy([box], 0.5, 0.5, 2000)).toEqual([]);
    expect(findOccupancy([box], 3, 3, 8000)).toEqual([]);
  });
});

describe('collectionToRuntimes', () => {
  it('skips RAPCON without floor/ceiling', () => {
    const runtimes = collectionToRuntimes(
      'rapcon',
      {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { Area_ID: '空', Floor: '', Ceiling: '' },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [130, 34],
                  [131, 34],
                  [131, 35],
                  [130, 35],
                  [130, 34],
                ],
              ],
            },
          },
        ],
      },
      { minLon: 129, minLat: 33, maxLon: 132, maxLat: 36 },
    );
    expect(runtimes).toHaveLength(0);
  });

  it('keeps RAPCON with altitude inside bbox', () => {
    const runtimes = collectionToRuntimes(
      'rapcon',
      {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { Area_ID: '鹿児島-2', Floor: '6,000ft', Ceiling: 'FL150' },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [130, 34],
                  [131, 34],
                  [131, 35],
                  [130, 35],
                  [130, 34],
                ],
              ],
            },
          },
        ],
      },
      { minLon: 129, minLat: 33, maxLon: 132, maxLat: 36 },
    );
    expect(runtimes).toHaveLength(1);
    expect(runtimes[0]!.minFt).toBe(6000);
    expect(runtimes[0]!.maxFt).toBe(15000);
  });
});

describe('ringIntersectsBBox', () => {
  it('rejects disjoint rings', () => {
    expect(
      ringIntersectsBBox(
        [
          [0, 0],
          [1, 0],
          [1, 1],
        ],
        { minLon: 10, minLat: 10, maxLon: 11, maxLat: 11 },
      ),
    ).toBe(false);
  });
});
